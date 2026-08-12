import { NativeModules } from 'react-native';

export interface CameraConfig {
  deviceId?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  size?: { width: number; height: number };
  shape?: 'circle' | 'rounded' | 'square';
  border?: boolean;
  borderColor?: string;
  borderWidth?: number;
  opacity?: number;
  previewEnabled?: boolean;
}

export interface CameraDevice {
  id: string;
  name: string;
  facing: 'front' | 'back';
  resolutions: Array<{ width: number; height: number; fps: number }>;
}

class CameraCapture {
  private currentConfig: CameraConfig | null = null;
  private isActive: boolean = false;
  private activeDeviceId: string | null = null;

  /**
   * Get all available camera devices
   */
  async getDevices(): Promise<CameraDevice[]> {
    try {
      // @ts-ignore
      const devices = await NativeModules.HappyRecorderNative.getCameraDevices();
      return devices || [];
    } catch (error) {
      console.error('Failed to get happy camera devices:', error);
      // Mock data for development
      return [
        {
          id: 'camera-1',
          name: 'Integrated Webcam',
          facing: 'front',
          resolutions: [
            { width: 1920, height: 1080, fps: 30 },
            { width: 1280, height: 720, fps: 30 },
            { width: 640, height: 480, fps: 30 },
          ],
        },
        {
          id: 'camera-2',
          name: 'External Camera',
          facing: 'back',
          resolutions: [
            { width: 3840, height: 2160, fps: 30 },
            { width: 1920, height: 1080, fps: 60 },
            { width: 1280, height: 720, fps: 60 },
          ],
        },
      ];
    }
  }

  /**
   * Initialize camera capture
   */
  async initialize(config: CameraConfig): Promise<void> {
    try {
      this.currentConfig = config;
      this.isActive = false;

      const nativeConfig = {
        deviceId: config.deviceId || 'default',
        position: config.position || 'bottom-right',
        width: config.size?.width || 240,
        height: config.size?.height || 180,
        shape: config.shape || 'rounded',
        border: config.border || true,
        borderColor: config.borderColor || '#6c63ff',
        borderWidth: config.borderWidth || 2,
        opacity: config.opacity || 1.0,
        previewEnabled: config.previewEnabled || true,
      };

      // @ts-ignore
      await NativeModules.HappyRecorderNative.initializeCamera(nativeConfig);
      console.log('📷 happy Camera initialized:', config.deviceId || 'default');
    } catch (error) {
      console.error('Failed to initialize camera:', error);
      throw error;
    }
  }

  /**
   * Start camera capture
   */
  async start(): Promise<void> {
    try {
      if (!this.currentConfig) {
        throw new Error('Camera not initialized');
      }

      this.isActive = true;
      // @ts-ignore
      await NativeModules.HappyRecorderNative.startCamera();
      console.log('📷 happy Camera started');
    } catch (error) {
      console.error('Failed to start camera:', error);
      throw error;
    }
  }

  /**
   * Stop camera capture
   */
  async stop(): Promise<void> {
    try {
      this.isActive = false;
      // @ts-ignore
      await NativeModules.HappyRecorderNative.stopCamera();
      console.log('📷 happy Camera stopped');
    } catch (error) {
      console.error('Failed to stop camera:', error);
      throw error;
    }
  }

  /**
   * Update camera position
   */
  async setPosition(position: CameraConfig['position']): Promise<void> {
    try {
      // @ts-ignore
      await NativeModules.HappyRecorderNative.setCameraPosition(position);
      console.log('📷 happy Camera position updated:', position);
    } catch (error) {
      console.error('Failed to update camera position:', error);
    }
  }

  /**
   * Update camera size
   */
  async setSize(width: number, height: number): Promise<void> {
    try {
      // @ts-ignore
      await NativeModules.HappyRecorderNative.setCameraSize(width, height);
      console.log('📷 happy Camera size updated:', width, 'x', height);
    } catch (error) {
      console.error('Failed to update camera size:', error);
    }
  }

  /**
   * Update camera shape
   */
  async setShape(shape: CameraConfig['shape']): Promise<void> {
    try {
      // @ts-ignore
      await NativeModules.HappyRecorderNative.setCameraShape(shape);
      console.log('📷 Camera shape updated:', shape);
    } catch (error) {
      console.error('Failed to update camera shape:', error);
    }
  }

  /**
   * Toggle camera border
   */
  async toggleBorder(enabled: boolean): Promise<void> {
    try {
      // @ts-ignore
      await NativeModules.HappyRecorderNative.toggleCameraBorder(enabled);
      console.log('📷 happy Camera border:', enabled);
    } catch (error) {
      console.error('Failed to toggle camera border:', error);
    }
  }

  /**
   * Switch to different camera
   */
  async switchDevice(deviceId: string): Promise<void> {
    try {
      // @ts-ignore
      await NativeModules.HappyRecorderNative.switchCameraDevice(deviceId);
      this.activeDeviceId = deviceId;
      console.log('📷 happy Switched to camera:', deviceId);
    } catch (error) {
      console.error('Failed to switch camera:', error);
      throw error;
    }
  }

  /**
   * Take photo snapshot
   */
  async takePhoto(): Promise<string> {
    try {
      // @ts-ignore
      const photoPath = await NativeModules.HappyRecorderNative.takePhoto();
      console.log('📸 😁Photo taken:', photoPath);
      return photoPath;
    } catch (error) {
      console.error('Failed to take photo:', error);
      throw error;
    }
  }

  /**
   * Check if camera is active
   */
  isActiveCamera(): boolean {
    return this.isActive;
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    try {
      if (this.isActive) {
        await this.stop();
      }
      // @ts-ignore
      await NativeModules.HappyRecorderNative.cleanupCamera();
      this.currentConfig = null;
      this.activeDeviceId = null;
      console.log('🧹 happy Camera cleaned up');
    } catch (error) {
      console.error('Failed to cleanup happy camera:', error);
    }
  }

  /**
   * Get current camera status
   */
  getStatus(): { isActive: boolean; deviceId: string | null; config: CameraConfig | null } {
    return {
      isActive: this.isActive,
      deviceId: this.activeDeviceId,
      config: this.currentConfig,
    };
  }
}

// Export singleton instance
export const cameraCapture = new CameraCapture();
export default cameraCapture;