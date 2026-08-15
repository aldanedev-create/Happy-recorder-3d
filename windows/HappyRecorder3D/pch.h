#pragma once

#define NOMINMAX

#include <hstring.h>
#include <restrictederrorinfo.h>
#include <unknwn.h>
#include <windows.h>
#include <CppWinRTIncludes.h>
#include <VersionMacros.h>
#include <winrt/Windows.ApplicationModel.Activation.h>
#include <UI.Xaml.Controls.Primitives.h>
#include <UI.Xaml.Controls.h>
#include <UI.Xaml.Markup.h>
#include <UI.Xaml.Navigation.h>

#include <winrt/Microsoft.ReactNative.h>

#include <winrt/Microsoft.UI.Xaml.Automation.Peers.h>
#include <winrt/Microsoft.UI.Xaml.Controls.Primitives.h>
#include <winrt/Microsoft.UI.Xaml.Controls.h>
#include <winrt/Microsoft.UI.Xaml.Media.h>
#include <winrt/Microsoft.UI.Xaml.XamlTypeInfo.h>

// Needed by HappyRecorderNativeModule (folded into this project so its
// REACT_MODULE gets picked up by codegen -- see HappyRecorder3D.vcxproj).
#include <winrt/Windows.Media.Capture.h>
#include <winrt/Windows.Media.MediaProperties.h>
#include <winrt/Windows.Storage.h>
#include <winrt/Windows.Storage.Streams.h>
#include <winrt/Windows.Graphics.Display.h>
#include <winrt/Windows.Devices.Enumeration.h>
#include <winrt/Windows.Media.Devices.h>
#include <winrt/Windows.Media.Audio.h>
#include <winrt/Windows.System.h>
#include <winrt/Windows.UI.Core.h>

#include <string>
#include <vector>
#include <map>
#include <memory>
#include <functional>
#include <chrono>
#include <thread>
#include <filesystem>

using namespace winrt::Windows::Foundation;
using namespace winrt::Windows::System;
using namespace winrt::Windows::Storage;
using namespace winrt::Windows::Storage::Streams;
using namespace winrt::Windows::Devices::Enumeration;
using namespace winrt::Windows::Media;
using namespace winrt::Windows::Media::Capture;
using namespace winrt::Windows::Media::MediaProperties;
using namespace winrt::Windows::Media::Devices;
using namespace winrt::Windows::Media::Audio;
using namespace winrt::Windows::UI::Core;
