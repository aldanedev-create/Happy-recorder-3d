import { NativeModules, Platform } from 'react-native';

export interface NativeModule {
  // Recording
  initialize: (config: any) => Promise<any>;
  startRecording: () => Promise<any>;
  stopRecording: () => Promise<any>;
  pauseRecording: () => Promise<any>;
  resumeRecording: () => Promise<any>;
  getStatus: () => Promise<any>;

  // Screen Capture
  // Shows the OS's own capture picker (window/monitor thumbnails) and
  // stores the user's selection natively -- there's no manual
  // enumeration API, since desktop window/monitor enumeration isn't
  // available to this app's AppContainer (UWP) sandbox.
  pickCaptureItem: () => Promise<void>;
  highlightCursor: (config: any) => Promise<void>;
  addClickEffect: (config: any) => Promise<void>;

  // Camera
  getCameraDevices: () => Promise<any[]>;
  initializeCamera: (config: any) => Promise<void>;
  startCamera: () => Promise<void>;
  stopCamera: () => Promise<void>;
  setCameraPosition: (position: string) => Promise<void>;
  setCameraSize: (width: number, height: number) => Promise<void>;
  setCameraShape: (shape: string) => Promise<void>;
  toggleCameraBorder: (enabled: boolean) => Promise<void>;
  takePhoto: () => Promise<string>;

  // Audio
  getAudioDevices: () => Promise<any[]>;
  initializeMicrophone: (config: any) => Promise<void>;
  startMicrophone: () => Promise<void>;
  stopMicrophone: () => Promise<void>;
  initializeSystemAudio: (config: any) => Promise<void>;
  startSystemAudio: () => Promise<void>;
  stopSystemAudio: () => Promise<void>;
  loadBackgroundMusic: (filePath: string) => Promise<void>;
  startBackgroundMusic: (config: any) => Promise<void>;
  stopBackgroundMusic: (config: any) => Promise<void>;
  pauseBackgroundMusic: () => Promise<void>;
  resumeBackgroundMusic: () => Promise<void>;
  setAudioVolume: (source: string, volume: number) => Promise<void>;
  muteAudioSource: (source: string, mute: boolean) => Promise<void>;
  getAudioLevels: () => Promise<any>;

  // Media
  getMediaInfo: (filePath: string) => Promise<any>;
  getVideoThumbnail: (filePath: string, time: number) => Promise<string>;

  // Git
  getGitCommit: (repoPath: string) => Promise<string>;
  getGitBranch: (repoPath: string) => Promise<string>;

  // System
  getSystemInfo: () => Promise<any>;
  getScreenResolution: () => Promise<{ width: number; height: number }>;
  getAvailableMemory: () => Promise<number>;
}

class NativeService {
  private module: any;

  constructor() {
    const rawModule = NativeModules.HappyRecorderNative;
    this.module = rawModule ? this.normalizeNativeModule(rawModule) : this.createMockModule();
  }

  private normalizeNativeModule(module: Record<string, unknown>): NativeModule {
    const call = <T>(name: string, ...args: unknown[]): Promise<T> => {
      const method = module[name] as ((...methodArgs: unknown[]) => Promise<T>) | undefined;
      if (!method) return Promise.reject(new Error(`Native method ${name} is unavailable`));
      return method(...args);
    };

    return {
      ...module,
      initialize: (config) => call('InitializeRecording', config),
      startRecording: () => call('StartRecording'),
      stopRecording: () => call('StopRecording'),
      pauseRecording: () => call('PauseRecording'),
      resumeRecording: () => call('ResumeRecording'),
      getStatus: () => call('GetStatus'),
    } as NativeModule;
  }

  /**
   * Create mock module for development
   */
  private createMockModule(): any {
    console.warn('⚠️ Using mock native module - implement HappyRecorderNative for production');
    return {
      // Recording
      initialize: (config: any) => Promise.resolve({ success: true }),
      startRecording: () => Promise.resolve({ success: true }),
      stopRecording: () => Promise.resolve({ success: true, fileSize: 1024 * 1024 }),
      pauseRecording: () => Promise.resolve({ success: true }),
      resumeRecording: () => Promise.resolve({ success: true }),
      getStatus: () => Promise.resolve({ duration: 0, fileSize: 0 }),

      // Screen Capture
      pickCaptureItem: () => Promise.resolve(),
      highlightCursor: (config: any) => Promise.resolve(),
      addClickEffect: (config: any) => Promise.resolve(),

      // Camera
      getCameraDevices: () => Promise.resolve([
        { id: 'camera-1', name: 'Integrated Webcam', facing: 'front' },
      ]),
      initializeCamera: (config: any) => Promise.resolve(),
      startCamera: () => Promise.resolve(),
      stopCamera: () => Promise.resolve(),
      setCameraPosition: (position: string) => Promise.resolve(),
      setCameraSize: (width: number, height: number) => Promise.resolve(),
      setCameraShape: (shape: string) => Promise.resolve(),
      toggleCameraBorder: (enabled: boolean) => Promise.resolve(),
      takePhoto: () => Promise.resolve('/path/to/photo.jpg'),

      // Audio
      getAudioDevices: () => Promise.resolve([
        { id: 'mic-1', name: 'Default Microphone', type: 'microphone', isDefault: true },
      ]),
      initializeMicrophone: (config: any) => Promise.resolve(),
      startMicrophone: () => Promise.resolve(),
      stopMicrophone: () => Promise.resolve(),
      initializeSystemAudio: (config: any) => Promise.resolve(),
      startSystemAudio: () => Promise.resolve(),
      stopSystemAudio: () => Promise.resolve(),
      loadBackgroundMusic: (filePath: string) => Promise.resolve(),
      startBackgroundMusic: (config: any) => Promise.resolve(),
      stopBackgroundMusic: (config: any) => Promise.resolve(),
      pauseBackgroundMusic: () => Promise.resolve(),
      resumeBackgroundMusic: () => Promise.resolve(),
      setAudioVolume: (source: string, volume: number) => Promise.resolve(),
      muteAudioSource: (source: string, mute: boolean) => Promise.resolve(),
      getAudioLevels: () => Promise.resolve({ microphone: 0, system: 0, background: 0 }),

      // Media
      getMediaInfo: (filePath: string) => Promise.resolve({
        duration: 60,
        width: 1920,
        height: 1080,
        fps: 60,
        codec: 'h264',
        hasVideo: true,
        hasAudio: true,
      }),
      getVideoThumbnail: (filePath: string, time: number) => Promise.resolve('/path/to/thumbnail.jpg'),

      // Git
      getGitCommit: (repoPath: string) => Promise.resolve('a1b2c3d'),
      getGitBranch: (repoPath: string) => Promise.resolve('main'),

      // System
      getSystemInfo: () => Promise.resolve({
        os: 'Windows 11',
        version: '10.0.22621',
        architecture: 'x64',
        processor: 'Intel Core i7',
        memory: 16 * 1024 * 1024 * 1024,
      }),
      getScreenResolution: () => Promise.resolve({ width: 1920, height: 1080 }),
      getAvailableMemory: () => Promise.resolve(8 * 1024 * 1024 * 1024),
    };
  }

  /**
   * Get the native module
   */
  getModule(): NativeModule {
    return this.module;
  }

  /**
   * Check if native module is available
   */
  isAvailable(): boolean {
    return !!NativeModules.HappyRecorderNative;
  }

  /**
   * Get platform info
   */
  getPlatformInfo(): { platform: string; version: string } {
    return {
      platform: Platform.OS,
      version: Platform.Version as string,
    };
  }

  /**
   * Check if running on Windows
   */
  isWindows(): boolean {
    return Platform.OS === 'windows';
  }

  /**
   * Check if running in development
   */
  isDevelopment(): boolean {
    return __DEV__;
  }

  /**
   * Get system info
   */
  async getSystemInfo(): Promise<any> {
    try {
      return await this.module.getSystemInfo();
    } catch (error) {
      console.error('Failed to get system info:', error);
      return {
        os: Platform.OS,
        version: Platform.Version,
      };
    }
  }

  /**
   * Get screen resolution
   */
  async getScreenResolution(): Promise<{ width: number; height: number }> {
    try {
      return await this.module.getScreenResolution();
    } catch (error) {
      console.error('Failed to get screen resolution:', error);
      return { width: 1920, height: 1080 };
    }
  }

  /**
   * Get available memory
   */
  async getAvailableMemory(): Promise<number> {
    try {
      return await this.module.getAvailableMemory();
    } catch (error) {
      console.error('Failed to get available memory:', error);
      return 4 * 1024 * 1024 * 1024; // 4GB fallback
    }
  }

  /**
   * Check if feature is available
   */
  isFeatureAvailable(feature: string): boolean {
    // Check if the native module supports the feature
    return typeof this.module[feature] === 'function';
  }

  /**
   * Get feature list
   */
  getAvailableFeatures(): string[] {
    if (!this.module) return [];
    return Object.keys(this.module).filter(key => typeof this.module[key] === 'function');
  }
}

// Export singleton instance
export const nativeService = new NativeService();
export default nativeService;