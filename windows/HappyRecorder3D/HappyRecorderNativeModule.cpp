#include "pch.h"
#include "HappyRecorderNativeModule.h"
#include <filesystem>
#include <fstream>
#include <sstream>

#pragma comment(lib, "mfplat.lib")
#pragma comment(lib, "mfreadwrite.lib")
#pragma comment(lib, "mfuuid.lib")
#pragma comment(lib, "d3d11.lib")
#pragma comment(lib, "dxgi.lib")
#pragma comment(lib, "mmdevapi.lib")

// Scoped to this .cpp only (not the header) -- see HappyRecorderNativeModule.h
// for why these can't live at header scope.
using namespace winrt::Windows::Graphics::Capture;
using namespace winrt::Windows::Graphics::DirectX::Direct3D11;
using namespace winrt::Windows::Media::Capture;
using namespace winrt::Windows::Media::MediaProperties;
using namespace winrt::Windows::Media::Audio;
using namespace winrt::Windows::Media::Devices;
using namespace winrt::Windows::Devices::Enumeration;
using namespace winrt::Windows::Storage;

namespace winrt::HappyRecorder3D::implementation
{
    HappyRecorderNativeModule::~HappyRecorderNativeModule()
    {
        CleanupMediaFoundation();
        if (m_captureState.captureSession)
        {
            m_captureState.captureSession.Close();
        }
        if (m_captureState.framePool)
        {
            m_captureState.framePool.Close();
        }
        MFShutdown();
    }

    void HappyRecorderNativeModule::Initialize(ReactContext const& reactContext) noexcept
    {
        m_reactContext = reactContext;
        MFStartup(MF_VERSION);
        
        std::filesystem::path recordingsPath = std::filesystem::current_path() / "Recordings";
        std::filesystem::create_directories(recordingsPath);
    }

    void HappyRecorderNativeModule::InitializeRecording(
        JSValueObject const& config,
        ReactPromise<void> const& promise) noexcept
    {
        try
        {
            std::lock_guard<std::mutex> lock(m_stateMutex);
            
            if (m_captureState.isInitialized)
            {
                promise.Reject(L"Already initialized");
                return;
            }
            
            if (config.find("outputPath") != config.end())
            {
                m_captureState.outputPath = winrt::to_hstring(config.at("outputPath").AsString());
            }
            else
            {
                auto timestamp = std::chrono::system_clock::now().time_since_epoch().count();
                m_captureState.outputPath = L"Recordings\\recording_" + std::to_wstring(timestamp) + L".mp4";
            }
            
            if (config.find("fps") != config.end())
            {
                m_captureState.fps = config.at("fps").AsDouble();
            }
            
            // Create D3D11 device
            D3D_FEATURE_LEVEL featureLevels[] = {
                D3D_FEATURE_LEVEL_11_1,
                D3D_FEATURE_LEVEL_11_0
            };
            
            D3D_FEATURE_LEVEL selectedFeatureLevel;
            HRESULT hr = D3D11CreateDevice(
                nullptr,
                D3D_DRIVER_TYPE_HARDWARE,
                nullptr,
                D3D11_CREATE_DEVICE_BGRA_SUPPORT,
                featureLevels,
                ARRAYSIZE(featureLevels),
                D3D11_SDK_VERSION,
                m_captureState.d3dDevice.put(),
                &selectedFeatureLevel,
                m_captureState.d3dContext.put()
            );
            
            if (FAILED(hr))
            {
                promise.Reject(L"Failed to create D3D11 device");
                return;
            }
            
            // Create capture item
            auto interopFactory = winrt::get_activation_factory<GraphicsCaptureItem, IGraphicsCaptureItemInterop>();
            winrt::com_ptr<IGraphicsCaptureItem> captureItemNative;
            
            hr = interopFactory->CreateForWindow(
                GetDesktopWindow(),
                winrt::guid_of<IGraphicsCaptureItem>(),
                captureItemNative.put_void()
            );
            
            if (FAILED(hr))
            {
                promise.Reject(L"Failed to create capture item");
                return;
            }
            
            winrt::com_ptr<::IInspectable> inspectable;
            hr = captureItemNative.as(inspectable);
            if (FAILED(hr))
            {
                promise.Reject(L"Failed to convert capture item");
                return;
            }
            
            m_captureState.captureItem = inspectable.as<GraphicsCaptureItem>();
            auto size = m_captureState.captureItem.Size();
            
            m_captureState.framePool = Direct3D11CaptureFramePool::Create(
                m_captureState.d3dDevice,
                winrt::Windows::Graphics::DirectX::DirectXPixelFormat::B8G8R8A8UIntNormalized,
                2,
                size
            );
            
            m_captureState.captureSession = m_captureState.framePool.CreateCaptureSession(m_captureState.captureItem);
            m_captureState.captureSession.IsCursorCaptureEnabled(true);
            
            m_captureState.isInitialized = true;
            promise.Resolve();
        }
        catch (...)
        {
            promise.Reject(L"Failed to initialize recording");
        }
    }

    void HappyRecorderNativeModule::StartRecording(
        ReactPromise<void> const& promise) noexcept
    {
        try
        {
            std::lock_guard<std::mutex> lock(m_stateMutex);
            
            if (!m_captureState.isInitialized)
            {
                promise.Reject(L"Recording not initialized");
                return;
            }
            
            if (m_captureState.isRecording)
            {
                promise.Reject(L"Already recording");
                return;
            }
            
            auto size = m_captureState.captureItem.Size();
            
            HRESULT hr = InitializeMediaFoundation(
                m_captureState.outputPath,
                size.Width,
                size.Height,
                static_cast<UINT32>(m_captureState.fps)
            );
            
            if (FAILED(hr))
            {
                promise.Reject(L"Failed to initialize encoder");
                return;
            }
            
            m_captureState.framePool.FrameArrived(
                [this](Direct3D11CaptureFramePool const& sender, winrt::IInspectable const&)
                {
                    if (m_captureState.isPaused)
                    {
                        return;
                    }
                    
                    auto frame = sender.TryGetNextFrame();
                    if (frame)
                    {
                        auto texture = GetDXGIInterfaceFromObject<ID3D11Texture2D>(frame.Surface());
                        if (texture)
                        {
                            auto now = std::chrono::steady_clock::now();
                            auto duration = std::chrono::duration_cast<std::chrono::microseconds>(
                                now - m_captureState.startTime - m_captureState.totalPausedDuration
                            ).count() * 10;
                            
                            WriteVideoFrame(texture.get(), duration);
                        }
                        frame.Close();
                    }
                }
            );
            
            m_captureState.captureSession.StartCapture();
            m_captureState.startTime = std::chrono::steady_clock::now();
            m_captureState.totalPausedDuration = std::chrono::milliseconds(0);
            m_captureState.isRecording = true;
            m_captureState.isPaused = false;
            
            promise.Resolve();
        }
        catch (...)
        {
            promise.Reject(L"Failed to start recording");
        }
    }

    void HappyRecorderNativeModule::StopRecording(
        ReactPromise<JSValueObject> const& promise) noexcept
    {
        try
        {
            std::lock_guard<std::mutex> lock(m_stateMutex);
            
            if (!m_captureState.isRecording)
            {
                promise.Reject(L"Not recording");
                return;
            }
            
            m_captureState.captureSession.Close();
            m_captureState.framePool.Close();
            
            if (m_captureState.sinkWriter)
            {
                m_captureState.sinkWriter->Finalize();
                m_captureState.sinkWriter = nullptr;
            }
            
            m_captureState.isRecording = false;
            m_captureState.isPaused = false;
            
            try
            {
                std::filesystem::path filePath(m_captureState.outputPath);
                if (std::filesystem::exists(filePath))
                {
                    m_captureState.fileSize = std::filesystem::file_size(filePath);
                }
            }
            catch (...)
            {
                m_captureState.fileSize = 0;
            }
            
            JSValueObject result;
            result["fileSize"] = static_cast<double>(m_captureState.fileSize);
            result["success"] = true;
            result["outputPath"] = winrt::to_string(m_captureState.outputPath);
            
            promise.Resolve(result);
        }
        catch (...)
        {
            promise.Reject(L"Failed to stop recording");
        }
    }

    void HappyRecorderNativeModule::PauseRecording(
        ReactPromise<void> const& promise) noexcept
    {
        try
        {
            std::lock_guard<std::mutex> lock(m_stateMutex);
            
            if (!m_captureState.isRecording)
            {
                promise.Reject(L"Not recording");
                return;
            }
            
            if (m_captureState.isPaused)
            {
                promise.Reject(L"Already paused");
                return;
            }
            
            m_captureState.isPaused = true;
            m_captureState.pauseTime = std::chrono::steady_clock::now();
            
            promise.Resolve();
        }
        catch (...)
        {
            promise.Reject(L"Failed to pause recording");
        }
    }

    void HappyRecorderNativeModule::ResumeRecording(
        ReactPromise<void> const& promise) noexcept
    {
        try
        {
            std::lock_guard<std::mutex> lock(m_stateMutex);
            
            if (!m_captureState.isPaused)
            {
                promise.Reject(L"Not paused");
                return;
            }
            
            auto pauseDuration = std::chrono::duration_cast<std::chrono::milliseconds>(
                std::chrono::steady_clock::now() - m_captureState.pauseTime
            );
            m_captureState.totalPausedDuration += pauseDuration;
            m_captureState.isPaused = false;
            
            promise.Resolve();
        }
        catch (...)
        {
            promise.Reject(L"Failed to resume recording");
        }
    }

    void HappyRecorderNativeModule::GetStatus(
        ReactPromise<JSValueObject> const& promise) noexcept
    {
        try
        {
            JSValueObject status;
            status["isInitialized"] = m_captureState.isInitialized;
            status["isRecording"] = m_captureState.isRecording;
            status["isPaused"] = m_captureState.isPaused;
            status["fileSize"] = static_cast<double>(m_captureState.fileSize);
            
            if (m_captureState.isRecording && !m_captureState.isPaused)
            {
                auto duration = std::chrono::duration_cast<std::chrono::seconds>(
                    std::chrono::steady_clock::now() - m_captureState.startTime - m_captureState.totalPausedDuration
                ).count();
                status["duration"] = static_cast<double>(duration);
            }
            else if (m_captureState.isPaused)
            {
                auto duration = std::chrono::duration_cast<std::chrono::seconds>(
                    m_captureState.pauseTime - m_captureState.startTime - m_captureState.totalPausedDuration
                ).count();
                status["duration"] = static_cast<double>(duration);
            }
            else
            {
                status["duration"] = 0.0;
            }
            
            promise.Resolve(status);
        }
        catch (...)
        {
            promise.Reject(L"Failed to get status");
        }
    }

    void HappyRecorderNativeModule::GetDisplays(
        ReactPromise<JSValueArray> const& promise) noexcept
    {
        try
        {
            JSValueArray displays;
            
            EnumDisplayMonitors(nullptr, nullptr, [](HMONITOR hMonitor, HDC, LPRECT, LPARAM lParam) -> BOOL {
                auto displays = reinterpret_cast<JSValueArray*>(lParam);
                
                MONITORINFOEX monitorInfo;
                monitorInfo.cbSize = sizeof(MONITORINFOEX);
                GetMonitorInfo(hMonitor, &monitorInfo);
                
                DEVMODE devMode;
                devMode.dmSize = sizeof(DEVMODE);
                EnumDisplaySettings(monitorInfo.szDevice, ENUM_CURRENT_SETTINGS, &devMode);
                
                JSValueObject display;
                display["id"] = static_cast<int>(displays->size());
                display["name"] = winrt::to_string(monitorInfo.szDevice);
                display["width"] = monitorInfo.rcMonitor.right - monitorInfo.rcMonitor.left;
                display["height"] = monitorInfo.rcMonitor.bottom - monitorInfo.rcMonitor.top;
                display["refreshRate"] = devMode.dmDisplayFrequency;
                display["isPrimary"] = (monitorInfo.dwFlags & MONITORINFOF_PRIMARY) != 0;
                
                displays->push_back(display);
                return TRUE;
            }, reinterpret_cast<LPARAM>(&displays));
            
            promise.Resolve(displays);
        }
        catch (...)
        {
            promise.Reject(L"Failed to get displays");
        }
    }

    void HappyRecorderNativeModule::GetWindows(
        ReactPromise<JSValueArray> const& promise) noexcept
    {
        try
        {
            JSValueArray windows;
            
            EnumWindows([](HWND hwnd, LPARAM lParam) -> BOOL {
                auto windows = reinterpret_cast<JSValueArray*>(lParam);
                
                if (IsWindowVisible(hwnd) && GetWindowTextLength(hwnd) > 0)
                {
                    wchar_t title[256];
                    GetWindowText(hwnd, title, 256);
                    
                    DWORD pid;
                    GetWindowThreadProcessId(hwnd, &pid);
                    
                    JSValueObject window;
                    window["handle"] = reinterpret_cast<intptr_t>(hwnd);
                    window["title"] = winrt::to_string(title);
                    window["processId"] = static_cast<int>(pid);
                    
                    RECT rect;
                    GetWindowRect(hwnd, &rect);
                    window["x"] = rect.left;
                    window["y"] = rect.top;
                    window["width"] = rect.right - rect.left;
                    window["height"] = rect.bottom - rect.top;
                    
                    windows->push_back(window);
                }
                return TRUE;
            }, reinterpret_cast<LPARAM>(&windows));
            
            promise.Resolve(windows);
        }
        catch (...)
        {
            promise.Reject(L"Failed to get windows");
        }
    }

    void HappyRecorderNativeModule::GetCursorPosition(
        ReactPromise<JSValueObject> const& promise) noexcept
    {
        try
        {
            POINT point;
            GetCursorPos(&point);
            
            JSValueObject position;
            position["x"] = point.x;
            position["y"] = point.y;
            
            promise.Resolve(position);
        }
        catch (...)
        {
            promise.Reject(L"Failed to get cursor position");
        }
    }

    void HappyRecorderNativeModule::HighlightCursor(
        JSValueObject const& config,
        ReactPromise<void> const& promise) noexcept
    {
        try
        {
            bool enabled = config.at("enabled").AsBoolean();
            if (m_captureState.captureSession)
            {
                m_captureState.captureSession.IsCursorCaptureEnabled(enabled);
            }
            promise.Resolve();
        }
        catch (...)
        {
            promise.Reject(L"Failed to set cursor highlight");
        }
    }

    void HappyRecorderNativeModule::AddClickEffect(
        JSValueObject const& config,
        ReactPromise<void> const& promise) noexcept
    {
        try
        {
            bool enabled = config.at("enabled").AsBoolean();
            promise.Resolve();
        }
        catch (...)
        {
            promise.Reject(L"Failed to set click effect");
        }
    }

    void HappyRecorderNativeModule::GetCameraDevices(
        ReactPromise<JSValueArray> const& promise) noexcept
    {
        try
        {
            auto devices = DeviceInformation::FindAllAsync(DeviceClass::VideoCapture).get();
            JSValueArray result;
            
            for (const auto& device : devices)
            {
                JSValueObject dev;
                dev["id"] = winrt::to_string(device.Id());
                dev["name"] = winrt::to_string(device.Name());
                result.push_back(dev);
            }
            
            promise.Resolve(result);
        }
        catch (...)
        {
            promise.Reject(L"Failed to get camera devices");
        }
    }

    void HappyRecorderNativeModule::InitializeCamera(
        JSValueObject const& config,
        ReactPromise<void> const& promise) noexcept
    {
        try
        {
            m_captureState.cameraCapture = MediaCapture();
            
            MediaCaptureInitializationSettings settings;
            settings.StreamingCaptureMode(StreamingCaptureMode::Video);
            
            auto initTask = m_captureState.cameraCapture.InitializeAsync(settings);
            initTask.get();
            
            m_captureState.isCameraEnabled = true;
            promise.Resolve();
        }
        catch (...)
        {
            promise.Reject(L"Failed to initialize camera");
        }
    }

    void HappyRecorderNativeModule::StartCamera(
        ReactPromise<void> const& promise) noexcept
    {
        try
        {
            if (!m_captureState.isCameraEnabled)
            {
                promise.Reject(L"Camera not initialized");
                return;
            }
            
            auto startTask = m_captureState.cameraCapture.StartPreviewAsync();
            startTask.get();
            
            promise.Resolve();
        }
        catch (...)
        {
            promise.Reject(L"Failed to start camera");
        }
    }

    void HappyRecorderNativeModule::StopCamera(
        ReactPromise<void> const& promise) noexcept
    {
        try
        {
            if (m_captureState.cameraCapture)
            {
                auto stopTask = m_captureState.cameraCapture.StopPreviewAsync();
                stopTask.get();
            }
            promise.Resolve();
        }
        catch (...)
        {
            promise.Reject(L"Failed to stop camera");
        }
    }

    void HappyRecorderNativeModule::TakePhoto(
        ReactPromise<std::string> const& promise) noexcept
    {
        try
        {
            if (!m_captureState.cameraCapture)
            {
                promise.Reject(L"Camera not initialized");
                return;
            }
            
            auto timestamp = std::chrono::system_clock::now().time_since_epoch().count();
            auto photoPath = L"photo_" + std::to_wstring(timestamp) + L".jpg";
            
            auto file = StorageFile::GetFileFromPathAsync(photoPath).get();
            auto encoding = ImageEncodingProperties::CreateJpeg();
            
            auto captureTask = m_captureState.cameraCapture.CapturePhotoToStorageFileAsync(encoding, file);
            captureTask.get();
            
            promise.Resolve(winrt::to_string(photoPath));
        }
        catch (...)
        {
            promise.Reject(L"Failed to take photo");
        }
    }

    void HappyRecorderNativeModule::GetAudioDevices(
        ReactPromise<JSValueArray> const& promise) noexcept
    {
        try
        {
            auto devices = DeviceInformation::FindAllAsync(DeviceClass::AudioCapture).get();
            JSValueArray result;
            
            for (const auto& device : devices)
            {
                JSValueObject dev;
                dev["id"] = winrt::to_string(device.Id());
                dev["name"] = winrt::to_string(device.Name());
                result.push_back(dev);
            }
            
            promise.Resolve(result);
        }
        catch (...)
        {
            promise.Reject(L"Failed to get audio devices");
        }
    }

    void HappyRecorderNativeModule::InitializeMicrophone(
        JSValueObject const& config,
        ReactPromise<void> const& promise) noexcept
    {
        try
        {
            AudioGraphSettings settings(AudioRenderCategory::Media);
            auto createTask = AudioGraph::CreateAsync(settings);
            m_captureState.audioGraph = createTask.get().Graph();
            
            auto inputResult = DeviceInformation::FindAllAsync(DeviceClass::AudioCapture).get();
            if (inputResult.Size() > 0)
            {
                auto createInputTask = m_captureState.audioGraph.CreateDeviceInputNodeAsync(
                    MediaCategory::Media,
                    AudioEncodingProperties::CreatePcm(48000, 2, 32),
                    inputResult.GetAt(0)
                );
                m_captureState.microphoneNode = createInputTask.get().DeviceInputNode();
                m_captureState.microphoneNode.OutgoingGain(1.0);
            }
            
            m_captureState.isMicrophoneEnabled = true;
            promise.Resolve();
        }
        catch (...)
        {
            promise.Reject(L"Failed to initialize microphone");
        }
    }

    void HappyRecorderNativeModule::StartMicrophone(
        ReactPromise<void> const& promise) noexcept
    {
        try
        {
            if (m_captureState.audioGraph)
            {
                m_captureState.audioGraph.Start();
            }
            promise.Resolve();
        }
        catch (...)
        {
            promise.Reject(L"Failed to start microphone");
        }
    }

    void HappyRecorderNativeModule::StopMicrophone(
        ReactPromise<void> const& promise) noexcept
    {
        try
        {
            if (m_captureState.audioGraph)
            {
                m_captureState.audioGraph.Stop();
            }
            m_captureState.isMicrophoneEnabled = false;
            promise.Resolve();
        }
        catch (...)
        {
            promise.Reject(L"Failed to stop microphone");
        }
    }

    void HappyRecorderNativeModule::InitializeSystemAudio(
        JSValueObject const& config,
        ReactPromise<void> const& promise) noexcept
    {
        try
        {
            AudioGraphSettings settings(AudioRenderCategory::Media);
            auto createTask = AudioGraph::CreateAsync(settings);
            m_captureState.audioGraph = createTask.get().Graph();
            
            m_captureState.isSystemAudioEnabled = true;
            promise.Resolve();
        }
        catch (...)
        {
            promise.Reject(L"Failed to initialize system audio");
        }
    }

    void HappyRecorderNativeModule::StartSystemAudio(
        ReactPromise<void> const& promise) noexcept
    {
        try
        {
            if (m_captureState.audioGraph)
            {
                m_captureState.audioGraph.Start();
            }
            promise.Resolve();
        }
        catch (...)
        {
            promise.Reject(L"Failed to start system audio");
        }
    }

    void HappyRecorderNativeModule::StopSystemAudio(
        ReactPromise<void> const& promise) noexcept
    {
        try
        {
            if (m_captureState.audioGraph)
            {
                m_captureState.audioGraph.Stop();
            }
            m_captureState.isSystemAudioEnabled = false;
            promise.Resolve();
        }
        catch (...)
        {
            promise.Reject(L"Failed to stop system audio");
        }
    }

    void HappyRecorderNativeModule::LoadBackgroundMusic(
        std::string const& filePath,
        ReactPromise<void> const& promise) noexcept
    {
        try
        {
            if (!m_captureState.audioGraph)
            {
                AudioGraphSettings settings(AudioRenderCategory::Media);
                auto createTask = AudioGraph::CreateAsync(settings);
                m_captureState.audioGraph = createTask.get().Graph();
            }
            
            auto file = StorageFile::GetFileFromPathAsync(winrt::to_hstring(filePath)).get();
            auto createFileTask = m_captureState.audioGraph.CreateFileInputNodeAsync(file);
            m_captureState.backgroundMusicNode = createFileTask.get().FileInputNode();
            
            promise.Resolve();
        }
        catch (...)
        {
            promise.Reject(L"Failed to load background music");
        }
    }

    void HappyRecorderNativeModule::StartBackgroundMusic(
        JSValueObject const& config,
        ReactPromise<void> const& promise) noexcept
    {
        try
        {
            if (m_captureState.backgroundMusicNode)
            {
                m_captureState.backgroundMusicNode.Start();
                if (m_captureState.audioGraph)
                {
                    m_captureState.audioGraph.Start();
                }
            }
            promise.Resolve();
        }
        catch (...)
        {
            promise.Reject(L"Failed to start background music");
        }
    }

    void HappyRecorderNativeModule::StopBackgroundMusic(
        ReactPromise<void> const& promise) noexcept
    {
        try
        {
            if (m_captureState.backgroundMusicNode)
            {
                m_captureState.backgroundMusicNode.Stop();
            }
            promise.Resolve();
        }
        catch (...)
        {
            promise.Reject(L"Failed to stop background music");
        }
    }

    void HappyRecorderNativeModule::SetAudioVolume(
        std::string const& source,
        double volume,
        ReactPromise<void> const& promise) noexcept
    {
        try
        {
            if (source == "microphone" && m_captureState.microphoneNode)
            {
                m_captureState.microphoneNode.OutgoingGain(volume);
            }
            else if (source == "background" && m_captureState.backgroundMusicNode)
            {
                m_captureState.backgroundMusicNode.OutgoingGain(volume);
            }
            promise.Resolve();
        }
        catch (...)
        {
            promise.Reject(L"Failed to set audio volume");
        }
    }

    void HappyRecorderNativeModule::CleanupScreenCapture(
        ReactPromise<void> const& promise) noexcept
    {
        try
        {
            std::lock_guard<std::mutex> lock(m_stateMutex);
            
            if (m_captureState.captureSession)
            {
                m_captureState.captureSession.Close();
                m_captureState.captureSession = nullptr;
            }
            
            if (m_captureState.framePool)
            {
                m_captureState.framePool.Close();
                m_captureState.framePool = nullptr;
            }
            
            CleanupMediaFoundation();
            m_captureState.Reset();
            
            promise.Resolve();
        }
        catch (...)
        {
            promise.Reject(L"Failed to cleanup screen capture");
        }
    }

    void HappyRecorderNativeModule::CleanupCamera(
        ReactPromise<void> const& promise) noexcept
    {
        try
        {
            if (m_captureState.cameraCapture)
            {
                m_captureState.cameraCapture = nullptr;
            }
            m_captureState.isCameraEnabled = false;
            promise.Resolve();
        }
        catch (...)
        {
            promise.Reject(L"Failed to cleanup camera");
        }
    }

    void HappyRecorderNativeModule::CleanupAudio(
        ReactPromise<void> const& promise) noexcept
    {
        try
        {
            if (m_captureState.audioGraph)
            {
                m_captureState.audioGraph.Stop();
                m_captureState.audioGraph = nullptr;
            }
            m_captureState.microphoneNode = nullptr;
            m_captureState.systemAudioNode = nullptr;
            m_captureState.backgroundMusicNode = nullptr;
            m_captureState.isMicrophoneEnabled = false;
            m_captureState.isSystemAudioEnabled = false;
            promise.Resolve();
        }
        catch (...)
        {
            promise.Reject(L"Failed to cleanup audio");
        }
    }

    void HappyRecorderNativeModule::GetGitCommit(
        std::string const& repoPath,
        ReactPromise<std::string> const& promise) noexcept
    {
        try
        {
            std::filesystem::path gitPath = std::filesystem::path(repoPath) / ".git";
            std::filesystem::path headPath = gitPath / "HEAD";
            
            if (!std::filesystem::exists(headPath))
            {
                promise.Reject(L"Not a git repository");
                return;
            }
            
            std::ifstream headFile(headPath);
            std::string headContent;
            std::getline(headFile, headContent);
            headFile.close();
            
            if (headContent.find("ref: ") == 0)
            {
                std::string refPath = headContent.substr(5);
                std::filesystem::path refFullPath = gitPath / refPath;
                std::ifstream refFile(refFullPath);
                std::string commit;
                std::getline(refFile, commit);
                refFile.close();
                
                if (commit.length() >= 7)
                {
                    promise.Resolve(commit.substr(0, 7));
                }
                else
                {
                    promise.Resolve(commit);
                }
            }
            else
            {
                if (headContent.length() >= 7)
                {
                    promise.Resolve(headContent.substr(0, 7));
                }
                else
                {
                    promise.Resolve(headContent);
                }
            }
        }
        catch (...)
        {
            promise.Reject(L"Failed to get git commit");
        }
    }

    void HappyRecorderNativeModule::GetGitBranch(
        std::string const& repoPath,
        ReactPromise<std::string> const& promise) noexcept
    {
        try
        {
            std::filesystem::path gitPath = std::filesystem::path(repoPath) / ".git";
            std::filesystem::path headPath = gitPath / "HEAD";
            
            if (!std::filesystem::exists(headPath))
            {
                promise.Reject(L"Not a git repository");
                return;
            }
            
            std::ifstream headFile(headPath);
            std::string headContent;
            std::getline(headFile, headContent);
            headFile.close();
            
            if (headContent.find("ref: refs/heads/") == 0)
            {
                std::string branch = headContent.substr(16);
                promise.Resolve(branch);
            }
            else
            {
                promise.Reject(L"Detached HEAD state");
            }
        }
        catch (...)
        {
            promise.Reject(L"Failed to get git branch");
        }
    }

    HRESULT HappyRecorderNativeModule::InitializeMediaFoundation(
        const std::wstring& outputPath,
        UINT32 width,
        UINT32 height,
        UINT32 fps)
    {
        CleanupMediaFoundation();
        
        winrt::com_ptr<IMFAttributes> attributes;
        RETURN_IF_FAILED(MFCreateAttributes(attributes.put(), 1));
        RETURN_IF_FAILED(attributes->SetGUID(MF_TRANSCODE_CONTAINERTYPE, MFTranscodeContainerType_MPEG4));
        
        RETURN_IF_FAILED(MFCreateSinkWriterFromURL(
            outputPath.c_str(),
            nullptr,
            attributes.get(),
            m_captureState.sinkWriter.put()
        ));
        
        winrt::com_ptr<IMFMediaType> videoTypeOut;
        RETURN_IF_FAILED(MFCreateMediaType(videoTypeOut.put()));
        RETURN_IF_FAILED(videoTypeOut->SetGUID(MF_MT_MAJOR_TYPE, MFMediaType_Video));
        RETURN_IF_FAILED(videoTypeOut->SetGUID(MF_MT_SUBTYPE, MFVideoFormat_H264));
        RETURN_IF_FAILED(videoTypeOut->SetUINT32(MF_MT_AVG_BITRATE, 8000000));
        RETURN_IF_FAILED(videoTypeOut->SetUINT32(MF_MT_INTERLACE_MODE, MFVideoInterlace_Progressive));
        RETURN_IF_FAILED(MFSetAttributeSize(videoTypeOut.get(), MF_MT_FRAME_SIZE, width, height));
        RETURN_IF_FAILED(MFSetAttributeRatio(videoTypeOut.get(), MF_MT_FRAME_RATE, fps, 1));
        RETURN_IF_FAILED(MFSetAttributeRatio(videoTypeOut.get(), MF_MT_PIXEL_ASPECT_RATIO, 1, 1));
        
        RETURN_IF_FAILED(m_captureState.sinkWriter->AddStream(videoTypeOut.get(), &m_captureState.videoStreamIndex));
        
        winrt::com_ptr<IMFMediaType> videoTypeIn;
        RETURN_IF_FAILED(MFCreateMediaType(videoTypeIn.put()));
        RETURN_IF_FAILED(videoTypeIn->SetGUID(MF_MT_MAJOR_TYPE, MFMediaType_Video));
        RETURN_IF_FAILED(videoTypeIn->SetGUID(MF_MT_SUBTYPE, MFVideoFormat_RGB32));
        RETURN_IF_FAILED(videoTypeIn->SetUINT32(MF_MT_INTERLACE_MODE, MFVideoInterlace_Progressive));
        RETURN_IF_FAILED(MFSetAttributeSize(videoTypeIn.get(), MF_MT_FRAME_SIZE, width, height));
        RETURN_IF_FAILED(MFSetAttributeRatio(videoTypeIn.get(), MF_MT_FRAME_RATE, fps, 1));
        RETURN_IF_FAILED(MFSetAttributeRatio(videoTypeIn.get(), MF_MT_PIXEL_ASPECT_RATIO, 1, 1));
        
        RETURN_IF_FAILED(m_captureState.sinkWriter->SetInputMediaType(
            m_captureState.videoStreamIndex,
            videoTypeIn.get(),
            nullptr
        ));
        
        RETURN_IF_FAILED(m_captureState.sinkWriter->BeginWriting());
        
        m_captureState.frameDuration = 10000000LL / fps;
        
        return S_OK;
    }

    HRESULT HappyRecorderNativeModule::WriteVideoFrame(
        ID3D11Texture2D* texture,
        LONGLONG timestamp)
    {
        if (!m_captureState.sinkWriter || !texture)
        {
            return S_OK;
        }
        
        D3D11_TEXTURE2D_DESC desc;
        texture->GetDesc(&desc);
        
        D3D11_TEXTURE2D_DESC stagingDesc = desc;
        stagingDesc.Usage = D3D11_USAGE_STAGING;
        stagingDesc.BindFlags = 0;
        stagingDesc.CPUAccessFlags = D3D11_CPU_ACCESS_READ;
        stagingDesc.MiscFlags = 0;
        
        winrt::com_ptr<ID3D11Texture2D> stagingTexture;
        RETURN_IF_FAILED(m_captureState.d3dDevice->CreateTexture2D(&stagingDesc, nullptr, stagingTexture.put()));
        
        m_captureState.d3dContext->CopyResource(stagingTexture.get(), texture);
        
        D3D11_MAPPED_SUBRESOURCE mapped;
        RETURN_IF_FAILED(m_captureState.d3dContext->Map(stagingTexture.get(), 0, D3D11_MAP_READ, 0, &mapped));
        
        UINT32 dataSize = mapped.RowPitch * desc.Height;
        
        winrt::com_ptr<IMFMediaBuffer> buffer;
        RETURN_IF_FAILED(MFCreateMemoryBuffer(dataSize, buffer.put()));
        
        BYTE* data = nullptr;
        RETURN_IF_FAILED(buffer->Lock(&data, nullptr, nullptr));
        
        memcpy(data, mapped.pData, dataSize);
        
        buffer->Unlock();
        buffer->SetCurrentLength(dataSize);
        
        m_captureState.d3dContext->Unmap(stagingTexture.get(), 0);
        
        winrt::com_ptr<IMFSample> sample;
        RETURN_IF_FAILED(MFCreateSample(sample.put()));
        RETURN_IF_FAILED(sample->AddBuffer(buffer.get()));
        RETURN_IF_FAILED(sample->SetSampleTime(timestamp));
        RETURN_IF_FAILED(sample->SetSampleDuration(m_captureState.frameDuration));
        
        return m_captureState.sinkWriter->WriteSample(m_captureState.videoStreamIndex, sample.get());
    }

    void HappyRecorderNativeModule::CleanupMediaFoundation()
    {
        if (m_captureState.sinkWriter)
        {
            m_captureState.sinkWriter->Finalize();
            m_captureState.sinkWriter = nullptr;
        }
    }

    void HappyRecorderNativeModule::EmitStatusUpdate()
    {
        if (m_captureState.isRecording)
        {
            auto duration = std::chrono::duration_cast<std::chrono::seconds>(
                std::chrono::steady_clock::now() - m_captureState.startTime - m_captureState.totalPausedDuration
            ).count();
            
            JSValueObject status;
            status["duration"] = static_cast<double>(duration);
            status["isRecording"] = true;
            status["isPaused"] = m_captureState.isPaused;
            
            m_reactContext.EmitJSEvent(L"onStatusUpdate", status);
        }
    }
}