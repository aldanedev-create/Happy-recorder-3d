#pragma once

#include <winrt/Windows.Foundation.h>
#include <winrt/Windows.Foundation.Collections.h>
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

#include <ReactWindowsCore/ReactWindowsCore.h>
#include <ReactWindowsCore/ReactPromise.h>

#include <winrt/Microsoft.ReactNative.h>
#include <winrt/Microsoft.ReactNative.NativeModules.h>

#include <string>
#include <vector>
#include <map>
#include <memory>
#include <functional>
#include <chrono>
#include <thread>
#include <filesystem>

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