#pragma once

#include "pch.h"
#include <NativeModules.h>
#include <winrt/Windows.Graphics.Capture.h>
#include <winrt/Windows.Graphics.DirectX.Direct3D11.h>
#include <winrt/Windows.Media.Capture.h>
#include <winrt/Windows.Media.MediaProperties.h>
#include <winrt/Windows.Media.Audio.h>
#include <winrt/Windows.Media.Devices.h>
#include <winrt/Windows.Devices.Enumeration.h>
#include <winrt/Windows.Storage.h>
#include <windows.graphics.capture.interop.h>
#include <windows.graphics.directx.direct3d11.interop.h>
#include <d3d11.h>
#include <mfapi.h>
#include <mfidl.h>
#include <mfreadwrite.h>
#include <chrono>
#include <mutex>
#include <atomic>
#include <thread>
#include <vector>

using namespace winrt::Microsoft::ReactNative;
using namespace winrt::Windows::Graphics::Capture;
using namespace winrt::Windows::Graphics::DirectX::Direct3D11;
using namespace winrt::Windows::Media::Capture;
using namespace winrt::Windows::Media::MediaProperties;
using namespace winrt::Windows::Media::Audio;
using namespace winrt::Windows::Media::Devices;
using namespace winrt::Windows::Devices::Enumeration;
using namespace winrt::Windows::Storage;
// DO NOT use: using namespace Microsoft::WRL;

namespace winrt::HappyRecorder3D::implementation
{
    struct CaptureState
    {
        bool isInitialized = false;
        bool isRecording = false;
        bool isPaused = false;
        bool isMicrophoneEnabled = false;
        bool isSystemAudioEnabled = false;
        bool isCameraEnabled = false;
        
        std::wstring outputPath;
        double fps = 30.0;
        uint64_t fileSize = 0;
        
        GraphicsCaptureItem captureItem{ nullptr };
        Direct3D11CaptureFramePool framePool{ nullptr };
        GraphicsCaptureSession captureSession{ nullptr };
        
        winrt::com_ptr<ID3D11Device> d3dDevice;
        winrt::com_ptr<ID3D11DeviceContext> d3dContext;
        
        winrt::com_ptr<IMFSinkWriter> sinkWriter;
        DWORD videoStreamIndex = 0;
        DWORD audioStreamIndex = 0;
        LONGLONG frameDuration = 0;
        
        MediaCapture cameraCapture{ nullptr };
        AudioGraph audioGraph{ nullptr };
        AudioDeviceInputNode microphoneNode{ nullptr };
        AudioDeviceOutputNode systemAudioNode{ nullptr };
        AudioFileInputNode backgroundMusicNode{ nullptr };
        
        std::chrono::steady_clock::time_point startTime;
        std::chrono::steady_clock::time_point pauseTime;
        std::chrono::milliseconds totalPausedDuration{ 0 };
        
        void Reset()
        {
            isInitialized = false;
            isRecording = false;
            isPaused = false;
            isMicrophoneEnabled = false;
            isSystemAudioEnabled = false;
            isCameraEnabled = false;
            fileSize = 0;
            captureItem = nullptr;
            framePool = nullptr;
            captureSession = nullptr;
            d3dDevice = nullptr;
            d3dContext = nullptr;
            sinkWriter = nullptr;
            cameraCapture = nullptr;
            audioGraph = nullptr;
            microphoneNode = nullptr;
            systemAudioNode = nullptr;
            backgroundMusicNode = nullptr;
        }
    };

    REACT_MODULE(HappyRecorderNative)
    struct HappyRecorderNativeModule
    {
        HappyRecorderNativeModule() = default;
        ~HappyRecorderNativeModule();

        REACT_INIT(Initialize)
        void Initialize(ReactContext const& reactContext) noexcept;

        // Recording Methods
        REACT_METHOD(InitializeRecording)
        void InitializeRecording(JSValueObject const& config, ReactPromise<void> const& promise) noexcept;

        REACT_METHOD(StartRecording)
        void StartRecording(ReactPromise<void> const& promise) noexcept;

        REACT_METHOD(StopRecording)
        void StopRecording(ReactPromise<JSValueObject> const& promise) noexcept;

        REACT_METHOD(PauseRecording)
        void PauseRecording(ReactPromise<void> const& promise) noexcept;

        REACT_METHOD(ResumeRecording)
        void ResumeRecording(ReactPromise<void> const& promise) noexcept;

        REACT_METHOD(GetStatus)
        void GetStatus(ReactPromise<JSValueObject> const& promise) noexcept;

        // Display/Window Methods
        REACT_METHOD(GetDisplays)
        void GetDisplays(ReactPromise<JSValueArray> const& promise) noexcept;

        REACT_METHOD(GetWindows)
        void GetWindows(ReactPromise<JSValueArray> const& promise) noexcept;

        REACT_METHOD(GetCursorPosition)
        void GetCursorPosition(ReactPromise<JSValueObject> const& promise) noexcept;

        REACT_METHOD(HighlightCursor)
        void HighlightCursor(JSValueObject const& config, ReactPromise<void> const& promise) noexcept;

        REACT_METHOD(AddClickEffect)
        void AddClickEffect(JSValueObject const& config, ReactPromise<void> const& promise) noexcept;

        // Camera Methods
        REACT_METHOD(GetCameraDevices)
        void GetCameraDevices(ReactPromise<JSValueArray> const& promise) noexcept;

        REACT_METHOD(InitializeCamera)
        void InitializeCamera(JSValueObject const& config, ReactPromise<void> const& promise) noexcept;

        REACT_METHOD(StartCamera)
        void StartCamera(ReactPromise<void> const& promise) noexcept;

        REACT_METHOD(StopCamera)
        void StopCamera(ReactPromise<void> const& promise) noexcept;

        REACT_METHOD(TakePhoto)
        void TakePhoto(ReactPromise<std::string> const& promise) noexcept;

        // Audio Methods
        REACT_METHOD(GetAudioDevices)
        void GetAudioDevices(ReactPromise<JSValueArray> const& promise) noexcept;

        REACT_METHOD(InitializeMicrophone)
        void InitializeMicrophone(JSValueObject const& config, ReactPromise<void> const& promise) noexcept;

        REACT_METHOD(StartMicrophone)
        void StartMicrophone(ReactPromise<void> const& promise) noexcept;

        REACT_METHOD(StopMicrophone)
        void StopMicrophone(ReactPromise<void> const& promise) noexcept;

        REACT_METHOD(InitializeSystemAudio)
        void InitializeSystemAudio(JSValueObject const& config, ReactPromise<void> const& promise) noexcept;

        REACT_METHOD(StartSystemAudio)
        void StartSystemAudio(ReactPromise<void> const& promise) noexcept;

        REACT_METHOD(StopSystemAudio)
        void StopSystemAudio(ReactPromise<void> const& promise) noexcept;

        REACT_METHOD(LoadBackgroundMusic)
        void LoadBackgroundMusic(std::string const& filePath, ReactPromise<void> const& promise) noexcept;

        REACT_METHOD(StartBackgroundMusic)
        void StartBackgroundMusic(JSValueObject const& config, ReactPromise<void> const& promise) noexcept;

        REACT_METHOD(StopBackgroundMusic)
        void StopBackgroundMusic(ReactPromise<void> const& promise) noexcept;

        REACT_METHOD(SetAudioVolume)
        void SetAudioVolume(std::string const& source, double volume, ReactPromise<void> const& promise) noexcept;

        // Cleanup Methods
        REACT_METHOD(CleanupScreenCapture)
        void CleanupScreenCapture(ReactPromise<void> const& promise) noexcept;

        REACT_METHOD(CleanupCamera)
        void CleanupCamera(ReactPromise<void> const& promise) noexcept;

        REACT_METHOD(CleanupAudio)
        void CleanupAudio(ReactPromise<void> const& promise) noexcept;

        // Git Methods
        REACT_METHOD(GetGitCommit)
        void GetGitCommit(std::string const& repoPath, ReactPromise<std::string> const& promise) noexcept;

        REACT_METHOD(GetGitBranch)
        void GetGitBranch(std::string const& repoPath, ReactPromise<std::string> const& promise) noexcept;

    private:
        ReactContext m_reactContext;
        CaptureState m_captureState;
        std::mutex m_stateMutex;
        
        HRESULT InitializeMediaFoundation(const std::wstring& outputPath, UINT32 width, UINT32 height, UINT32 fps);
        HRESULT WriteVideoFrame(ID3D11Texture2D* texture, LONGLONG timestamp);
        void CleanupMediaFoundation();
        void EmitStatusUpdate();
    };
}