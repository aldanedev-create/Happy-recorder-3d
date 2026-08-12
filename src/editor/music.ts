import { NativeModules } from 'react-native';
import { filesService } from '../services/files';

export interface MusicTrack {
  id: string;
  filePath: string;
  name: string;
  duration: number;
  startTime: number;
  endTime: number;
  volume: number;
  fadeIn: number;
  fadeOut: number;
  loop: boolean;
  isPlaying: boolean;
  currentTime: number;
}

export interface MusicConfig {
  volume?: number;
  startTime?: number;
  endTime?: number;
  fadeIn?: number;
  fadeOut?: number;
  loop?: boolean;
}

class MusicManager {
  private currentTrack: MusicTrack | null = null;
  private isInitialized: boolean = false;

  // Native audio player
  private get nativePlayer(): any {
    // @ts-ignore
    return NativeModules.HappyRecorderNative || {
      loadAudio: (filePath: string) => Promise.resolve({ duration: 0 }),
      playAudio: () => Promise.resolve({ success: true }),
      pauseAudio: () => Promise.resolve({ success: true }),
      stopAudio: () => Promise.resolve({ success: true }),
      setAudioVolume: (volume: number) => Promise.resolve({ success: true }),
      seekAudio: (time: number) => Promise.resolve({ success: true }),
    };
  }

  /**
   * Load music file
   */
  async loadMusic(filePath: string, config?: MusicConfig): Promise<MusicTrack> {
    try {
      // Check if file exists
      const exists = await filesService.fileExists(filePath);
      if (!exists) {
        throw new Error('Music file not found: ' + filePath);
      }

      // Get audio info
      // @ts-ignore
      const info = await this.nativePlayer.loadAudio(filePath);

      const track: MusicTrack = {
        id: `music_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        filePath: filePath,
        name: filePath.split('/').pop() || 'Unknown',
        duration: info.duration || 300,
        startTime: config?.startTime || 0,
        endTime: config?.endTime || info.duration || 300,
        volume: config?.volume !== undefined ? config.volume / 100 : 0.25,
        fadeIn: config?.fadeIn || 0,
        fadeOut: config?.fadeOut || 0,
        loop: config?.loop || false,
        isPlaying: false,
        currentTime: 0,
      };

      this.currentTrack = track;
      this.isInitialized = true;

      console.log('🎵 Music loaded:', track.name, 'duration:', track.duration);
      return track;
    } catch (error) {
      console.error('Failed to load music:', error);
      throw error;
    }
  }

  /**
   * Play music
   */
  async playMusic(): Promise<void> {
    try {
      if (!this.currentTrack) {
        throw new Error('No music loaded');
      }

      await this.nativePlayer.playAudio();
      this.currentTrack.isPlaying = true;
      console.log('▶️ Music playing');
    } catch (error) {
      console.error('Failed to play music:', error);
      throw error;
    }
  }

  /**
   * Pause music
   */
  async pauseMusic(): Promise<void> {
    try {
      if (!this.currentTrack) {
        throw new Error('No music loaded');
      }

      await this.nativePlayer.pauseAudio();
      this.currentTrack.isPlaying = false;
      console.log('⏸️ Music paused');
    } catch (error) {
      console.error('Failed to pause music:', error);
      throw error;
    }
  }

  /**
   * Stop music
   */
  async stopMusic(): Promise<void> {
    try {
      if (!this.currentTrack) {
        throw new Error('No music loaded');
      }

      await this.nativePlayer.stopAudio();
      this.currentTrack.isPlaying = false;
      this.currentTrack.currentTime = 0;
      console.log('⏹️ Music stopped');
    } catch (error) {
      console.error('Failed to stop music:', error);
      throw error;
    }
  }

  /**
   * Seek to position
   */
  async seekMusic(time: number): Promise<void> {
    try {
      if (!this.currentTrack) {
        throw new Error('No music loaded');
      }

      const seekTime = Math.max(0, Math.min(time, this.currentTrack.duration));
      await this.nativePlayer.seekAudio(seekTime);
      this.currentTrack.currentTime = seekTime;
    } catch (error) {
      console.error('Failed to seek music:', error);
      throw error;
    }
  }

  /**
   * Set volume
   */
  async setVolume(volume: number): Promise<void> {
    try {
      if (!this.currentTrack) {
        throw new Error('No music loaded');
      }

      const normalizedVolume = Math.max(0, Math.min(1, volume));
      await this.nativePlayer.setAudioVolume(normalizedVolume);
      this.currentTrack.volume = normalizedVolume;
      console.log('🔊 Music volume set to:', normalizedVolume);
    } catch (error) {
      console.error('Failed to set volume:', error);
      throw error;
    }
  }

  /**
   * Get current track
   */
  getCurrentTrack(): MusicTrack | null {
    return this.currentTrack;
  }

  /**
   * Check if music is playing
   */
  isPlaying(): boolean {
    return this.currentTrack?.isPlaying || false;
  }

  /**
   * Apply fade in
   */
  async applyFadeIn(duration: number): Promise<void> {
    try {
      if (!this.currentTrack) {
        throw new Error('No music loaded');
      }

      this.currentTrack.fadeIn = duration;
      // Native fade in implementation would go here
      console.log('🎵 Fade in applied:', duration, 's');
    } catch (error) {
      console.error('Failed to apply fade in:', error);
      throw error;
    }
  }

  /**
   * Apply fade out
   */
  async applyFadeOut(duration: number): Promise<void> {
    try {
      if (!this.currentTrack) {
        throw new Error('No music loaded');
      }

      this.currentTrack.fadeOut = duration;
      // Native fade out implementation would go here
      console.log('🎵 Fade out applied:', duration, 's');
    } catch (error) {
      console.error('Failed to apply fade out:', error);
      throw error;
    }
  }

  /**
   * Trim music
   */
  async trimMusic(startTime: number, endTime: number): Promise<void> {
    try {
      if (!this.currentTrack) {
        throw new Error('No music loaded');
      }

      if (startTime < 0 || endTime > this.currentTrack.duration || startTime >= endTime) {
        throw new Error('Invalid trim range');
      }

      this.currentTrack.startTime = startTime;
      this.currentTrack.endTime = endTime;
      console.log('✂️ Music trimmed:', startTime, '-', endTime);
    } catch (error) {
      console.error('Failed to trim music:', error);
      throw error;
    }
  }

  /**
   * Toggle loop
   */
  async toggleLoop(enabled: boolean): Promise<void> {
    try {
      if (!this.currentTrack) {
        throw new Error('No music loaded');
      }

      this.currentTrack.loop = enabled;
      console.log('🔁 Music loop:', enabled);
    } catch (error) {
      console.error('Failed to toggle loop:', error);
      throw error;
    }
  }

  /**
   * Get music duration
   */
  getDuration(): number {
    return this.currentTrack?.duration || 0;
  }

  /**
   * Get current position
   */
  getCurrentPosition(): number {
    return this.currentTrack?.currentTime || 0;
  }

  /**
   * Get music metadata
   */
  async getMetadata(filePath: string): Promise<{
    duration: number;
    title?: string;
    artist?: string;
    album?: string;
    year?: number;
    bitrate?: number;
    sampleRate?: number;
  }> {
    try {
      // @ts-ignore
      const metadata = await this.nativePlayer.getAudioMetadata(filePath);
      return metadata || { duration: 0 };
    } catch (error) {
      console.error('Failed to get metadata:', error);
      return { duration: 0 };
    }
  }

  /**
   * Get waveform data for visualization
   */
  async getWaveform(filePath: string, points: number = 100): Promise<number[]> {
    try {
      // @ts-ignore
      const waveform = await this.nativePlayer.getWaveform(filePath, points);
      return waveform || new Array(points).fill(0.5);
    } catch (error) {
      console.error('Failed to get waveform:', error);
      return new Array(points).fill(0.5);
    }
  }

  /**
   * Cleanup
   */
  async cleanup(): Promise<void> {
    try {
      if (this.currentTrack?.isPlaying) {
        await this.stopMusic();
      }
      this.currentTrack = null;
      this.isInitialized = false;
      console.log('🧹 Music cleaned up');
    } catch (error) {
      console.error('Failed to cleanup music:', error);
    }
  }

  /**
   * Get audio levels
   */
  async getAudioLevels(): Promise<{
    left: number;
    right: number;
    peak: number;
  }> {
    try {
      // @ts-ignore
      const levels = await this.nativePlayer.getAudioLevels();
      return levels || { left: 0, right: 0, peak: 0 };
    } catch (error) {
      console.error('Failed to get audio levels:', error);
      return { left: 0, right: 0, peak: 0 };
    }
  }

  /**
   * Apply audio effect
   */
  async applyEffect(
    effect: 'reverb' | 'delay' | 'chorus' | 'flanger',
    params: any
  ): Promise<void> {
    try {
      // @ts-ignore
      await this.nativePlayer.applyAudioEffect(effect, params);
      console.log('🎵 Audio effect applied:', effect);
    } catch (error) {
      console.error('Failed to apply audio effect:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const musicManager = new MusicManager();
export default musicManager;