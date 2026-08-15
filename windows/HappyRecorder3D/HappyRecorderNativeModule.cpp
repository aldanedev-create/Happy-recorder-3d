#include "pch.h"
#include "HappyRecorderNativeModule.h"
#include <winrt/Windows.Media.Capture.h>
#include <winrt/Windows.Media.MediaProperties.h>
#include <winrt/Windows.Storage.h>
#include <winrt/Windows.Graphics.Capture.h>
#include <winrt/Windows.Graphics.DirectX.h>
#include <winrt/Windows.Graphics.DirectX.Direct3D11.h>
#include <winrt/Windows.Graphics.DirectX.Direct3D11.interop.h>
#include <winrt/Windows.Graphics.Display.h>
#include <winrt/Windows.Devices.Enumeration.h>
#include <winrt/Windows.UI.Core.h>
#include <winrt/Windows.UI.Composition.h>
#include <winrt/Windows.UI.Composition.Desktop.h>
#include <winrt/Windows.Foundation.Metadata.h>
#include <windows.graphics.capture.h>
#include <windows.graphics.capture.interop.h>
#include <windows.graphics.directx.h>
#include <windows.h>
#include <d3d11.h>
#include <d2d1.h>
#include <dwrite.h>
#include <wrl/client.h>
#include <wrl/implements.h>
#include <filesystem>
#include <fstream>

using namespace winrt;
using namespace Windows::Foundation;
using namespace Windows::System;
using namespace Windows::Storage;
using namespace Windows::Storage::Streams;
using namespace Windows::Devices::Enumeration;
using namespace Windows::Media;
using namespace Windows::Media::Capture;
using namespace Windows::Media::MediaProperties;
using namespace Windows::Media::Devices;
using namespace Windows::Media::Audio;
using namespace Windows::UI::Core;
using namespace Windows::Graphics::Capture;
using namespace Windows::Graphics::Display;
using namespace Windows::Graphics::DirectX;

namespace winrt::HappyRecorderNative
{
    // Forward declarations for COM interop
    struct __declspec(uuid("A9B3D012-3D6F-4F5A-8B1C-2D4E6F8A0B1C")) 
    IGraphicsCaptureItemInterop : ::IUnknown
    {
        virtual HRESULT __stdcall CreateForWindow(
            HWND hwnd,
            REFIID riid,
            void** ppv) = 0;
        virtual HRESULT __stdcall CreateForMonitor(
            HMONITOR hMonitor,
            REFIID riid,
            void** ppv) = 0;
    };

    void HappyRecorderNativeModule::Initialize(ReactContext const& reactContext) noexcept
    {
        m_reactContext = reactContext;
        m_captureState = CaptureState();
        std::filesystem::path recordingsPath = std::filesystem::current_path() / "Recordings";
        std::filesystem::create_directories(recordingsPath);
    }

    void HappyRecorderNativeModule::InitializeRecording(JSValueObject const& config, ReactPromise<void> const& promise) noexcept
    {
        try {
            if (m_captureState.isInitialized) {
                promise.Reject(L"Already initialized");
                return;
            }

            // Store configuration
            m_captureState.outputPath = winrt::hstring(config.at("outputPath").AsString());
            m_captureState.quality = config.at("quality").AsString();
            m_captureState.fps = config.at("fps").AsDouble();

            // Initialize MediaCapture
            m_captureState.mediaCapture = MediaCapture();

            MediaCaptureInitializationSettings settings;
            settings.StreamingCaptureMode(StreamingCaptureMode::AudioAndVideo);
            settings.MediaCategory(MediaCategory::Media);
            settings.AudioProcessing(AudioProcessing::Default);
            settings.SharingMode(MediaCaptureSharingMode::ExclusiveControl);

            // Get screen capture item
            auto hwnd = GetDesktopWindow();
            auto interop = winrt::get_activation_factory<GraphicsCaptureItem, IGraphicsCaptureItemInterop>();
            
            winrt::com_ptr<::IGraphicsCaptureItem> captureItem;
            winrt::check_hresult(interop->CreateForWindow(hwnd, winrt::guid_of<GraphicsCaptureItem>(), captureItem.put_void()));
            
            // TODO: Set up screen capture
            
            auto initTask = m_captureState.mediaCapture.InitializeAsync(settings);
            initTask.Completed([this, config, promise](auto&&, auto&&) {
                try {
                    m_captureState.isInitialized = true;
                    m_captureState.isRecording = false;
                    m_captureState.isPaused = false;
                    
                    // Set up encoding profile based on quality
                    VideoEncodingQuality quality = VideoEncodingQuality::HD1080p;
                    std::string qualityStr = config.at("quality").AsString();
                    if (qualityStr == "720p") quality = VideoEncodingQuality::HD720p;
                    else if (qualityStr == "1080p") quality = VideoEncodingQuality::HD1080p;
                    else if (qualityStr == "4K") quality = VideoEncodingQuality::Uhd2160p;
                    
                    auto encodingProfile = MediaEncodingProfile::CreateMp4(quality);
                    
                    // Set frame rate
                    if (config.find("fps") != config.end()) {
                        double fps = config.at("fps").AsDouble();
                        // Apply FPS setting
                    }

                    promise.Resolve();
                } catch (hresult_error const& ex) {
                    promise.Reject(ex.message());
                } catch (...) {
                    promise.Reject(L"Unknown error during initialization");
                }
            });
        } catch (hresult_error const& ex) {
            promise.Reject(ex.message());
        } catch (...) {
            promise.Reject(L"Failed to initialize recording");
        }
    }

    void HappyRecorderNativeModule::StartRecording(ReactPromise<void> const& promise) noexcept
    {
        try {
            if (!m_captureState.isInitialized) {
                promise.Reject(L"Recording not initialized");
                return;
            }

            if (m_captureState.isRecording) {
                promise.Reject(L"Already recording");
                return;
            }

            // Create output file
            auto storageFileTask = StorageFile::GetFileFromPathAsync(m_captureState.outputPath);
            storageFileTask.Completed([this, promise](auto&& fileResult, auto&&) {
                try {
                    auto file = fileResult.GetResults();
                    
                    // Get encoding profile
                    VideoEncodingQuality quality = VideoEncodingQuality::HD1080p;
                    if (m_captureState.quality == "720p") quality = VideoEncodingQuality::HD720p;
                    else if (m_captureState.quality == "4K") quality = VideoEncodingQuality::Uhd2160p;
                    
                    auto encodingProfile = MediaEncodingProfile::CreateMp4(quality);
                    
                    // Start recording
                    auto recordTask = m_captureState.mediaCapture.StartRecordToStorageFileAsync(
                        encodingProfile, file);
                    
                    recordTask.Completed([this, promise](auto&&, auto&&) {
                        m_captureState.isRecording = true;
                        m_captureState.isPaused = false;
                        m_captureState.startTime = std::chrono::steady_clock::now();
                        
                        // Start periodic status updates
                        this->EmitStatusUpdate();
                        
                        promise.Resolve();
                    });
                } catch (hresult_error const& ex) {
                    promise.Reject(ex.message());
                } catch (...) {
                    promise.Reject(L"Failed to start recording");
                }
            });
        } catch (hresult_error const& ex) {
            promise.Reject(ex.message());
        } catch (...) {
            promise.Reject(L"Failed to start recording");
        }
    }

    void HappyRecorderNativeModule::StopRecording(ReactPromise<JSValueObject> const& promise) noexcept
    {
        try {
            if (!m_captureState.isRecording) {
                promise.Reject(L"Not recording");
                return;
            }

            auto stopTask = m_captureState.mediaCapture.StopRecordAsync();
            stopTask.Completed([this, promise](auto&&, auto&&) {
                m_captureState.isRecording = false;
                m_captureState.isPaused = false;
                
                // Get file size
                auto fileTask = StorageFile::GetFileFromPathAsync(m_captureState.outputPath);
                fileTask.Completed([this, promise](auto&& fileResult, auto&&) {
                    try {
                        auto file = fileResult.GetResults();
                        auto sizeTask = file.GetBasicPropertiesAsync();
                        sizeTask.Completed([promise](auto&& sizeResult, auto&&) {
                            try {
                                auto properties = sizeResult.GetResults();
                                uint64_t size = properties.Size();
                                
                                JSValueObject result;
                                result["fileSize"] = static_cast<double>(size);
                                result["success"] = true;
                                promise.Resolve(result);
                            } catch (hresult_error const& ex) {
                                JSValueObject result;
                                result["fileSize"] = 0.0;
                                result["success"] = false;
                                promise.Resolve(result);
                            }
                        });
                    } catch (hresult_error const& ex) {
                        JSValueObject result;
                        result["fileSize"] = 0.0;
                        result["success"] = false;
                        promise.Resolve(result);
                    }
                });
            });
        } catch (hresult_error const& ex) {
            promise.Reject(ex.message());
        } catch (...) {
            promise.Reject(L"Failed to stop recording");
        }
    }

    void HappyRecorderNativeModule::PauseRecording(ReactPromise<void> const& promise) noexcept
    {
        try {
            if (!m_captureState.isRecording) {
                promise.Reject(L"Not recording");
                return;
            }

            if (m_captureState.isPaused) {
                promise.Reject(L"Already paused");
                return;
            }

            // Windows MediaCapture doesn't support pause directly
            // Need to stop and resume with state tracking
            auto stopTask = m_captureState.mediaCapture.StopRecordAsync();
            stopTask.Completed([this, promise](auto&&, auto&&) {
                m_captureState.isPaused = true;
                m_captureState.isRecording = false;
                promise.Resolve();
            });
        } catch (hresult_error const& ex) {
            promise.Reject(ex.message());
        } catch (...) {
            promise.Reject(L"Failed to pause recording");
        }
    }

    void HappyRecorderNativeModule::ResumeRecording(ReactPromise<void> const& promise) noexcept
    {
        try {
            if (!m_captureState.isPaused) {
                promise.Reject(L"Not paused");
                return;
            }

            // Re-start recording
            auto fileTask = StorageFile::GetFileFromPathAsync(m_captureState.outputPath);
            fileTask.Completed([this, promise](auto&& fileResult, auto&&) {
                try {
                    auto file = fileResult.GetResults();
                    VideoEncodingQuality quality = VideoEncodingQuality::HD1080p;
                    auto encodingProfile = MediaEncodingProfile::CreateMp4(quality);
                    
                    auto recordTask = m_captureState.mediaCapture.StartRecordToStorageFileAsync(
                        encodingProfile, file);
                    
                    recordTask.Completed([this, promise](auto&&, auto&&) {
                        m_captureState.isPaused = false;
                        m_captureState.isRecording = true;
                        promise.Resolve();
                    });
                } catch (hresult_error const& ex) {
                    promise.Reject(ex.message());
                }
            });
        } catch (hresult_error const& ex) {
            promise.Reject(ex.message());
        } catch (...) {
            promise.Reject(L"Failed to resume recording");
        }
    }

    void HappyRecorderNativeModule::GetStatus(ReactPromise<JSValueObject> const& promise) noexcept
    {
        try {
            JSValueObject status;
            status["isInitialized"] = m_captureState.isInitialized;
            status["isRecording"] = m_captureState.isRecording;
            status["isPaused"] = m_captureState.isPaused;
            
            if (m_captureState.isRecording) {
                auto duration = std::chrono::duration_cast<std::chrono::seconds>(
                    std::chrono::steady_clock::now() - m_captureState.startTime
                ).count();
                status["duration"] = static_cast<double>(duration);
            } else {
                status["duration"] = 0.0;
            }
            
            status["fileSize"] = static_cast<double>(m_captureState.fileSize);
            
            promise.Resolve(status);
        } catch (hresult_error const& ex) {
            promise.Reject(ex.message());
        }
    }

    void HappyRecorderNativeModule::GetDisplays(ReactPromise<JSValueArray> const& promise) noexcept
    {
        try {
            JSValueArray displays;
            
            // Get all displays
            auto displayDevices = DeviceInformation::FindAllAsync(DeviceClass::Display);
            displayDevices.Completed([promise](auto&&, auto&&) {
                // TODO: Implement full display enumeration
                JSValueObject display;
                display["id"] = 1;
                display["name"] = "Primary Display";
                display["width"] = 1920;
                display["height"] = 1080;
                display["refreshRate"] = 60;
                display["isPrimary"] = true;
                
                JSValueArray result;
                result.push_back(display);
                promise.Resolve(result);
            });
        } catch (hresult_error const& ex) {
            promise.Reject(ex.message());
        }
    }

    void HappyRecorderNativeModule::GetWindows(ReactPromise<JSValueArray> const& promise) noexcept
    {
        try {
            JSValueArray windows;
            
            // Enumerate top-level windows
            EnumWindows([](HWND hwnd, LPARAM lParam) -> BOOL {
                auto windows = reinterpret_cast<JSValueArray*>(lParam);
                
                if (IsWindowVisible(hwnd)) {
                    char title[256];
                    GetWindowTextA(hwnd, title, sizeof(title));
                    
                    if (strlen(title) > 0) {
                        DWORD pid;
                        GetWindowThreadProcessId(hwnd, &pid);
                        
                        JSValueObject window;
                        window["handle"] = reinterpret_cast<intptr_t>(hwnd);
                        window["title"] = std::string(title);
                        window["processId"] = static_cast<int>(pid);
                        
                        RECT rect;
                        GetWindowRect(hwnd, &rect);
                        window["x"] = rect.left;
                        window["y"] = rect.top;
                        window["width"] = rect.right - rect.left;
                        window["height"] = rect.bottom - rect.top;
                        
                        windows->push_back(window);
                    }
                }
                return TRUE;
            }, reinterpret_cast<LPARAM>(&windows));
            
            promise.Resolve(windows);
        } catch (hresult_error const& ex) {
            promise.Reject(ex.message());
        }
    }

    void HappyRecorderNativeModule::GetCursorPosition(ReactPromise<JSValueObject> const& promise) noexcept
    {
        try {
            POINT point;
            GetCursorPos(&point);
            
            JSValueObject position;
            position["x"] = point.x;
            position["y"] = point.y;
            
            promise.Resolve(position);
        } catch (hresult_error const& ex) {
            promise.Reject(ex.message());
        }
    }

    void HappyRecorderNativeModule::HighlightCursor(JSValueObject const& config, ReactPromise<void> const& promise) noexcept
    {
        try {
            bool enabled = config.at("enabled").AsBoolean();
            // TODO: Implement cursor highlighting
            // This would require a system overlay or hook
            promise.Resolve();
        } catch (hresult_error const& ex) {
            promise.Reject(ex.message());
        }
    }

    void HappyRecorderNativeModule::AddClickEffect(JSValueObject const& config, ReactPromise<void> const& promise) noexcept
    {
        try {
            bool enabled = config.at("enabled").AsBoolean();
            // TODO: Implement click effects
            // This would require system-wide mouse hook
            promise.Resolve();
        } catch (hresult_error const& ex) {
            promise.Reject(ex.message());
        }
    }

    // Camera Methods
    void HappyRecorderNativeModule::GetCameraDevices(ReactPromise<JSValueArray> const& promise) noexcept
    {
        try {
            JSValueArray devices;
            
            auto deviceTask = DeviceInformation::FindAllAsync(DeviceClass::VideoCapture);
            deviceTask.Completed([promise](auto&& result, auto&&) {
                auto deviceInfo = result.GetResults();
                JSValueArray devices;
                
                for (const auto& device : deviceInfo) {
                    JSValueObject dev;
                    dev["id"] = winrt::to_string(device.Id());
                    dev["name"] = winrt::to_string(device.Name());
                    dev["facing"] = "front"; // Default
                    
                    // Check if it's a back-facing camera
                    if (device.EnclosureLocation()) {
                        auto enclosure = device.EnclosureLocation();
                        if (enclosure.Panel() == Panel::Back) {
                            dev["facing"] = "back";
                        }
                    }
                    
                    devices.push_back(dev);
                }
                
                promise.Resolve(devices);
            });
        } catch (hresult_error const& ex) {
            promise.Reject(ex.message());
        }
    }

    void HappyRecorderNativeModule::InitializeCamera(JSValueObject const& config, ReactPromise<void> const& promise) noexcept
    {
        try {
            // TODO: Implement camera initialization
            promise.Resolve();
        } catch (hresult_error const& ex) {
            promise.Reject(ex.message());
        }
    }

    void HappyRecorderNativeModule::StartCamera(ReactPromise<void> const& promise) noexcept
    {
        try {
            // TODO: Implement camera start
            promise.Resolve();
        } catch (hresult_error const& ex) {
            promise.Reject(ex.message());
        }
    }

    void HappyRecorderNativeModule::StopCamera(ReactPromise<void> const& promise) noexcept
    {
        try {
            // TODO: Implement camera stop
            promise.Resolve();
        } catch (hresult_error const& ex) {
            promise.Reject(ex.message());
        }
    }

    void HappyRecorderNativeModule::SetCameraPosition(std::string const& position, ReactPromise<void> const& promise) noexcept
    {
        try {
            // TODO: Implement camera position
            promise.Resolve();
        } catch (hresult_error const& ex) {
            promise.Reject(ex.message());
        }
    }

    void HappyRecorderNativeModule::SetCameraSize(double width, double height, ReactPromise<void> const& promise) noexcept
    {
        try {
            // TODO: Implement camera size
            promise.Resolve();
        } catch (hresult_error const& ex) {
            promise.Reject(ex.message());
        }
    }

    void HappyRecorderNativeModule::SetCameraShape(std::string const& shape, ReactPromise<void> const& promise) noexcept
    {
        try {
            // TODO: Implement camera shape
            promise.Resolve();
        } catch (hresult_error const& ex) {
            promise.Reject(ex.message());
        }
    }

    void HappyRecorderNativeModule::ToggleCameraBorder(bool enabled, ReactPromise<void> const& promise) noexcept
    {
        try {
            // TODO: Implement camera border toggle
            promise.Resolve();
        } catch (hresult_error const& ex) {
            promise.Reject(ex.message());
        }
    }

    void HappyRecorderNativeModule::TakePhoto(ReactPromise<std::string> const& promise) noexcept
    {
        try {
            // TODO: Implement photo capture
            promise.Reject(L"Not implemented");
        } catch (hresult_error const& ex) {
            promise.Reject(ex.message());
        }
    }

    // Audio Methods
    void HappyRecorderNativeModule::GetAudioDevices(ReactPromise<JSValueArray> const& promise) noexcept
    {
        try {
            JSValueArray devices;
            
            auto deviceTask = DeviceInformation::FindAllAsync(DeviceClass::AudioCapture);
            deviceTask.Completed([promise](auto&& result, auto&&) {
                auto deviceInfo = result.GetResults();
                JSValueArray devices;
                
                for (const auto& device : deviceInfo) {
                    JSValueObject dev;
                    dev["id"] = winrt::to_string(device.Id());
                    dev["name"] = winrt::to_string(device.Name());
                    dev["type"] = "microphone";
                    dev["isDefault"] = false;
                    dev["sampleRate"] = 48000;
                    dev["channels"] = 2;
                    devices.push_back(dev);
                }
                
                promise.Resolve(devices);
            });
        } catch (hresult_error const& ex) {
            promise.Reject(ex.message());
        }
    }

    void HappyRecorderNativeModule::InitializeMicrophone(JSValueObject const& config, ReactPromise<void> const& promise) noexcept
    {
        try {
            // TODO: Implement microphone initialization
            promise.Resolve();
        } catch (hresult_error const& ex) {
            promise.Reject(ex.message());
        }
    }

    void HappyRecorderNativeModule::StartMicrophone(ReactPromise<void> const& promise) noexcept
    {
        try {
            // TODO: Implement microphone start
            promise.Resolve();
        } catch (hresult_error const& ex) {
            promise.Reject(ex.message());
        }
    }

    void HappyRecorderNativeModule::StopMicrophone(ReactPromise<void> const& promise) noexcept
    {
        try {
            // TODO: Implement microphone stop
            promise.Resolve();
        } catch (hresult_error const& ex) {
            promise.Reject(ex.message());
        }
    }

    void HappyRecorderNativeModule::InitializeSystemAudio(JSValueObject const& config, ReactPromise<void> const& promise) noexcept
    {
        try {
            // TODO: Implement system audio initialization
            promise.Resolve();
        } catch (hresult_error const& ex) {
            promise.Reject(ex.message());
        }
    }

    void HappyRecorderNativeModule::StartSystemAudio(ReactPromise<void> const& promise) noexcept
    {
        try {
            // TODO: Implement system audio start
            promise.Resolve();
        } catch (hresult_error const& ex) {
            promise.Reject(ex.message());
        }
    }

    void HappyRecorderNativeModule::StopSystemAudio(ReactPromise<void> const& promise) noexcept
    {
        try {
            // TODO: Implement system audio stop
            promise.Resolve();
        } catch (hresult_error const& ex) {
            promise.Reject(ex.message());
        }
    }

    void HappyRecorderNativeModule::LoadBackgroundMusic(std::string const& filePath, ReactPromise<void> const& promise) noexcept
    {
        try {
            // TODO: Implement background music loading
            promise.Resolve();
        } catch (hresult_error const& ex) {
            promise.Reject(ex.message());
        }
    }

    void HappyRecorderNativeModule::StartBackgroundMusic(JSValueObject const& config, ReactPromise<void> const& promise) noexcept
    {
        try {
            // TODO: Implement background music start
            promise.Resolve();
        } catch (hresult_error const& ex) {
            promise.Reject(ex.message());
        }
    }

    void HappyRecorderNativeModule::StopBackgroundMusic(JSValueObject const& config, ReactPromise<void> const& promise) noexcept
    {
        try {
            // TODO: Implement background music stop
            promise.Resolve();
        } catch (hresult_error const& ex) {
            promise.Reject(ex.message());
        }
    }

    void HappyRecorderNativeModule::PauseBackgroundMusic(ReactPromise<void> const& promise) noexcept
    {
        try {
            // TODO: Implement background music pause
            promise.Resolve();
        } catch (hresult_error const& ex) {
            promise.Reject(ex.message());
        }
    }

    void HappyRecorderNativeModule::ResumeBackgroundMusic(ReactPromise<void> const& promise) noexcept
    {
        try {
            // TODO: Implement background music resume
            promise.Resolve();
        } catch (hresult_error const& ex) {
            promise.Reject(ex.message());
        }
    }

    void HappyRecorderNativeModule::SetAudioVolume(std::string const& source, double volume, ReactPromise<void> const& promise) noexcept
    {
        try {
            // TODO: Implement audio volume
            promise.Resolve();
        } catch (hresult_error const& ex) {
            promise.Reject(ex.message());
        }
    }

    void HappyRecorderNativeModule::MuteAudioSource(std::string const& source, bool mute, ReactPromise<void> const& promise) noexcept
    {
        try {
            // TODO: Implement audio mute
            promise.Resolve();
        } catch (hresult_error const& ex) {
            promise.Reject(ex.message());
        }
    }

    void HappyRecorderNativeModule::GetAudioLevels(ReactPromise<JSValueObject> const& promise) noexcept
    {
        try {
            JSValueObject levels;
            levels["microphone"] = 0.0;
            levels["system"] = 0.0;
            levels["background"] = 0.0;
            promise.Resolve(levels);
        } catch (hresult_error const& ex) {
            promise.Reject(ex.message());
        }
    }

    // Cleanup Methods
    void HappyRecorderNativeModule::CleanupScreenCapture(ReactPromise<void> const& promise) noexcept
    {
        try {
            // TODO: Cleanup screen capture
            promise.Resolve();
        } catch (hresult_error const& ex) {
            promise.Reject(ex.message());
        }
    }

    void HappyRecorderNativeModule::CleanupCamera(ReactPromise<void> const& promise) noexcept
    {
        try {
            // TODO: Cleanup camera
            promise.Resolve();
        } catch (hresult_error const& ex) {
            promise.Reject(ex.message());
        }
    }

    void HappyRecorderNativeModule::CleanupAudio(ReactPromise<void> const& promise) noexcept
    {
        try {
            // TODO: Cleanup audio
            promise.Resolve();
        } catch (hresult_error const& ex) {
            promise.Reject(ex.message());
        }
    }

    // Git Integration Methods
    void HappyRecorderNativeModule::GetGitCommit(std::string const& repoPath, ReactPromise<std::string> const& promise) noexcept
    {
        try {
            // Check if .git directory exists
            std::filesystem::path gitPath = std::filesystem::path(repoPath) / ".git";
            if (!std::filesystem::exists(gitPath)) {
                promise.Reject(L"Not a git repository");
                return;
            }

            // Read HEAD file to get commit hash
            std::filesystem::path headPath = gitPath / "HEAD";
            std::ifstream headFile(headPath);
            if (!headFile.is_open()) {
                promise.Reject(L"Failed to read HEAD");
                return;
            }

            std::string headContent;
            std::getline(headFile, headContent);
            headFile.close();

            // Parse HEAD content
            if (headContent.find("ref: ") == 0) {
                // Symbolic reference
                std::string refPath = headContent.substr(5);
                std::filesystem::path refFullPath = gitPath / refPath;
                std::ifstream refFile(refFullPath);
                if (!refFile.is_open()) {
                    promise.Reject(L"Failed to read ref");
                    return;
                }
                std::string commit;
                std::getline(refFile, commit);
                refFile.close();
                
                if (!commit.empty() && commit.back() == '\n') {
                    commit.pop_back();
                }
                if (commit.length() >= 7) {
                    promise.Resolve(commit.substr(0, 7));
                } else {
                    promise.Resolve(commit);
                }
            } else {
                // Direct commit hash
                if (headContent.length() >= 7) {
                    promise.Resolve(headContent.substr(0, 7));
                } else {
                    promise.Resolve(headContent);
                }
            }
        } catch (hresult_error const& ex) {
            promise.Reject(ex.message());
        } catch (const std::exception& ex) {
            promise.Reject(winrt::hstring(L"Git error: ") + winrt::hstring(ex.what()));
        }
    }

    void HappyRecorderNativeModule::GetGitBranch(std::string const& repoPath, ReactPromise<std::string> const& promise) noexcept
    {
        try {
            // Check if .git directory exists
            std::filesystem::path gitPath = std::filesystem::path(repoPath) / ".git";
            if (!std::filesystem::exists(gitPath)) {
                promise.Reject(L"Not a git repository");
                return;
            }

            // Read HEAD file to get branch
            std::filesystem::path headPath = gitPath / "HEAD";
            std::ifstream headFile(headPath);
            if (!headFile.is_open()) {
                promise.Reject(L"Failed to read HEAD");
                return;
            }

            std::string headContent;
            std::getline(headFile, headContent);
            headFile.close();

            // Parse HEAD content
            if (headContent.find("ref: refs/heads/") == 0) {
                std::string branch = headContent.substr(16);
                if (!branch.empty() && branch.back() == '\n') {
                    branch.pop_back();
                }
                promise.Resolve(branch);
            } else {
                // Detached HEAD state
                promise.Reject(L"Detached HEAD state");
            }
        } catch (hresult_error const& ex) {
            promise.Reject(ex.message());
        } catch (const std::exception& ex) {
            promise.Reject(winrt::hstring(L"Git error: ") + winrt::hstring(ex.what()));
        }
    }

    // Helper Methods
    void HappyRecorderNativeModule::EmitStatusUpdate()
    {
        if (m_captureState.isRecording) {
            auto duration = std::chrono::duration_cast<std::chrono::seconds>(
                std::chrono::steady_clock::now() - m_captureState.startTime
            ).count();
            
            JSValueObject status;
            status["duration"] = static_cast<double>(duration);
            status["isRecording"] = true;
            status["isPaused"] = m_captureState.isPaused;
            
            // Emit event to React Native
            m_reactContext.EmitJSEvent(L"onStatusUpdate", status);
        }
    }

    void HappyRecorderNativeModule::UpdateFileSize()
    {
        try {
            auto fileTask = StorageFile::GetFileFromPathAsync(m_captureState.outputPath);
            fileTask.Completed([this](auto&& fileResult, auto&&) {
                try {
                    auto file = fileResult.GetResults();
                    auto sizeTask = file.GetBasicPropertiesAsync();
                    sizeTask.Completed([this](auto&& sizeResult, auto&&) {
                        try {
                            auto properties = sizeResult.GetResults();
                            m_captureState.fileSize = properties.Size();
                        } catch (...) {
                            // Ignore file size errors
                        }
                    });
                } catch (...) {
                    // Ignore file errors
                }
            });
        } catch (...) {
            // Ignore errors
        }
    }

    void HappyRecorderNativeModule::RejectWithError(ReactPromise<void> const& promise, HRESULT hr, const std::string& message)
    {
        wchar_t errorMsg[256];
        swprintf_s(errorMsg, L"Error 0x%08X: %S", hr, message.c_str());
        promise.Reject(winrt::hstring(errorMsg));
    }

    void HappyRecorderNativeModule::RejectWithError(ReactPromise<JSValueObject> const& promise, HRESULT hr, const std::string& message)
    {
        wchar_t errorMsg[256];
        swprintf_s(errorMsg, L"Error 0x%08X: %S", hr, message.c_str());
        promise.Reject(winrt::hstring(errorMsg));
    }
}