import { NativeModules } from 'react-native';
import { VideoClip, TimelineTrack, VideoEffect } from './editor';

export interface TimelineState {
  zoom: number;
  scrollPosition: number;
  currentTime: number;
  selectedClipIds: string[];
  selectedTrackId: string | null;
  isPlaying: boolean;
  isDragging: boolean;
}

export interface Marker {
  id: string;
  time: number;
  type: 'snapshot' | 'chapter' | 'note' | 'code';
  label: string;
  color?: string;
  data?: any;
}

class TimelineManager {
  private state: TimelineState = {
    zoom: 1.0,
    scrollPosition: 0,
    currentTime: 0,
    selectedClipIds: [],
    selectedTrackId: null,
    isPlaying: false,
    isDragging: false,
  };

  private markers: Marker[] = [];

  /**
   * Set current time
   */
  setCurrentTime(time: number, duration: number): void {
    this.state.currentTime = Math.max(0, Math.min(time, duration));
  }

  /**
   * Get current time
   */
  getCurrentTime(): number {
    return this.state.currentTime;
  }

  /**
   * Set zoom level
   */
  setZoom(zoom: number): void {
    this.state.zoom = Math.max(0.1, Math.min(10, zoom));
  }

  /**
   * Get zoom level
   */
  getZoom(): number {
    return this.state.zoom;
  }

  /**
   * Scroll to time
   */
  scrollToTime(time: number, duration: number): void {
    const normalizedTime = Math.max(0, Math.min(time, duration));
    this.state.scrollPosition = normalizedTime * this.state.zoom;
  }

  /**
   * Get visible time range
   */
  getVisibleRange(
    containerWidth: number,
    duration: number
  ): { startTime: number; endTime: number } {
    const startTime = this.state.scrollPosition / this.state.zoom;
    const endTime = startTime + containerWidth / this.state.zoom;
    return {
      startTime: Math.max(0, startTime),
      endTime: Math.min(duration, endTime),
    };
  }

  /**
   * Get clip position on timeline
   */
  getClipPosition(clip: VideoClip, containerWidth: number, duration: number): {
    x: number;
    width: number;
    left: number;
    right: number;
  } {
    const visibleRange = this.getVisibleRange(containerWidth, duration);
    const totalVisibleDuration = visibleRange.endTime - visibleRange.startTime;
    const pixelsPerSecond = containerWidth / totalVisibleDuration;

    const x = (clip.startTime - visibleRange.startTime) * pixelsPerSecond;
    const width = clip.duration * pixelsPerSecond;

    return {
      x: Math.max(0, x),
      width: Math.max(1, width),
      left: clip.startTime,
      right: clip.endTime,
    };
  }

  /**
   * Find clip at position
   */
  findClipAtTime(time: number, tracks: TimelineTrack[]): VideoClip | null {
    for (const track of tracks) {
      for (const clip of track.clips) {
        if (time >= clip.startTime && time <= clip.endTime) {
          return clip;
        }
      }
    }
    return null;
  }

  /**
   * Get snap points for snapping
   */
  getSnapPoints(tracks: TimelineTrack[], duration: number): number[] {
    const points: number[] = [];

    // Clip boundaries
    for (const track of tracks) {
      for (const clip of track.clips) {
        points.push(clip.startTime);
        points.push(clip.endTime);
      }
    }

    // Markers
    for (const marker of this.markers) {
      points.push(marker.time);
    }

    // Duration
    points.push(0);
    points.push(duration);

    return points;
  }

  /**
   * Snap time to nearest snap point
   */
  snapTime(time: number, tracks: TimelineTrack[], duration: number): number {
    const points = this.getSnapPoints(tracks, duration);
    const snapDistance = 0.5 / this.state.zoom; // 0.5 seconds at zoom level

    let nearest = time;
    let minDistance = snapDistance;

    for (const point of points) {
      const distance = Math.abs(time - point);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = point;
      }
    }

    return nearest;
  }

  /**
   * Add a marker
   */
  addMarker(marker: Omit<Marker, 'id'>): Marker {
    const newMarker: Marker = {
      ...marker,
      id: `marker_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    };
    this.markers.push(newMarker);
    return newMarker;
  }

  /**
   * Remove a marker
   */
  removeMarker(markerId: string): void {
    this.markers = this.markers.filter(m => m.id !== markerId);
  }

  /**
   * Get all markers
   */
  getMarkers(): Marker[] {
    return [...this.markers];
  }

  /**
   * Get markers at time
   */
  getMarkersAtTime(time: number): Marker[] {
    return this.markers.filter(m => Math.abs(m.time - time) < 0.1);
  }

  /**
   * Get code snapshots as markers
   */
  getCodeSnapshots(snapshots: any[]): Marker[] {
    return snapshots.map(s => ({
      id: `snapshot_${s.id}`,
      time: s.timestamp,
      type: 'code',
      label: `💻 ${s.fileName}`,
      color: '#6c63ff',
      data: s,
    }));
  }

  /**
   * Select clip
   */
  selectClip(clipId: string, multiSelect: boolean = false): void {
    if (multiSelect) {
      const index = this.state.selectedClipIds.indexOf(clipId);
      if (index >= 0) {
        this.state.selectedClipIds.splice(index, 1);
      } else {
        this.state.selectedClipIds.push(clipId);
      }
    } else {
      this.state.selectedClipIds = [clipId];
    }
  }

  /**
   * Select track
   */
  selectTrack(trackId: string): void {
    this.state.selectedTrackId = trackId;
  }

  /**
   * Clear selection
   */
  clearSelection(): void {
    this.state.selectedClipIds = [];
    this.state.selectedTrackId = null;
  }

  /**
   * Get selected clips
   */
  getSelectedClips(tracks: TimelineTrack[]): VideoClip[] {
    const clips: VideoClip[] = [];
    for (const track of tracks) {
      for (const clip of track.clips) {
        if (this.state.selectedClipIds.includes(clip.id)) {
          clips.push(clip);
        }
      }
    }
    return clips;
  }

  /**
   * Move clip to new position
   */
  moveClip(
    clipId: string,
    newStartTime: number,
    tracks: TimelineTrack[],
    duration: number
  ): { clip: VideoClip; newStartTime: number } | null {
    const clip = this.findClipInTracks(clipId, tracks);
    if (!clip) return null;

    const snappedTime = this.snapTime(newStartTime, tracks, duration);
    const timeDelta = snappedTime - clip.startTime;

    // Move the clip
    clip.startTime = snappedTime;
    clip.endTime = snappedTime + clip.duration;

    return { clip, newStartTime: snappedTime };
  }

  /**
   * Find clip in tracks
   */
  private findClipInTracks(clipId: string, tracks: TimelineTrack[]): VideoClip | null {
    for (const track of tracks) {
      const clip = track.clips.find(c => c.id === clipId);
      if (clip) return clip;
    }
    return null;
  }

  /**
   * Get timeline state
   */
  getState(): TimelineState {
    return { ...this.state };
  }

  /**
   * Set playing state
   */
  setPlaying(isPlaying: boolean): void {
    this.state.isPlaying = isPlaying;
  }

  /**
   * Set dragging state
   */
  setDragging(isDragging: boolean): void {
    this.state.isDragging = isDragging;
  }

  /**
   * Get marker at time
   */
  getMarkerAtTime(time: number, type?: Marker['type']): Marker | null {
    const candidates = this.markers.filter(m => Math.abs(m.time - time) < 0.01);
    if (type) {
      return candidates.find(m => m.type === type) || null;
    }
    return candidates.length > 0 ? candidates[0] : null;
  }

  /**
   * Export timeline as JSON
   */
  exportTimeline(tracks: TimelineTrack[], duration: number): any {
    return {
      version: '1.0',
      duration: duration,
      tracks: tracks.map(track => ({
        id: track.id,
        type: track.type,
        clips: track.clips.map(clip => ({
          id: clip.id,
          filePath: clip.filePath,
          startTime: clip.startTime,
          endTime: clip.endTime,
          duration: clip.duration,
          type: clip.type,
        })),
      })),
      markers: this.markers,
    };
  }

  /**
   * Import timeline from JSON
   */
  importTimeline(data: any): {
    tracks: TimelineTrack[];
    markers: Marker[];
    duration: number;
  } {
    const tracks: TimelineTrack[] = data.tracks.map((t: any) => ({
      id: t.id,
      type: t.type,
      clips: t.clips.map((c: any) => ({
        id: c.id,
        filePath: c.filePath,
        startTime: c.startTime,
        endTime: c.endTime,
        duration: c.duration,
        type: c.type,
      })),
      muted: false,
      volume: 1.0,
      locked: false,
      visible: true,
    }));

    this.markers = data.markers || [];

    return {
      tracks,
      markers: this.markers,
      duration: data.duration || 0,
    };
  }
}

// Export singleton instance
export const timelineManager = new TimelineManager();
export default timelineManager;