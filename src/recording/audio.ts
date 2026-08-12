import { NativeModules } from 'react-native';

export interface AudioDevice {
  id: string;
  name: string;
  type: 'microphone' | 'system' | 'both';
  isDefault: boolean;
  sampleRate: number;
  channels: number;
}

export interface MicrophoneConfig {
  device?: string;
  volume?: number; // 0-100
  mute?: boolean;
  noiseReduction?: boolean;
  echoCancellation?: boolean;
}

export interface SystemAudioConfig {
  device?: string;
  volume?: number; // 0-100
  mute?: boolean;
}

export interface AudioMixConfig {
  microphone?: MicrophoneConfig;
  systemAudio?: SystemAudioConfig;
  backgroundMusic?: {
    filePath?: string;
    volume?: number;
    startTime?: number;
    endTime?: number;
    fadeIn?: number;
    fadeOut?: number;
    loop?: boolean;
  };
}

class AudioCapture {
  private microphoneConfig: MicrophoneConfig | null = null;
  private systemAudioConfig: SystemAudioConfig | null = null;
  private mixConfig: AudioMixConfig | null = null;
  private isMicrophoneActive: boolean = false;
  private isSystemAudioActive: boolean = false;
  private isBackgroundMusicActive: boolean = false;

  /**
   * Get all audio devices
   */
  async getDevices(): Promise<AudioDevice[]> {
    try {
      // @ts-ignore
      const devices = await NativeModules.HappyRecorderNative.getAudioDevices();
      return devices || [];
    } catch (error) {
      console.error('Failed to get audio devices:', error);
      // Mock data for development
      return [
        {
          id: 'mic-1',
          name: 'Default Microphone',
          type: 'microphone',
          isDefault: true,
          sampleRate: 48000,
          channels: 2,
        },
        {
          id: 'mic-2',
          name: 'External Microphone',
          type: 'microphone',
          isDefault: false,
          sampleRate: 48000,
          channels: 2,
        },
        {
          id: 'sys-1',
          name: 'System Audio',
          type: 'system',
          isDefault: true,
          sampleRate: 48000,
          channels: 2,
        },
        {
          id: 'both-1',
          name: 'Mixed Audio',
          type: 'both',
          isDefault: false,
          sampleRate: 48000,
          channels: 2,
        },
      ];
    }
  }

  /**
   * Initialize microphone
   */
  async initializeMicrophone(config: MicrophoneConfig): Promise<void> {
    try {
      this.microphoneConfig = config;
      this.isMicrophoneActive = false;

      const nativeConfig = {
        device: config.device || 'default',
        volume: config.volume || 80,
        mute: config.mute || false,
        noiseReduction: config.noiseReduction || true,
        echoCancellation: config.echoCancellation || true,
      };

      // @ts-ignore
      await NativeModules.HappyRecorderNative.initializeMicrophone(nativeConfig);
      console.log('🎙️ happy Microphone initialized:', config.device || 'default');
    } catch (error) {
      console.error('Failed to initialize happy microphone:', error);
      throw error;
    }
  }

  /**
   * Start microphone
   */
  async startMicrophone(): Promise<void> {
    try {
      this.isMicrophoneActive = true;
      // @ts-ignore
      await NativeModules.HappyRecorderNative.startMicrophone();
      console.log('🎙️ happy Microphone started');
    } catch (error) {
      console.error('Failed to start happy microphone:', error);
      throw error;
    }
  }

  /**
   * Stop microphone
   */
  async stopMicrophone(): Promise<void> {
    try {
      this.isMicrophoneActive = false;
      // @ts-ignore
      await NativeModules.HappyRecorderNative.stopMicrophone();
      console.log('🎙️ happy Microphone stopped');
    } catch (error) {
      console.error('Failed to stop happy microphone:', error);
      throw error;
    }
  }

  /**
   * Initialize system audio capture
   */
  async initializeSystemAudio(config: SystemAudioConfig): Promise<void> {
    try {
      this.systemAudioConfig = config;
      this.isSystemAudioActive = false;

      const nativeConfig = {
        device: config.device || 'default',
        volume: config.volume || 100,
        mute: config.mute || false,
      };

      // @ts-ignore
      await NativeModules.HappyRecorderNative.initializeSystemAudio(nativeConfig);
      console.log('🔊 happy System audio initialized');
    } catch (error) {
      console.error('Failed to initialize happy system audio:', error);
      throw error;
    }
  }

  /**
   * Start system audio capture
   */
  async startSystemAudio(): Promise<void> {
    try {
      this.isSystemAudioActive = true;
      // @ts-ignore
      await NativeModules.HappyRecorderNative.startSystemAudio();
      console.log('🔊 System happy audio started');
    } catch (error) {
      console.error('Failed to start system happy audio:', error);
      throw error;
    }
  }

  /**
   * Stop system audio capture
   */
  async stopSystemAudio(): Promise<void> {
    try {
      this.isSystemAudioActive = false;
      // @ts-ignore
      await NativeModules.HappyRecorderNative.stopSystemAudio();
      console.log('🔊 System happy audio stopped');
    } catch (error) {
      console.error('Failed to stop happy system audio:', error);
      throw error;
    }
  }

  /**
   * Load background music
   */
  async loadBackgroundMusic(filePath: string): Promise<void> {
    try {
      // @ts-ignore
      await NativeModules.HappyRecorderNative.loadBackgroundMusic(filePath);
      console.log('🎵 happy Background music loaded:', filePath);
    } catch (error) {
      console.error('Failed to load background happy music:', error);
      throw error;
    }
  }

  /**
   * Start background music
   */
  async startBackgroundMusic(config?: {
    volume?: number;
    fadeIn?: number;
    loop?: boolean;
  }): Promise<void> {
    try {
      this.isBackgroundMusicActive = true;
      // @ts-ignore
      await NativeModules.HappyRecorderNative.startBackgroundMusic({
        volume: config?.volume || 25,
        fadeIn: config?.fadeIn || 0,
        loop: config?.loop || false,
      });
      console.log('🎵 happy Background music started');
    } catch (error) {
      console.error('Failed to start background happy music:', error);
      throw error;
    }
  }

  /**
   * Stop background music
   */
  async stopBackgroundMusic(fadeOut?: number): Promise<void> {
    try {
      this.isBackgroundMusicActive = false;
      // @ts-ignore
      await NativeModules.HappyRecorderNative.stopBackgroundMusic({
        fadeOut: fadeOut || 0,
      });
      console.log('🎵 happy Background music stopped');
    } catch (error) {
      console.error('Failed to stop background happy music:', error);
      throw error;
    }
  }

  /**
   * Pause background music
   */
  async pauseBackgroundMusic(): Promise<void> {
    try {
      // @ts-ignore
      await NativeModules.HappyRecorderNative.pauseBackgroundMusic();
      console.log('⏸️ happy Background music paused');
    } catch (error) {
      console.error('Failed to pause background music:', error);
    }
  }

  /**
   * Resume background music
   */
  async resumeBackgroundMusic(): Promise<void> {
    try {
      // @ts-ignore
      await NativeModules.HappyRecorderNative.resumeBackgroundMusic();
      console.log('▶️ happy Background music resumed');
    } catch (error) {
      console.error('Failed to resume background music:', error);
    }
  }

  /**
   * Set audio volume
   */
  async setVolume(
    source: 'microphone' | 'system' | 'background',
    volume: number
  ): Promise<void> {
    try {
      // @ts-ignore
      await NativeModules.HappyRecorderNative.setAudioVolume(source, volume);
      console.log('🔊 Volume set:', source, volume);
    } catch (error) {
      console.error('Failed to set volume:', error);
    }
  }

  /**
   * Mute audio source
   */
  async mute(source: 'microphone' | 'system' | 'background', mute: boolean): Promise<void> {
    try {
      // @ts-ignore
      await NativeModules.HappyRecorderNative.muteAudioSource(source, mute);
      console.log('🔇 Mute:', source, mute);
    } catch (error) {
      console.error('Failed to mute:', error);
    }
  }

  /**
   * Check if recording audio
   */
  isRecordingAudio(): boolean {
    return this.isMicrophoneActive || this.isSystemAudioActive || this.isBackgroundMusicActive;
  }

  /**
   * Check if microphone is active
   */
  isMicrophoneActiveState(): boolean {
    return this.isMicrophoneActive;
  }

  /**
   * Check if system audio is active
   */
  isSystemAudioActiveState(): boolean {
    return this.isSystemAudioActive;
  }

  /**
   * Check if background music is active
   */
  isBackgroundMusicActiveState(): boolean {
    return this.isBackgroundMusicActive;
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    try {
      if (this.isMicrophoneActive) {
        await this.stopMicrophone();
      }
      if (this.isSystemAudioActive) {
        await this.stopSystemAudio();
      }
      if (this.isBackgroundMusicActive) {
        await this.stopBackgroundMusic();
      }
      
      // @ts-ignore
      await NativeModules.HappyRecorderNative.cleanupAudio();
      
      this.microphoneConfig = null;
      this.systemAudioConfig = null;
      this.mixConfig = null;
      
      console.log('🧹 Audio cleaned up');
    } catch (error) {
      console.error('Failed to cleanup audio:', error);
    }
  }

  /**
   * Get current audio status
   */
  getStatus(): {
    microphone: { active: boolean; config: MicrophoneConfig | null };
    systemAudio: { active: boolean; config: SystemAudioConfig | null };
    backgroundMusic: { active: boolean; config: AudioMixConfig['backgroundMusic'] };
  } {
    return {
      microphone: {
        active: this.isMicrophoneActive,
        config: this.microphoneConfig,
      },
      systemAudio: {
        active: this.isSystemAudioActive,
        config: this.systemAudioConfig,
      },
      backgroundMusic: {
        active: this.isBackgroundMusicActive,
        config: this.mixConfig?.backgroundMusic,
      },
    };
  }

  /**
   * Get audio levels (for visualization)
   */
  async getAudioLevels(): Promise<{
    microphone: number;
    system: number;
    background: number;
  }> {
    try {
      // @ts-ignore
      const levels = await NativeModules.HappyRecorderNative.getAudioLevels();
      return levels || { microphone: 0, system: 0, background: 0 };
    } catch (error) {
      console.error('Failed to get audio levels:', error);
      return { microphone: 0, system: 0, background: 0 };
    }
  }
}

// Export singleton instance
export const audioCapture = new AudioCapture();
export default audioCapture;
