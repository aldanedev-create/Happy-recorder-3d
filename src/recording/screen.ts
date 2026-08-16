import { NativeModules } from 'react-native';

export interface ScreenCaptureConfig {
  fullScreen?: boolean;
  window?: boolean;
  region?: boolean;
  monitor?: boolean;
  regionBounds?: { x: number; y: number; width: number; height: number };
  displayId?: number;
  fps?: number;
  quality?: '720p' | '1080p' | '4K';
}

export interface DisplayInfo {
  id: number;
  name: string;
  width: number;
  height: number;
  refreshRate: number;
  isPrimary: boolean;
}

export interface WindowInfo {
  handle: number;
  title: string;
  processName: string;
  processId: number;
  bounds: { x: number; y: number; width: number; height: number };
}

// The native module's real method names (see HappyRecorderNativeModule.h)
// use "Recording", not "ScreenCapture" -- this file used to call methods
// like initializeScreenCapture/startScreenCapture that were never actually
// implemented natively under those names.
function getNativeModule(): Record<string, (...args: unknown[]) => Promise<unknown>> {
  const native = NativeModules.HappyRecorderNative;
  if (!native) {
    throw new Error(
      'HappyRecorderNative native module is not available. This usually means ' +
      'the native module failed to register at startup -- check that the app ' +
      'was built from the current windows/HappyRecorder3D project.'
    );
  }
  return native;
}

class ScreenCapture {
  private currentConfig: ScreenCaptureConfig | null = null;
  private isCapturing: boolean = false;

  /**
   * Show the OS's own capture picker (window/monitor thumbnails) and let
   * the user choose what to record. There's no manual enumeration here --
   * desktop window/monitor enumeration isn't available to this app's
   * AppContainer (UWP) sandbox, so the picker is the only supported way
   * to select a capture target.
   */
  async pickCaptureItem(): Promise<void> {
    await getNativeModule().PickCaptureItem();
  }

  /**
   * Initialize screen capture. A capture item must already have been
   * chosen via pickCaptureItem(), or this rejects.
   */
  async initialize(config: ScreenCaptureConfig): Promise<void> {
    try {
      this.currentConfig = config;
      this.isCapturing = false;

      const nativeConfig = {
        captureFullScreen: config.fullScreen ?? true,
        captureWindow: config.window ?? false,
        captureRegion: config.region ?? false,
        captureMonitor: config.monitor ?? false,
        regionBounds: config.regionBounds,
        displayId: config.displayId ?? 1,
        fps: config.fps ?? 60,
        quality: config.quality ?? '1080p',
      };

      await getNativeModule().InitializeRecording(nativeConfig);
      console.log('🖥️ Screen capture initialized');
    } catch (error) {
      console.error('Failed to initialize screen capture:', error);
      throw error;
    }
  }

  /**
   * Start screen capture
   */
  async start(): Promise<void> {
    try {
      if (!this.currentConfig) {
        throw new Error('Screen capture not initialized');
      }

      this.isCapturing = true;
      await getNativeModule().StartRecording();
      console.log('🖥️ Screen capture started');
    } catch (error) {
      console.error('Failed to start screen capture:', error);
      throw error;
    }
  }

  /**
   * Stop screen capture
   */
  async stop(): Promise<void> {
    try {
      this.isCapturing = false;
      await getNativeModule().StopRecording();
      console.log('🖥️ Screen capture stopped');
    } catch (error) {
      console.error('Failed to stop screen capture:', error);
      throw error;
    }
  }

  /**
   * Pause screen capture
   */
  async pause(): Promise<void> {
    try {
      await getNativeModule().PauseRecording();
      console.log('⏸️ Screen capture paused');
    } catch (error) {
      console.error('Failed to pause screen capture:', error);
      throw error;
    }
  }

  /**
   * Resume screen capture
   */
  async resume(): Promise<void> {
    try {
      await getNativeModule().ResumeRecording();
      console.log('▶️ Screen capture resumed');
    } catch (error) {
      console.error('Failed to resume screen capture:', error);
      throw error;
    }
  }

  /**
   * Check if currently capturing
   */
  isCapturingScreen(): boolean {
    return this.isCapturing;
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    try {
      if (this.isCapturing) {
        await this.stop();
      }
      await getNativeModule().CleanupScreenCapture();
      this.currentConfig = null;
      console.log('🧹 Screen capture cleaned up');
    } catch (error) {
      console.error('Failed to cleanup screen capture:', error);
    }
  }

  /**
   * Highlight cursor (for tutorial mode)
   */
  async highlightCursor(enabled: boolean, color?: string, size?: number): Promise<void> {
    try {
      await getNativeModule().HighlightCursor({
        enabled,
        color: color || '#ff6b6b',
        size: size || 24,
      });
    } catch (error) {
      console.error('Failed to highlight cursor:', error);
    }
  }

  /**
   * Add click effect (for tutorial mode)
   */
  async addClickEffect(enabled: boolean, color?: string, duration?: number): Promise<void> {
    try {
      await getNativeModule().AddClickEffect({
        enabled,
        color: color || '#ffd93d',
        duration: duration || 300,
      });
    } catch (error) {
      console.error('Failed to add click effect:', error);
    }
  }
}

// Export singleton instance
export const screenCapture = new ScreenCapture();
export default screenCapture;