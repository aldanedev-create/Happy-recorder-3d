import { NativeModules, Platform } from 'react-native';
import { storageService } from '../services/storage';
import { filesService } from '../services/files';
import { timelineManager } from './timeline';
import { musicManager } from './music';
import { effectsManager } from './effects';

export interface VideoClip {
  id: string;
  filePath: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
  duration: number; // in seconds
  type: 'video' | 'audio' | 'image';
  metadata?: {
    width?: number;
    height?: number;
    fps?: number;
    codec?: string;
  };
}

export interface TimelineTrack {
  id: string;
  type: 'video' | 'audio' | 'text' | 'effect';
  clips: VideoClip[];
  muted: boolean;
  volume: number;
  locked: boolean;
  visible: boolean;
}

export interface Project {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  duration: number;
  width: number;
  height: number;
  fps: number;
  tracks: TimelineTrack[];
  musicTrack?: TimelineTrack;
  effects: VideoEffect[];
  renderSettings: RenderSettings;
  thumbnail?: string;
}

export interface VideoEffect {
  id: string;
  type: 'zoom' | 'blur' | 'highlight' | 'cursor' | 'click' | '3d' | 'text' | 'arrow' | 'shape';
  startTime: number;
  endTime: number;
  config: any;
  trackId?: string;
  clipId?: string;
}

export interface RenderSettings {
  outputPath: string;
  quality: 'low' | 'medium' | 'high' | 'lossless';
  format: 'mp4' | 'mov' | 'avi' | 'webm';
  codec: 'h264' | 'h265' | 'vp9' | 'prores';
  bitrate: number;
  fps: number;
  width: number;
  height: number;
  audioBitrate: number;
  audioChannels: 1 | 2 | 6;
  audioSampleRate: 44100 | 48000 | 96000;
}

export interface ExportProgress {
  progress: number; // 0-100
  status: 'idle' | 'preparing' | 'encoding' | 'muxing' | 'done' | 'error';
  currentTime: number;
  totalTime: number;
  fps: number;
  speed: number;
  error?: string;
}

class Editor {
  private currentProject: Project | null = null;
  private exportProgress: ExportProgress = {
    progress: 0,
    status: 'idle',
    currentTime: 0,
    totalTime: 0,
    fps: 0,
    speed: 0,
  };
  private exportCancelRequested: boolean = false;

  // Native modules
  private get nativeEditor(): any {
    // @ts-ignore - Native module would be implemented
    return NativeModules.HappyRecorderNative || {
      createProject: (config: any) => Promise.resolve({ success: true }),
      importClip: (filePath: string) => Promise.resolve({ success: true }),
      renderProject: (config: any) => Promise.resolve({ success: true }),
      cancelRender: () => Promise.resolve({ success: true }),
    };
  }

  /**
   * Create a new editing project
   */
  async createProject(name: string, config?: {
    width?: number;
    height?: number;
    fps?: number;
    duration?: number;
  }): Promise<Project> {
    try {
      const project: Project = {
        id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        name: name,
        createdAt: new Date(),
        updatedAt: new Date(),
        duration: config?.duration || 300, // 5 minutes default
        width: config?.width || 1920,
        height: config?.height || 1080,
        fps: config?.fps || 60,
        tracks: [],
        effects: [],
        renderSettings: {
          outputPath: '',
          quality: 'high',
          format: 'mp4',
          codec: 'h264',
          bitrate: 2000000,
          fps: 60,
          width: 1920,
          height: 1080,
          audioBitrate: 128000,
          audioChannels: 2,
          audioSampleRate: 48000,
        },
      };

      // Create default video track
      const videoTrack: TimelineTrack = {
        id: `track_video_${Date.now()}`,
        type: 'video',
        clips: [],
        muted: false,
        volume: 1.0,
        locked: false,
        visible: true,
      };
      project.tracks.push(videoTrack);

      // Create default audio track
      const audioTrack: TimelineTrack = {
        id: `track_audio_${Date.now()}`,
        type: 'audio',
        clips: [],
        muted: false,
        volume: 1.0,
        locked: false,
        visible: true,
      };
      project.tracks.push(audioTrack);

      this.currentProject = project;
      await storageService.saveProject(project);

      // Update effects manager with tracks
      this.updateEffectsTracks();

      console.log('📁 Project created:', project.id, name);
      return project;
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    }
  }

  /**
   * Load an existing project
   */
  async loadProject(projectId: string): Promise<Project> {
    try {
      const project = await storageService.loadProject(projectId);
      this.currentProject = project;

      // Update effects manager with tracks
      this.updateEffectsTracks();

      console.log('📂 Project loaded:', project.id, project.name);
      return project;
    } catch (error) {
      console.error('Failed to load project:', error);
      throw error;
    }
  }

  /**
   * Save current project
   */
  async saveProject(): Promise<void> {
    try {
      if (!this.currentProject) {
        throw new Error('No project loaded');
      }

      this.currentProject.updatedAt = new Date();
      await storageService.saveProject(this.currentProject);

      // Update effects manager with tracks
      this.updateEffectsTracks();

      console.log('💾 Project saved:', this.currentProject.id);
    } catch (error) {
      console.error('Failed to save project:', error);
      throw error;
    }
  }

  /**
   * Import a video/audio clip into the project
   */
  async importClip(filePath: string, trackType?: 'video' | 'audio'): Promise<VideoClip> {
    try {
      if (!this.currentProject) {
        throw new Error('No project loaded');
      }

      // Get clip info
      const info = await this.getClipInfo(filePath);

      // Determine track type
      const type = trackType || info.type;

      // Create clip
      const clip: VideoClip = {
        id: `clip_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        filePath: filePath,
        startTime: 0,
        endTime: info.duration,
        duration: info.duration,
        type: type,
        metadata: {
          width: info.width,
          height: info.height,
          fps: info.fps,
          codec: info.codec,
        },
      };

      // Find or create track
      let track = this.currentProject.tracks.find(t => t.type === type);
      if (!track) {
        track = {
          id: `track_${type}_${Date.now()}`,
          type: type,
          clips: [],
          muted: false,
          volume: 1.0,
          locked: false,
          visible: true,
        };
        this.currentProject.tracks.push(track);
      }

      // Add clip to track at the end
      const lastClip = track.clips[track.clips.length - 1];
      if (lastClip) {
        clip.startTime = lastClip.startTime + lastClip.duration;
        clip.endTime = clip.startTime + clip.duration;
      }

      track.clips.push(clip);
      this.currentProject.duration = Math.max(this.currentProject.duration, clip.endTime);

      await this.saveProject();
      this.updateEffectsTracks();
      
      console.log('🎬 Clip imported:', clip.id, filePath);
      return clip;
    } catch (error) {
      console.error('Failed to import clip:', error);
      throw error;
    }
  }

  /**
   * Get clip information from file
   */
  private async getClipInfo(filePath: string): Promise<{
    duration: number;
    width?: number;
    height?: number;
    fps?: number;
    codec?: string;
    type: 'video' | 'audio';
  }> {
    try {
      // For video files, use FFmpeg or native module
      // @ts-ignore
      const info = await NativeModules.HappyRecorderNative.getMediaInfo(filePath);
      return {
        duration: info.duration || 10,
        width: info.width,
        height: info.height,
        fps: info.fps,
        codec: info.codec,
        type: info.hasVideo ? 'video' : 'audio',
      };
    } catch (error) {
      console.warn('Failed to get clip info, using defaults:', error);
      return {
        duration: 10,
        type: 'video',
      };
    }
  }

  /**
   * Trim a clip
   */
  async trimClip(clipId: string, newStartTime: number, newEndTime: number): Promise<VideoClip> {
    try {
      if (!this.currentProject) {
        throw new Error('No project loaded');
      }

      const clip = this.findClip(clipId);
      if (!clip) {
        throw new Error('Clip not found');
      }

      const originalDuration = clip.duration;
      clip.startTime = newStartTime;
      clip.endTime = newEndTime;
      clip.duration = newEndTime - newStartTime;

      // Update subsequent clips on the same track
      const track = this.findTrackForClip(clipId);
      if (track) {
        const index = track.clips.indexOf(clip);
        const timeShift = clip.duration - originalDuration;
        for (let i = index + 1; i < track.clips.length; i++) {
          track.clips[i].startTime += timeShift;
          track.clips[i].endTime += timeShift;
        }
      }

      await this.saveProject();
      this.updateEffectsTracks();

      console.log('✂️ Clip trimmed:', clipId, newStartTime, newEndTime);
      return clip;
    } catch (error) {
      console.error('Failed to trim clip:', error);
      throw error;
    }
  }

  /**
   * Cut a clip into two parts
   */
  async cutClip(clipId: string, cutTime: number): Promise<VideoClip[]> {
    try {
      if (!this.currentProject) {
        throw new Error('No project loaded');
      }

      const clip = this.findClip(clipId);
      if (!clip) {
        throw new Error('Clip not found');
      }

      if (cutTime <= clip.startTime || cutTime >= clip.endTime) {
        throw new Error('Cut time must be within clip');
      }

      // Create two new clips
      const clip1: VideoClip = {
        ...clip,
        id: `clip_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        startTime: clip.startTime,
        endTime: cutTime,
        duration: cutTime - clip.startTime,
      };

      const clip2: VideoClip = {
        ...clip,
        id: `clip_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        startTime: cutTime,
        endTime: clip.endTime,
        duration: clip.endTime - cutTime,
      };

      // Replace original clip with two new ones
      const track = this.findTrackForClip(clipId);
      if (track) {
        const index = track.clips.indexOf(clip);
        track.clips.splice(index, 1, clip1, clip2);

        // Shift subsequent clips
        const timeShift = clip2.duration - clip.duration + clip1.duration;
        for (let i = index + 2; i < track.clips.length; i++) {
          track.clips[i].startTime += timeShift;
          track.clips[i].endTime += timeShift;
        }
      }

      await this.saveProject();
      this.updateEffectsTracks();

      console.log('🔪 Clip cut:', clipId, 'at', cutTime);
      return [clip1, clip2];
    } catch (error) {
      console.error('Failed to cut clip:', error);
      throw error;
    }
  }

  /**
   * Split a clip at a specific time
   */
  async splitClip(clipId: string, splitTime: number): Promise<VideoClip[]> {
    return this.cutClip(clipId, splitTime);
  }

  /**
   * Crop a clip (change dimensions)
   */
  async cropClip(clipId: string, x: number, y: number, width: number, height: number): Promise<void> {
    try {
      if (!this.currentProject) {
        throw new Error('No project loaded');
      }

      const clip = this.findClip(clipId);
      if (!clip) {
        throw new Error('Clip not found');
      }

      // Add crop effect
      const effect: VideoEffect = {
        id: `effect_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        type: 'zoom',
        startTime: clip.startTime,
        endTime: clip.endTime,
        config: {
          x: x,
          y: y,
          width: width,
          height: height,
          zoom: 1.0,
        },
        clipId: clipId,
      };

      this.currentProject.effects.push(effect);
      await this.saveProject();
      console.log('🌾 Clip cropped:', clipId);
    } catch (error) {
      console.error('Failed to crop clip:', error);
      throw error;
    }
  }

  /**
   * Change clip speed
   */
  async changeSpeed(clipId: string, speed: number): Promise<void> {
    try {
      if (!this.currentProject) {
        throw new Error('No project loaded');
      }

      const clip = this.findClip(clipId);
      if (!clip) {
        throw new Error('Clip not found');
      }

      if (speed <= 0) {
        throw new Error('Speed must be positive');
      }

      const originalDuration = clip.duration;
      clip.duration = clip.duration / speed;

      // Add speed effect
      const effect: VideoEffect = {
        id: `effect_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        type: 'zoom',
        startTime: clip.startTime,
        endTime: clip.startTime + clip.duration,
        config: {
          speed: speed,
        },
        clipId: clipId,
      };

      this.currentProject.effects.push(effect);
      await this.saveProject();
      console.log('⚡ Speed changed:', clipId, 'speed:', speed);
    } catch (error) {
      console.error('Failed to change speed:', error);
      throw error;
    }
  }

  /**
   * Add an effect to a clip or track
   */
  async addEffect(effect: Omit<VideoEffect, 'id'>): Promise<VideoEffect> {
    try {
      if (!this.currentProject) {
        throw new Error('No project loaded');
      }

      const newEffect: VideoEffect = {
        ...effect,
        id: `effect_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      };

      this.currentProject.effects.push(newEffect);
      await this.saveProject();
      console.log('✨ Effect added:', newEffect.id, newEffect.type);
      return newEffect;
    } catch (error) {
      console.error('Failed to add effect:', error);
      throw error;
    }
  }

  /**
   * Remove an effect
   */
  async removeEffect(effectId: string): Promise<void> {
    try {
      if (!this.currentProject) {
        throw new Error('No project loaded');
      }

      this.currentProject.effects = this.currentProject.effects.filter(
        e => e.id !== effectId
      );
      await this.saveProject();
      console.log('🗑️ Effect removed:', effectId);
    } catch (error) {
      console.error('Failed to remove effect:', error);
      throw error;
    }
  }

  /**
   * Add text annotation
   */
  async addTextAnnotation(
    text: string,
    startTime: number,
    endTime: number,
    config: {
      position?: { x: number; y: number };
      fontSize?: number;
      color?: string;
      fontFamily?: string;
      backgroundColor?: string;
      opacity?: number;
      rotation?: number;
    }
  ): Promise<VideoEffect> {
    return this.addEffect({
      type: 'text',
      startTime: startTime,
      endTime: endTime,
      config: {
        text: text,
        position: config.position || { x: 0.5, y: 0.5 },
        fontSize: config.fontSize || 24,
        color: config.color || '#ffffff',
        fontFamily: config.fontFamily || 'Arial',
        backgroundColor: config.backgroundColor || 'rgba(0,0,0,0.5)',
        opacity: config.opacity || 1.0,
        rotation: config.rotation || 0,
      },
    });
  }

  /**
   * Add arrow annotation
   */
  async addArrowAnnotation(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    startTime: number,
    endTime: number,
    config?: {
      color?: string;
      thickness?: number;
      headSize?: number;
    }
  ): Promise<VideoEffect> {
    return this.addEffect({
      type: 'arrow',
      startTime: startTime,
      endTime: endTime,
      config: {
        startX: startX,
        startY: startY,
        endX: endX,
        endY: endY,
        color: config?.color || '#ff6b6b',
        thickness: config?.thickness || 3,
        headSize: config?.headSize || 10,
      },
    });
  }

  /**
   * Add shape annotation
   */
  async addShapeAnnotation(
    shape: 'rectangle' | 'circle' | 'ellipse',
    x: number,
    y: number,
    width: number,
    height: number,
    startTime: number,
    endTime: number,
    config?: {
      color?: string;
      fillColor?: string;
      thickness?: number;
      opacity?: number;
    }
  ): Promise<VideoEffect> {
    return this.addEffect({
      type: 'shape',
      startTime: startTime,
      endTime: endTime,
      config: {
        shape: shape,
        x: x,
        y: y,
        width: width,
        height: height,
        color: config?.color || '#6c63ff',
        fillColor: config?.fillColor || 'transparent',
        thickness: config?.thickness || 2,
        opacity: config?.opacity || 1.0,
      },
    });
  }

  /**
   * Add 3D element
   */
  async add3DElement(
    elementType: 'cube' | 'sphere' | 'pyramid' | 'text' | 'logo' | 'device' | 'network-node',
    startTime: number,
    endTime: number,
    config: {
      position: { x: number; y: number; z: number };
      rotation?: { x: number; y: number; z: number };
      scale?: { x: number; y: number; z: number };
      color?: string;
      opacity?: number;
      duration?: number;
      animation?: 'spin' | 'float' | 'bounce' | 'none';
    }
  ): Promise<VideoEffect> {
    return this.addEffect({
      type: '3d',
      startTime: startTime,
      endTime: endTime,
      config: {
        elementType: elementType,
        position: config.position,
        rotation: config.rotation || { x: 0, y: 0, z: 0 },
        scale: config.scale || { x: 1, y: 1, z: 1 },
        color: config.color || '#6c63ff',
        opacity: config.opacity || 1.0,
        duration: config.duration || 5,
        animation: config.animation || 'none',
      },
    });
  }

  /**
   * Add background music
   */
  async addBackgroundMusic(filePath: string, config?: {
    volume?: number;
    startTime?: number;
    endTime?: number;
    fadeIn?: number;
    fadeOut?: number;
    loop?: boolean;
  }): Promise<void> {
    if (!this.currentProject) {
      throw new Error('No project loaded');
    }

    await musicManager.loadMusic(filePath, config);
    this.currentProject.musicTrack = {
      id: `track_music_${Date.now()}`,
      type: 'audio',
      clips: [
        {
          id: `music_${Date.now()}`,
          filePath: filePath,
          startTime: config?.startTime || 0,
          endTime: config?.endTime || 300,
          duration: 300,
          type: 'audio',
        },
      ],
      muted: false,
      volume: config?.volume || 0.25,
      locked: false,
      visible: true,
    };

    await this.saveProject();
    this.updateEffectsTracks();

    console.log('🎵 Background music added:', filePath);
  }

  /**
   * Get tracks for effects manager
   */
  getTracks(): TimelineTrack[] {
    if (!this.currentProject) {
      throw new Error('No project loaded');
    }
    return this.currentProject.tracks;
  }

  /**
   * Update effects manager tracks
   */
  updateEffectsTracks(): void {
    if (!this.currentProject) {
      throw new Error('No project loaded');
    }
    effectsManager.setTracks(this.currentProject.tracks);
  }

  /**
   * Add transition between clips
   */
  async addTransition(
    fromClipId: string,
    toClipId: string,
    type: 'fade' | 'dissolve' | 'wipe' | 'slide' | 'zoom' | 'blur' | '3d',
    duration: number,
    params?: Record<string, any>
  ): Promise<any> {
    if (!this.currentProject) {
      throw new Error('No project loaded');
    }

    // Update effects manager with current tracks
    effectsManager.setTracks(this.currentProject.tracks);

    const transition = await effectsManager.addTransition(
      fromClipId,
      toClipId,
      type,
      duration,
      params
    );

    await this.saveProject();
    return transition;
  }

  /**
   * Get current timeline data
   */
  getTimelineData(): {
    tracks: TimelineTrack[];
    duration: number;
    effects: VideoEffect[];
  } {
    if (!this.currentProject) {
      throw new Error('No project loaded');
    }

    return {
      tracks: this.currentProject.tracks,
      duration: this.currentProject.duration,
      effects: this.currentProject.effects,
    };
  }

  /**
   * Render/export the project
   */
  async renderProject(settings?: Partial<RenderSettings>): Promise<string> {
    try {
      if (!this.currentProject) {
        throw new Error('No project loaded');
      }

      this.exportCancelRequested = false;
      this.exportProgress.status = 'preparing';
      this.exportProgress.progress = 0;

      // Merge settings
      const renderSettings: RenderSettings = {
        ...this.currentProject.renderSettings,
        ...settings,
        outputPath: settings?.outputPath || await this.generateOutputPath(),
      };

      // Update project render settings
      this.currentProject.renderSettings = renderSettings;
      await this.saveProject();

      // Start rendering
      this.exportProgress.status = 'encoding';
      this.exportProgress.totalTime = this.currentProject.duration;

      // @ts-ignore
      const result = await this.nativeEditor.renderProject({
        projectId: this.currentProject.id,
        settings: renderSettings,
        onProgress: (progress: ExportProgress) => {
          this.exportProgress = progress;
          this.emitProgressUpdate();
        },
      });

      this.exportProgress.status = 'done';
      this.exportProgress.progress = 100;

      console.log('📤 Project rendered:', renderSettings.outputPath);
      return renderSettings.outputPath;
    } catch (error) {
      this.exportProgress.status = 'error';
      this.exportProgress.error = error instanceof Error ? error.message : 'Render failed';
      throw error;
    }
  }

  /**
   * Cancel rendering
   */
  async cancelRender(): Promise<void> {
    this.exportCancelRequested = true;
    await this.nativeEditor.cancelRender();
    this.exportProgress.status = 'idle';
    console.log('❌ Render cancelled');
  }

  /**
   * Get export progress
   */
  getExportProgress(): ExportProgress {
    return { ...this.exportProgress };
  }

  /**
   * Generate output path
   */
  private async generateOutputPath(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `HappyRecorder_${timestamp}.mp4`;
    const recordingsPath = await storageService.getRecordingsPath();
    return recordingsPath + '/' + filename;
  }

  /**
   * Find a clip by ID
   */
  private findClip(clipId: string): VideoClip | null {
    if (!this.currentProject) return null;

    for (const track of this.currentProject.tracks) {
      const clip = track.clips.find(c => c.id === clipId);
      if (clip) return clip;
    }
    return null;
  }

  /**
   * Find the track containing a clip
   */
  private findTrackForClip(clipId: string): TimelineTrack | null {
    if (!this.currentProject) return null;

    for (const track of this.currentProject.tracks) {
      if (track.clips.some(c => c.id === clipId)) {
        return track;
      }
    }
    return null;
  }

  /**
   * Emit progress update to React Native
   */
  private emitProgressUpdate(): void {
    // @ts-ignore - Emit event
    if (this.nativeEditor.emitProgressUpdate) {
      this.nativeEditor.emitProgressUpdate(this.exportProgress);
    }
  }

  /**
   * Get current project
   */
  getCurrentProject(): Project | null {
    return this.currentProject;
  }

  /**
   * Close current project
   */
  async closeProject(): Promise<void> {
    if (this.currentProject) {
      await this.saveProject();
    }
    this.currentProject = null;
    console.log('📂 Project closed');
  }

  /**
   * Delete a project
   */
  async deleteProject(projectId: string): Promise<void> {
    try {
      await storageService.deleteProject(projectId);
      if (this.currentProject?.id === projectId) {
        this.currentProject = null;
      }
      console.log('🗑️ Project deleted:', projectId);
    } catch (error) {
      console.error('Failed to delete project:', error);
      throw error;
    }
  }

  /**
   * Get all projects
   */
  async getProjects(): Promise<Project[]> {
    return storageService.getProjects();
  }

  /**
   * Create thumbnail for project
   */
  async createThumbnail(projectId: string, time: number = 0): Promise<string> {
    try {
      // @ts-ignore
      const thumbnailPath = await this.nativeEditor.createThumbnail(projectId, time);
      return thumbnailPath;
    } catch (error) {
      console.error('Failed to create thumbnail:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const editor = new Editor();
export default editor;