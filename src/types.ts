// ============================================================
// RECORDING TYPES
// ============================================================

export interface RecordingConfig {
  mode: 'normal' | 'tutorial' | 'project' | 'bug';
  screen: {
    fullScreen: boolean;
    window: boolean;
    region: boolean;
    monitor: boolean;
    regionBounds?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };
  camera: boolean;
  microphone: boolean;
  systemAudio: boolean;
  quality: '720p' | '1080p' | '4K';
  fps: 30 | 60 | 120;
  outputPath?: string;
  projectMetadata?: {
    name: string;
    purpose: string;
    files?: string[];
  };
  bugMetadata?: {
    title: string;
    application: string;
    version: string;
  };
}

export interface RecordingStatus {
  state: 'idle' | 'initializing' | 'recording' | 'paused' | 'processing' | 'completed' | 'error';
  duration: number;
  fileSize: number;
  error?: string;
  progress?: number;
}

export interface RecordingMetadata {
  id: string;
  title: string;
  timestamp: Date;
  duration: number;
  fileSize: number;
  filePath: string;
  mode: RecordingConfig['mode'];
  config: RecordingConfig;
  snapshots?: CodeSnapshot[];
  gitInfo?: GitInfo;
  thumbnail?: string;
}

// ============================================================
// CODE SNAPSHOT TYPES
// ============================================================

export interface CodeSnapshot {
  id: string;
  timestamp: number;
  filePath: string;
  fileName: string;
  code: string;
  language: string;
  lineStart?: number;
  lineEnd?: number;
  note?: string;
  gitInfo?: GitInfo;
}

export interface SnapshotData {
  projectName?: string;
  gitCommit?: string;
  branch?: string;
  files: CodeSnapshot[];
}

export interface GitInfo {
  commit: string;
  branch: string;
  remote?: string;
  author?: string;
  date?: string;
  message?: string;
}

// ============================================================
// EDITOR TYPES
// ============================================================

export interface VideoClip {
  id: string;
  filePath: string;
  startTime: number;
  endTime: number;
  duration: number;
  type: 'video' | 'audio' | 'image';
  metadata?: {
    width?: number;
    height?: number;
    fps?: number;
    codec?: string;
    bitrate?: number;
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
  color?: string;
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
  gitInfo?: GitInfo;
}

export interface VideoEffect {
  id: string;
  type: 'zoom' | 'blur' | 'highlight' | 'cursor' | 'click' | '3d' | 'text' | 'arrow' | 'shape' | 'transition';
  startTime: number;
  endTime: number;
  config: any;
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
  progress: number;
  status: 'idle' | 'preparing' | 'encoding' | 'muxing' | 'done' | 'error';
  currentTime: number;
  totalTime: number;
  fps: number;
  speed: number;
  error?: string;
}

// ============================================================
// MUSIC TYPES
// ============================================================

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
  metadata?: MusicMetadata;
}

export interface MusicMetadata {
  title?: string;
  artist?: string;
  album?: string;
  year?: number;
  genre?: string;
  bitrate?: number;
  sampleRate?: number;
  channels?: number;
}

export interface MusicConfig {
  volume?: number;
  startTime?: number;
  endTime?: number;
  fadeIn?: number;
  fadeOut?: number;
  loop?: boolean;
}

// ============================================================
// THREE.JS / 3D TYPES
// ============================================================

export interface SceneConfig {
  backgroundColor?: string;
  fogColor?: string;
  fogDensity?: number;
  ambientLightColor?: string;
  ambientLightIntensity?: number;
  directionalLightColor?: string;
  directionalLightIntensity?: number;
  useBloom?: boolean;
  bloomStrength?: number;
  bloomRadius?: number;
  bloomThreshold?: number;
}

export interface SceneObject {
  id: string;
  mesh: any;
  type: 'mesh' | 'group' | 'points' | 'sprite';
  visible: boolean;
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation: {
    x: number;
    y: number;
    z: number;
  };
  scale: {
    x: number;
    y: number;
    z: number;
  };
  userData: any;
}

export interface Animation {
  id: string;
  objectId: string;
  type: 'spin' | 'float' | 'bounce' | 'pulse' | 'orbit' | 'path' | 'fade' | 'scale';
  duration: number;
  delay: number;
  loop: boolean;
  progress: number;
  config: any;
  startTime?: number;
  isPlaying: boolean;
}

export interface SpinConfig {
  speed?: number;
  axis?: 'x' | 'y' | 'z' | 'all';
  direction?: 1 | -1;
}

export interface FloatConfig {
  amplitude?: number;
  speed?: number;
  axis?: 'x' | 'y' | 'z';
  phase?: number;
}

export interface BounceConfig {
  amplitude?: number;
  speed?: number;
  decay?: number;
}

export interface PulseConfig {
  minScale?: number;
  maxScale?: number;
  speed?: number;
}

export interface OrbitConfig {
  radius?: number;
  speed?: number;
  axis?: 'x' | 'y' | 'z';
  center?: { x: number; y: number; z: number };
}

export interface PathConfig {
  points: Array<{ x: number; y: number; z: number }>;
  speed?: number;
  loop?: boolean;
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

export interface FadeConfig {
  startOpacity?: number;
  endOpacity?: number;
  speed?: number;
}

export interface ScaleConfig {
  minScale?: number;
  maxScale?: number;
  speed?: number;
  axis?: 'x' | 'y' | 'z' | 'all';
}

// ============================================================
// 3D OBJECT CONFIG TYPES
// ============================================================

export interface ObjectConfig {
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  scale?: { x: number; y: number; z: number };
  color?: string;
  opacity?: number;
  wireframe?: boolean;
  emissive?: string;
  emissiveIntensity?: number;
}

export interface CubeConfig extends ObjectConfig {
  width?: number;
  height?: number;
  depth?: number;
  rounded?: boolean;
  radius?: number;
}

export interface SphereConfig extends ObjectConfig {
  radius?: number;
  widthSegments?: number;
  heightSegments?: number;
}

export interface TextConfig extends ObjectConfig {
  text: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  align?: 'left' | 'center' | 'right';
  lineHeight?: number;
}

export interface DeviceConfig extends ObjectConfig {
  type: 'laptop' | 'monitor' | 'phone' | 'tablet';
  width?: number;
  height?: number;
  depth?: number;
  screenColor?: string;
  frameColor?: string;
}

export interface NetworkNodeConfig extends ObjectConfig {
  label?: string;
  radius?: number;
  color?: string;
  connections?: string[];
}

// ============================================================
// SCREEN / CAMERA / AUDIO TYPES
// ============================================================

export interface DisplayInfo {
  id: number;
  name: string;
  width: number;
  height: number;
  refreshRate: number;
  isPrimary: boolean;
  scale?: number;
}

export interface WindowInfo {
  handle: number;
  title: string;
  processName: string;
  processId: number;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  isVisible: boolean;
}

export interface CameraDevice {
  id: string;
  name: string;
  facing: 'front' | 'back';
  resolutions: Array<{
    width: number;
    height: number;
    fps: number;
  }>;
  isDefault?: boolean;
}

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

export interface AudioDevice {
  id: string;
  name: string;
  type: 'microphone' | 'system' | 'both';
  isDefault: boolean;
  sampleRate: number;
  channels: number;
  volume?: number;
}

export interface MicrophoneConfig {
  device?: string;
  volume?: number;
  mute?: boolean;
  noiseReduction?: boolean;
  echoCancellation?: boolean;
}

export interface SystemAudioConfig {
  device?: string;
  volume?: number;
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

// ============================================================
// STORAGE TYPES
// ============================================================

export interface StorageConfig {
  appName: string;
  recordingsPath: string;
  projectsPath: string;
  exportsPath: string;
  snapshotsPath: string;
  cachePath: string;
  maxStorageSize?: number;
}

export interface FileInfo {
  name: string;
  path: string;
  size: number;
  isDirectory: boolean;
  isFile: boolean;
  modifiedAt: Date;
  createdAt: Date;
  extension?: string;
}

export interface MediaInfo {
  path: string;
  duration: number;
  width?: number;
  height?: number;
  fps?: number;
  codec?: string;
  bitrate?: number;
  format?: string;
  hasVideo: boolean;
  hasAudio: boolean;
}

// ============================================================
// UI / NAVIGATION TYPES
// ============================================================

export interface AppScreen {
  id: string;
  name: string;
  icon: string;
  component: React.ComponentType<any>;
  options?: {
    title?: string;
    headerShown?: boolean;
    animation?: 'slide' | 'fade' | 'none';
  };
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  icon: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  completed: boolean;
  steps?: TutorialStep[];
}

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  image?: string;
  action?: () => void;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number;
  dismissed?: boolean;
}

// ============================================================
// SETTINGS TYPES
// ============================================================

export interface AppSettings {
  // General
  theme: 'light' | 'dark' | 'system';
  language: string;
  autoSave: boolean;
  autoSavePath: string;
  
  // Recording
  defaultQuality: '720p' | '1080p' | '4K';
  defaultFps: 30 | 60 | 120;
  showCursor: boolean;
  highlightClicks: boolean;
  showHotkeys: boolean;
  countdownDuration: 3 | 5 | 10;
  
  // Audio
  microphoneDevice: string;
  microphoneVolume: number;
  systemAudio: boolean;
  systemAudioDevice: string;
  audioNoiseReduction: boolean;
  audioEchoCancellation: boolean;
  
  // Export
  exportFormat: 'mp4' | 'mov' | 'avi';
  exportQuality: 'high' | 'medium' | 'low';
  exportPath: string;
  exportAutoOpen: boolean;
  
  // Performance
  hardwareAcceleration: boolean;
  maxMemoryUsage: 'low' | 'medium' | 'high';
  useGPUEncoding: boolean;
  
  // Privacy
  analyticsOptIn: boolean;
  crashReports: boolean;
  sendUsageData: boolean;
  
  // Shortcuts
  hotkeys: {
    startRecording: string;
    stopRecording: string;
    pauseRecording: string;
    takeSnapshot: string;
    toggleCamera: string;
    toggleMicrophone: string;
  };
}

// ============================================================
// RESPONSE / ERROR TYPES
// ============================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
}

export interface AppError {
  code: string;
  message: string;
  details?: any;
  stack?: string;
  recoverable: boolean;
}

// ============================================================
// UTILITY TYPES
// ============================================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncFunction<T = any> = (...args: any[]) => Promise<T>;

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterOptions {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith';
  value: any;
}

// ============================================================
// TIMELINE TYPES
// ============================================================

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

export interface TimelineTrackInfo {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'text' | 'effect';
  height: number;
  clips: VideoClip[];
  muted: boolean;
  locked: boolean;
  visible: boolean;
}

