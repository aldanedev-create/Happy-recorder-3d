import { NativeModules } from 'react-native';
import { VideoClip, TimelineTrack } from './editor';

export interface EffectConfig {
  id: string;
  type: 'zoom' | 'blur' | 'highlight' | 'cursor' | 'click' | '3d' | 'text' | 'arrow' | 'shape' | 'transition';
  name: string;
  startTime: number;
  endTime: number;
  params: Record<string, any>;
  trackId?: string;
  clipId?: string;
  keyframes?: Keyframe[];
}

export interface Keyframe {
  time: number;
  value: any;
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce' | 'elastic';
}

export interface Transition {
  id: string;
  type: 'fade' | 'dissolve' | 'wipe' | 'slide' | 'zoom' | 'blur' | '3d';
  fromClipId: string;
  toClipId: string;
  startTime: number;
  duration: number;
  params: Record<string, any>;
}

export interface ClipPositionInfo {
  clip: VideoClip;
  track: TimelineTrack;
  trackIndex: number;
  clipIndex: number;
  startTime: number;
  endTime: number;
}

class EffectsManager {
  private effects: EffectConfig[] = [];
  private transitions: Transition[] = [];
  private isInitialized: boolean = false;
  private tracks: TimelineTrack[] = [];

  // Native effects processor
  private get nativeEffects(): any {
    // @ts-ignore
    return NativeModules.HappyRecorderNative || {
      applyEffect: (effect: any) => Promise.resolve({ success: true }),
      removeEffect: (effectId: string) => Promise.resolve({ success: true }),
      applyTransition: (transition: any) => Promise.resolve({ success: true }),
      previewEffect: (effect: any) => Promise.resolve({ success: true }),
    };
  }

  /**
   * Set tracks for clip position lookup
   */
  setTracks(tracks: TimelineTrack[]): void {
    this.tracks = tracks;
  }

  /**
   * Find clip by ID with full position information
   */
  findClipPosition(clipId: string): ClipPositionInfo | null {
    for (let trackIndex = 0; trackIndex < this.tracks.length; trackIndex++) {
      const track = this.tracks[trackIndex];
      for (let clipIndex = 0; clipIndex < track.clips.length; clipIndex++) {
        const clip = track.clips[clipIndex];
        if (clip.id === clipId) {
          return {
            clip: clip,
            track: track,
            trackIndex: trackIndex,
            clipIndex: clipIndex,
            startTime: clip.startTime,
            endTime: clip.endTime,
          };
        }
      }
    }
    return null;
  }

  /**
   * Find adjacent clips for transition
   */
  findAdjacentClips(clipId: string): { previous: ClipPositionInfo | null; next: ClipPositionInfo | null } {
    const pos = this.findClipPosition(clipId);
    if (!pos) {
      return { previous: null, next: null };
    }

    const track = pos.track;
    const clipIndex = pos.clipIndex;
    const previous = clipIndex > 0 ? this.findClipPosition(track.clips[clipIndex - 1].id) : null;
    const next = clipIndex < track.clips.length - 1 ? this.findClipPosition(track.clips[clipIndex + 1].id) : null;

    return { previous, next };
  }

  /**
   * Add zoom effect with proper clip positioning
   */
  async addZoomEffect(
    clipId: string,
    config: {
      zoom: number;
      x?: number;
      y?: number;
      easing?: 'linear' | 'ease-in-out';
      duration?: number; // Optional: if not provided, uses full clip duration
    }
  ): Promise<EffectConfig> {
    const clipPos = this.findClipPosition(clipId);
    if (!clipPos) {
      throw new Error(`Clip not found: ${clipId}`);
    }

    const startTime = config.duration ? clipPos.startTime : clipPos.startTime;
    const endTime = config.duration ? clipPos.startTime + config.duration : clipPos.endTime;

    const effect: EffectConfig = {
      id: `effect_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type: 'zoom',
      name: 'Zoom Effect',
      startTime: startTime,
      endTime: endTime,
      clipId: clipId,
      params: {
        zoom: config.zoom,
        x: config.x || 0.5,
        y: config.y || 0.5,
        easing: config.easing || 'ease-in-out',
      },
      keyframes: this.generateZoomKeyframes(startTime, endTime, config),
    };

    return this.addEffect(effect);
  }

  /**
   * Add blur effect
   */
  async addBlurEffect(
    clipId: string,
    config: {
      intensity: number;
      type?: 'gaussian' | 'box' | 'motion';
      direction?: { x: number; y: number };
      duration?: number;
    }
  ): Promise<EffectConfig> {
    const clipPos = this.findClipPosition(clipId);
    if (!clipPos) {
      throw new Error(`Clip not found: ${clipId}`);
    }

    const startTime = clipPos.startTime;
    const endTime = config.duration ? clipPos.startTime + config.duration : clipPos.endTime;

    const effect: EffectConfig = {
      id: `effect_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type: 'blur',
      name: 'Blur Effect',
      startTime: startTime,
      endTime: endTime,
      clipId: clipId,
      params: {
        intensity: config.intensity,
        type: config.type || 'gaussian',
        direction: config.direction || { x: 0, y: 0 },
      },
    };

    return this.addEffect(effect);
  }

  /**
   * Add highlight effect
   */
  async addHighlightEffect(
    clipId: string,
    config: {
      color?: string;
      intensity?: number;
      radius?: number;
      duration?: number;
    }
  ): Promise<EffectConfig> {
    const clipPos = this.findClipPosition(clipId);
    if (!clipPos) {
      throw new Error(`Clip not found: ${clipId}`);
    }

    const startTime = clipPos.startTime;
    const endTime = config.duration ? clipPos.startTime + config.duration : clipPos.endTime;

    const effect: EffectConfig = {
      id: `effect_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type: 'highlight',
      name: 'Highlight Effect',
      startTime: startTime,
      endTime: endTime,
      clipId: clipId,
      params: {
        color: config.color || '#ffd93d',
        intensity: config.intensity || 0.5,
        radius: config.radius || 0.3,
      },
    };

    return this.addEffect(effect);
  }

  /**
   * Add cursor effect to a track
   */
  async addCursorEffect(
    trackId: string,
    config: {
      color?: string;
      size?: number;
      glow?: boolean;
      trail?: boolean;
      startTime?: number;
      endTime?: number;
    }
  ): Promise<EffectConfig> {
    // Find track
    const track = this.tracks.find(t => t.id === trackId);
    if (!track) {
      throw new Error(`Track not found: ${trackId}`);
    }

    // If no time range specified, use entire track duration
    const startTime = config.startTime ?? 0;
    const endTime = config.endTime ?? this.getTrackDuration(track);

    const effect: EffectConfig = {
      id: `effect_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type: 'cursor',
      name: 'Cursor Effect',
      startTime: startTime,
      endTime: endTime,
      trackId: trackId,
      params: {
        color: config.color || '#ff6b6b',
        size: config.size || 24,
        glow: config.glow || true,
        trail: config.trail || false,
      },
    };

    return this.addEffect(effect);
  }

  /**
   * Add click effect to a track
   */
  async addClickEffect(
    trackId: string,
    config: {
      color?: string;
      duration?: number;
      radius?: number;
      startTime?: number;
      endTime?: number;
    }
  ): Promise<EffectConfig> {
    const track = this.tracks.find(t => t.id === trackId);
    if (!track) {
      throw new Error(`Track not found: ${trackId}`);
    }

    const startTime = config.startTime ?? 0;
    const endTime = config.endTime ?? this.getTrackDuration(track);

    const effect: EffectConfig = {
      id: `effect_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type: 'click',
      name: 'Click Effect',
      startTime: startTime,
      endTime: endTime,
      trackId: trackId,
      params: {
        color: config.color || '#ffd93d',
        duration: config.duration || 300,
        radius: config.radius || 30,
      },
    };

    return this.addEffect(effect);
  }

  /**
   * Add transition between clips with automatic timing
   */
  async addTransition(
    fromClipId: string,
    toClipId: string,
    type: Transition['type'],
    duration: number,
    params?: Record<string, any>
  ): Promise<Transition> {
    // Find both clips
    const fromPos = this.findClipPosition(fromClipId);
    const toPos = this.findClipPosition(toClipId);

    if (!fromPos) {
      throw new Error(`From clip not found: ${fromClipId}`);
    }
    if (!toPos) {
      throw new Error(`To clip not found: ${toClipId}`);
    }

    // Verify clips are adjacent
    const fromIndex = fromPos.clipIndex;
    const toIndex = toPos.clipIndex;
    const track = fromPos.track;

    if (track.id !== toPos.track.id) {
      throw new Error('Clips must be on the same track');
    }

    if (Math.abs(fromIndex - toIndex) !== 1) {
      throw new Error('Clips must be adjacent');
    }

    // Calculate transition start time
    // Transition starts at the end of the first clip minus duration/2
    const fromEnd = fromPos.clip.endTime;
    const toStart = toPos.clip.startTime;
    const overlapStart = Math.max(fromEnd - duration / 2, fromPos.clip.startTime);
    const transitionStart = Math.min(overlapStart, toStart);

    // Ensure transition doesn't exceed clip boundaries
    const actualDuration = Math.min(duration, fromPos.clip.duration, toPos.clip.duration);

    const transition: Transition = {
      id: `transition_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type: type,
      fromClipId: fromClipId,
      toClipId: toClipId,
      startTime: transitionStart,
      duration: actualDuration,
      params: params || {},
    };

    // Adjust clip end/start times for transition
    fromPos.clip.endTime = transitionStart + actualDuration / 2;
    toPos.clip.startTime = transitionStart + actualDuration / 2;

    this.transitions.push(transition);
    await this.nativeEffects.applyTransition(transition);

    console.log('🔄 Transition added:', type, 'duration:', actualDuration, 'at:', transitionStart);
    return transition;
  }

  /**
   * Add text effect at a specific time
   */
  async addTextAtTime(
    text: string,
    time: number,
    config?: {
      duration?: number;
      position?: { x: number; y: number };
      fontSize?: number;
      color?: string;
      backgroundColor?: string;
    }
  ): Promise<EffectConfig> {
    const duration = config?.duration || 3;
    const effect: EffectConfig = {
      id: `effect_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type: 'text',
      name: 'Text Annotation',
      startTime: time,
      endTime: time + duration,
      params: {
        text: text,
        position: config?.position || { x: 0.5, y: 0.5 },
        fontSize: config?.fontSize || 24,
        color: config?.color || '#ffffff',
        backgroundColor: config?.backgroundColor || 'rgba(0,0,0,0.5)',
        opacity: 1.0,
        rotation: 0,
      },
    };

    return this.addEffect(effect);
  }

  /**
   * Add arrow at a specific time
   */
  async addArrowAtTime(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    time: number,
    config?: {
      duration?: number;
      color?: string;
      thickness?: number;
    }
  ): Promise<EffectConfig> {
    const duration = config?.duration || 2;
    const effect: EffectConfig = {
      id: `effect_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type: 'arrow',
      name: 'Arrow Annotation',
      startTime: time,
      endTime: time + duration,
      params: {
        startX: startX,
        startY: startY,
        endX: endX,
        endY: endY,
        color: config?.color || '#ff6b6b',
        thickness: config?.thickness || 3,
        headSize: 10,
      },
    };

    return this.addEffect(effect);
  }

  /**
   * Get track duration
   */
  private getTrackDuration(track: TimelineTrack): number {
    if (track.clips.length === 0) return 0;
    const lastClip = track.clips[track.clips.length - 1];
    return lastClip.startTime + lastClip.duration;
  }

  /**
   * Get total project duration
   */
  getTotalDuration(): number {
    let maxDuration = 0;
    for (const track of this.tracks) {
      const duration = this.getTrackDuration(track);
      if (duration > maxDuration) {
        maxDuration = duration;
      }
    }
    return maxDuration;
  }

  /**
   * Add effect (internal)
   */
  async addEffect(effect: EffectConfig): Promise<EffectConfig> {
    try {
      this.effects.push(effect);
      await this.nativeEffects.applyEffect(effect);
      console.log('✨ Effect added:', effect.type, effect.id);
      return effect;
    } catch (error) {
      console.error('Failed to add effect:', error);
      throw error;
    }
  }

  /**
   * Remove effect
   */
  async removeEffect(effectId: string): Promise<void> {
    try {
      this.effects = this.effects.filter(e => e.id !== effectId);
      await this.nativeEffects.removeEffect(effectId);
      console.log('🗑️ Effect removed:', effectId);
    } catch (error) {
      console.error('Failed to remove effect:', error);
      throw error;
    }
  }

  /**
   * Remove all effects from a clip
   */
  removeEffectsFromClip(clipId: string): void {
    this.effects = this.effects.filter(e => e.clipId !== clipId);
  }

  /**
   * Remove all effects from a track
   */
  removeEffectsFromTrack(trackId: string): void {
    this.effects = this.effects.filter(e => e.trackId !== trackId);
  }

  /**
   * Get effects for a clip
   */
  getEffectsForClip(clipId: string): EffectConfig[] {
    return this.effects.filter(e => e.clipId === clipId);
  }

  /**
   * Get effects for a track
   */
  getEffectsForTrack(trackId: string): EffectConfig[] {
    return this.effects.filter(e => e.trackId === trackId);
  }

  /**
   * Get effects at time
   */
  getEffectsAtTime(time: number): EffectConfig[] {
    return this.effects.filter(e => time >= e.startTime && time <= e.endTime);
  }

  /**
   * Get effects at time for a specific clip
   */
  getEffectsAtTimeForClip(time: number, clipId: string): EffectConfig[] {
    return this.effects.filter(e => 
      e.clipId === clipId && 
      time >= e.startTime && 
      time <= e.endTime
    );
  }

  /**
   * Update effect parameters
   */
  async updateEffectParams(effectId: string, params: Record<string, any>): Promise<void> {
    try {
      const effect = this.effects.find(e => e.id === effectId);
      if (!effect) {
        throw new Error('Effect not found');
      }

      effect.params = { ...effect.params, ...params };
      await this.nativeEffects.applyEffect(effect);
      console.log('🔄 Effect updated:', effectId);
    } catch (error) {
      console.error('Failed to update effect:', error);
      throw error;
    }
  }

  /**
   * Preview effect
   */
  async previewEffect(effect: EffectConfig): Promise<void> {
    try {
      await this.nativeEffects.previewEffect(effect);
    } catch (error) {
      console.error('Failed to preview effect:', error);
      throw error;
    }
  }

  /**
   * Generate zoom keyframes
   */
  private generateZoomKeyframes(
    startTime: number,
    endTime: number,
    config: { zoom: number; easing?: Keyframe['easing'] }
  ): Keyframe[] {
    const midTime = (startTime + endTime) / 2;
    return [
      {
        time: startTime,
        value: 1.0,
        easing: config.easing || 'ease-in-out',
      },
      {
        time: midTime,
        value: config.zoom,
        easing: config.easing || 'ease-in-out',
      },
      {
        time: endTime,
        value: 1.0,
        easing: config.easing || 'ease-in-out',
      },
    ];
  }

  /**
   * Generate transition keyframes
   */
  private generateTransitionKeyframes(
    startTime: number,
    endTime: number,
    type: string
  ): Keyframe[] {
    return [
      {
        time: startTime,
        value: 0,
        easing: 'ease-in-out',
      },
      {
        time: (startTime + endTime) / 2,
        value: 0.5,
        easing: 'ease-in-out',
      },
      {
        time: endTime,
        value: 1,
        easing: 'ease-in-out',
      },
    ];
  }

  /**
   * Get all effects
   */
  getAllEffects(): EffectConfig[] {
    return [...this.effects];
  }

  /**
   * Get all transitions
   */
  getAllTransitions(): Transition[] {
    return [...this.transitions];
  }

  /**
   * Clear all effects
   */
  clearAllEffects(): void {
    this.effects = [];
    this.transitions = [];
  }

  /**
   * Apply effects to video frame
   */
  async processFrame(frame: any, time: number): Promise<any> {
    try {
      // Get all effects active at this time
      const activeEffects = this.getEffectsAtTime(time);
      
      // Sort by priority (zoom first, text last, etc.)
      const priority = { zoom: 1, blur: 2, highlight: 3, cursor: 4, click: 5, text: 10, arrow: 11, shape: 12 };
      activeEffects.sort((a, b) => (priority[a.type as keyof typeof priority] || 5) - (priority[b.type as keyof typeof priority] || 5));

      // Apply each effect
      let processedFrame = frame;
      for (const effect of activeEffects) {
        // @ts-ignore
        processedFrame = await this.nativeEffects.applyEffectToFrame(processedFrame, effect, time);
      }

      return processedFrame;
    } catch (error) {
      console.error('Failed to process frame:', error);
      return frame;
    }
  }

  /**
   * Get effect types
   */
  getEffectTypes(): string[] {
    return ['zoom', 'blur', 'highlight', 'cursor', 'click', '3d', 'text', 'arrow', 'shape', 'transition'];
  }

  /**
   * Validate effect configuration
   */
  validateEffectConfig(effect: EffectConfig): boolean {
    if (!effect.id) return false;
    if (!effect.type) return false;
    if (effect.startTime < 0) return false;
    if (effect.endTime <= effect.startTime) return false;
    if (!effect.params) return false;
    
    // Validate clip exists if clipId is provided
    if (effect.clipId) {
      const pos = this.findClipPosition(effect.clipId);
      if (!pos) return false;
      
      // Ensure effect stays within clip boundaries
      if (effect.startTime < pos.startTime || effect.endTime > pos.endTime) return false;
    }
    
    return true;
  }

  /**
   * Create duplicate effect
   */
  duplicateEffect(effectId: string): EffectConfig {
    const original = this.effects.find(e => e.id === effectId);
    if (!original) {
      throw new Error('Effect not found');
    }

    const duplicate: EffectConfig = {
      ...original,
      id: `effect_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    };

    this.effects.push(duplicate);
    return duplicate;
  }

  /**
   * Shift all effects by a time delta
   */
  shiftEffects(timeDelta: number, clipId?: string): void {
    let effectsToShift = this.effects;
    if (clipId) {
      effectsToShift = this.effects.filter(e => e.clipId === clipId);
    }

    for (const effect of effectsToShift) {
      effect.startTime += timeDelta;
      effect.endTime += timeDelta;
      if (effect.keyframes) {
        for (const keyframe of effect.keyframes) {
          keyframe.time += timeDelta;
        }
      }
    }
  }

  /**
   * Cleanup
   */
  async cleanup(): Promise<void> {
    this.effects = [];
    this.transitions = [];
    this.tracks = [];
    this.isInitialized = false;
    console.log('🧹 Effects cleaned up');
  }

  /**
   * Get effect count
   */
  getEffectCount(): number {
    return this.effects.length;
  }

  /**
   * Get transition count
   */
  getTransitionCount(): number {
    return this.transitions.length;
  }
}

// Export singleton instance
export const effectsManager = new EffectsManager();
export default effectsManager;
