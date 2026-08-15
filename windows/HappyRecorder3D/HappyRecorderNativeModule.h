#pragma once

#include "pch.h"
#include <NativeModules.h>

using namespace winrt::Microsoft::ReactNative;

namespace winrt::HappyRecorderNative
{
    // Structure to hold capture state
    struct CaptureState
    {
        bool isInitialized = false;
        bool isRecording = false;
        bool isPaused = false;
        winrt::hstring outputPath;
        winrt::Windows::Media::Capture::MediaCapture mediaCapture{ nullptr };
        winrt::Windows::Media::Capture::MediaCapture cameraCapture{ nullptr };
        winrt::Windows::Media::Audio::AudioGraph audioGraph{ nullptr };
        winrt::Windows::Media::Audio::AudioDeviceInputNode microphoneNode{ nullptr };
        winrt::Windows::Media::Audio::AudioDeviceOutputNode systemAudioNode{ nullptr };
        std::chrono::steady_clock::time_point startTime;
        uint64_t fileSize = 0;
        double fps = 60.0;
        std::string quality = "1080p";
    };

    // This is the public JavaScript module name used by nativeService.
    REACT_MODULE(HappyRecorderNative)
    struct HappyRecorderNativeModule
    {
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

        // Screen Capture
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

        // Camera
        REACT_METHOD(GetCameraDevices)
        void GetCameraDevices(ReactPromise<JSValueArray> const& promise) noexcept;

        REACT_METHOD(InitializeCamera)
        void InitializeCamera(JSValueObject const& config, ReactPromise<void> const& promise) noexcept;

        REACT_METHOD(StartCamera)
        void StartCamera(ReactPromise<void> const& promise) noexcept;

        REACT_METHOD(StopCamera)
        void StopCamera(ReactPromise<void> const& promise) noexcept;

        REACT_METHOD(SetCameraPosition)
        void SetCameraPosition(std::string const& position, ReactPromise<void> const& promise) noexcept;

        REACT_METHOD(SetCameraSize)
        void SetCameraSize(double width, double height, ReactPromise<void> const& promise) noexcept;

        REACT_METHOD(SetCameraShape)
        void SetCameraShape(std::string const& shape, ReactPromise<void> const& promise) noexcept;

        REACT_METHOD(ToggleCameraBorder)
        void ToggleCameraBorder(bool enabled, ReactPromise<void> const& promise) noexcept;

        REACT_METHOD(TakePhoto)
        void TakePhoto(ReactPromise<std::string> const& promise) noexcept;

        // Audio
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
        void StopBackgroundMusic(JSValueObject const& config, ReactPromise<void> const& promise) noexcept;

        REACT_METHOD(PauseBackgroundMusic)
        void PauseBackgroundMusic(ReactPromise<void> const& promise) noexcept;

        REACT_METHOD(ResumeBackgroundMusic)
        void ResumeBackgroundMusic(ReactPromise<void> const& promise) noexcept;

        REACT_METHOD(SetAudioVolume)
        void SetAudioVolume(std::string const& source, double volume, ReactPromise<void> const& promise) noexcept;

        REACT_METHOD(MuteAudioSource)
        void MuteAudioSource(std::string const& source, bool mute, ReactPromise<void> const& promise) noexcept;

        REACT_METHOD(GetAudioLevels)
        void GetAudioLevels(ReactPromise<JSValueObject> const& promise) noexcept;

        // Cleanup
        REACT_METHOD(CleanupScreenCapture)
        void CleanupScreenCapture(ReactPromise<void> const& promise) noexcept;

        REACT_METHOD(CleanupCamera)
        void CleanupCamera(ReactPromise<void> const& promise) noexcept;

        REACT_METHOD(CleanupAudio)
        void CleanupAudio(ReactPromise<void> const& promise) noexcept;

        // Git Integration
        REACT_METHOD(GetGitCommit)
        void GetGitCommit(std::string const& repoPath, ReactPromise<std::string> const& promise) noexcept;

        REACT_METHOD(GetGitBranch)
        void GetGitBranch(std::string const& repoPath, ReactPromise<std::string> const& promise) noexcept;

    private:
        ReactContext m_reactContext;
        CaptureState m_captureState;
        
        // Helper methods
        winrt::Windows::Graphics::SizeInt32 GetScreenSize();
        std::vector<DeviceInformation> EnumerateDevices(DeviceClass deviceClass);
        winrt::hstring GetCurrentTimestamp();
        void EmitStatusUpdate();
        void UpdateFileSize();
        
        // Error handling
        void RejectWithError(ReactPromise<void> const& promise, HRESULT hr, const std::string& message);
        void RejectWithError(ReactPromise<JSValueObject> const& promise, HRESULT hr, const std::string& message);
    };
}
