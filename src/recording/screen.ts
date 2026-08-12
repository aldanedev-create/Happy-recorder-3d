import { NativeModules } from 'react-native';
import { recorder } from './recorder';

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

class ScreenCapture {
  private currentConfig: ScreenCaptureConfig | null = null;
  private isCapturing: boolean = false;

  /**
   * Get all available displays
   */
  async getDisplays(): Promise<DisplayInfo[]> {
    try {
      // @ts-ignore
      const displays = await NativeModules.HappyRecorderNative.getDisplays();
      return displays;
    } catch (error) {
      console.error('Failed to get displays:', error);
      // Return mock data for development
      return [
        { id: 1, name: 'Display 1', width: 1920, height: 1080, refreshRate: 60, isPrimary: true },
        { id: 2, name: 'Display 2', width: 1920, height: 1080, refreshRate: 60, isPrimary: false },
      ];
    }
  }

  /**
   * Get all open windows
   */
  async getWindows(): Promise<WindowInfo[]> {
    try {
      // @ts-ignore
      const windows = await NativeModules.HappyRecorderNative.getWindows();
      return windows;
    } catch (error) {
      console.error('Failed to get windows:', error);
      return [];
    }
  }

  /**
   * Initialize screen capture
   */
  async initialize(config: ScreenCaptureConfig): Promise<void> {
    try {
      this.currentConfig = config;
      this.isCapturing = false;

      const nativeConfig = {
        captureFullScreen: config.fullScreen || true,
        captureWindow: config.window || false,
        captureRegion: config.region || false,
        captureMonitor: config.monitor || false,
        regionBounds: config.regionBounds,
        displayId: config.displayId || 1,
        fps: config.fps || 60,
        quality: config.quality || '1080p',
      };

      // @ts-ignore
      await NativeModules.HappyRecorderNative.initializeScreenCapture(nativeConfig);
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
      // @ts-ignore
      await NativeModules.HappyRecorderNative.startScreenCapture();
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
      // @ts-ignore
      await NativeModules.HappyRecorderNative.stopScreenCapture();
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
      // @ts-ignore
      await NativeModules.HappyRecorderNative.pauseScreenCapture();
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
      // @ts-ignore
      await NativeModules.HappyRecorderNative.resumeScreenCapture();
      console.log('▶️ Screen capture resumed');
    } catch (error) {
      console.error('Failed to resume screen capture:', error);
      throw error;
    }
  }

  /**
   * Select a region for recording
   */
  async selectRegion(): Promise<{ x: number; y: number; width: number; height: number } | null> {
    try {
      // @ts-ignore
      const region = await NativeModules.HappyRecorderNative.selectRegion();
      return region;
    } catch (error) {
      console.error('Failed to select region:', error);
      return null;
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
      // @ts-ignore
      await NativeModules.HappyRecorderNative.cleanupScreenCapture();
      this.currentConfig = null;
      console.log('🧹 Screen capture cleaned up');
    } catch (error) {
      console.error('Failed to cleanup screen capture:', error);
    }
  }

  /**
   * Get cursor position
   */
  async getCursorPosition(): Promise<{ x: number; y: number }> {
    try {
      // @ts-ignore
      const position = await NativeModules.HappyRecorderNative.getCursorPosition();
      return position;
    } catch (error) {
      console.error('Failed to get cursor position:', error);
      return { x: 0, y: 0 };
    }
  }

  /**
   * Highlight cursor (for tutorial mode)
   */
  async highlightCursor(enabled: boolean, color?: string, size?: number): Promise<void> {
    try {
      // @ts-ignore
      await NativeModules.HappyRecorderNative.highlightCursor({
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
      // @ts-ignore
      await NativeModules.HappyRecorderNative.addClickEffect({
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