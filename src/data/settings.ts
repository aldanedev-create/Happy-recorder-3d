export interface HotkeySettings {
  startRecording: string;
  stopRecording: string;
  pauseRecording: string;
  takeSnapshot: string;
  toggleCamera: string;
  toggleMicrophone: string;
  toggleSystemAudio: string;
  saveProject: string;
  undo: string;
  redo: string;
  playPause: string;
  exportVideo: string;
  navigateHome: string;
  navigateRecord: string;
  navigateEditor: string;
  navigateRecordings: string;
  navigateTutorials: string;
  navigateSettings: string;
}

export interface ThemeSettings {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  cardBackground: string;
  cardBorder: string;
  shadowColor: string;
  borderRadius: number;
  fontFamily: string;
}

export interface RecordingSettings {
  defaultMode: 'normal' | 'tutorial' | 'project' | 'bug';
  defaultQuality: '720p' | '1080p' | '4K';
  defaultFps: 30 | 60 | 120;
  countdownDuration: 3 | 5 | 10;
  showCursor: boolean;
  highlightClicks: boolean;
  showHotkeys: boolean;
  cursorColor: string;
  cursorSize: number;
  clickColor: string;
  clickDuration: number;
  cameraEnabled: boolean;
  cameraPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  cameraShape: 'circle' | 'rounded' | 'square';
  cameraBorder: boolean;
  cameraBorderColor: string;
  cameraSize: { width: number; height: number };
}

export interface AudioSettings {
  microphoneDevice: string;
  microphoneVolume: number;
  microphoneNoiseReduction: boolean;
  microphoneEchoCancellation: boolean;
  systemAudioDevice: string;
  systemAudioVolume: number;
  systemAudioEnabled: boolean;
  musicVolume: number;
  musicFadeIn: number;
  musicFadeOut: number;
  audioBitrate: number;
  audioChannels: 1 | 2 | 6;
  audioSampleRate: 44100 | 48000 | 96000;
}

export interface ExportSettings {
  format: 'mp4' | 'mov' | 'avi' | 'webm';
  codec: 'h264' | 'h265' | 'vp9' | 'prores';
  quality: 'low' | 'medium' | 'high' | 'lossless';
  bitrate: number;
  resolution: { width: number; height: number };
  fps: 30 | 60 | 120;
  exportPath: string;
  autoOpen: boolean;
  includeMetadata: boolean;
  includeGitInfo: boolean;
  includeSnapshots: boolean;
}

export interface StorageSettings {
  recordingsPath: string;
  projectsPath: string;
  exportsPath: string;
  snapshotsPath: string;
  cachePath: string;
  maxStorageSize: number;
  autoCleanup: boolean;
  cleanupAfterDays: number;
  compressExports: boolean;
}

export interface PrivacySettings {
  analyticsEnabled: boolean;
  crashReportsEnabled: boolean;
  usageDataEnabled: boolean;
  errorReportingEnabled: boolean;
  autoUpdateCheck: boolean;
  sendAnonymousStats: boolean;
  consentGiven: boolean;
}

export interface UISettings {
  theme: ThemeSettings;
  language: string;
  showTutorialsOnStart: boolean;
  recentRecordingsCount: number;
  showNotificationBadges: boolean;
  compactMode: boolean;
  animationsEnabled: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
  threeDBackgroundEnabled: boolean;
  threeDParticleCount: number;
  threeDShapesEnabled: boolean;
}

export interface AppSettings {
  version: string;
  lastUpdated: Date;
  theme: ThemeSettings;
  hotkeys: HotkeySettings;
  recording: RecordingSettings;
  audio: AudioSettings;
  export: ExportSettings;
  storage: StorageSettings;
  privacy: PrivacySettings;
  ui: UISettings;
  isFirstLaunch: boolean;
  lastVersion: string;
}

// ============================================================
// DEFAULT SETTINGS
// ============================================================

export const DEFAULT_THEME: ThemeSettings = {
  mode: 'dark',
  primaryColor: '#6c63ff',
  accentColor: '#ff6b6b',
  backgroundColor: '#0a0a1a',
  textColor: '#ffffff',
  cardBackground: 'rgba(255, 255, 255, 0.08)',
  cardBorder: 'rgba(255, 255, 255, 0.05)',
  shadowColor: 'rgba(0, 0, 0, 0.3)',
  borderRadius: 12,
  fontFamily: 'Segoe UI, sans-serif',
};

export const DEFAULT_HOTKEYS: HotkeySettings = {
  startRecording: 'Ctrl+R',
  stopRecording: 'Ctrl+Shift+R',
  pauseRecording: 'Ctrl+P',
  takeSnapshot: 'Ctrl+S',
  toggleCamera: 'Ctrl+C',
  toggleMicrophone: 'Ctrl+M',
  toggleSystemAudio: 'Ctrl+A',
  saveProject: 'Ctrl+S',
  undo: 'Ctrl+Z',
  redo: 'Ctrl+Shift+Z',
  playPause: 'Space',
  exportVideo: 'Ctrl+E',
  navigateHome: 'Ctrl+1',
  navigateRecord: 'Ctrl+2',
  navigateEditor: 'Ctrl+3',
  navigateRecordings: 'Ctrl+4',
  navigateTutorials: 'Ctrl+5',
  navigateSettings: 'Ctrl+6',
};

export const DEFAULT_RECORDING: RecordingSettings = {
  defaultMode: 'normal',
  defaultQuality: '1080p',
  defaultFps: 60,
  countdownDuration: 3,
  showCursor: true,
  highlightClicks: true,
  showHotkeys: true,
  cursorColor: '#ff6b6b',
  cursorSize: 24,
  clickColor: '#ffd93d',
  clickDuration: 300,
  cameraEnabled: true,
  cameraPosition: 'bottom-right',
  cameraShape: 'rounded',
  cameraBorder: true,
  cameraBorderColor: '#6c63ff',
  cameraSize: { width: 240, height: 180 },
};

export const DEFAULT_AUDIO: AudioSettings = {
  microphoneDevice: 'default',
  microphoneVolume: 80,
  microphoneNoiseReduction: true,
  microphoneEchoCancellation: true,
  systemAudioDevice: 'default',
  systemAudioVolume: 100,
  systemAudioEnabled: true,
  musicVolume: 25,
  musicFadeIn: 0,
  musicFadeOut: 0,
  audioBitrate: 128000,
  audioChannels: 2,
  audioSampleRate: 48000,
};

export const DEFAULT_EXPORT: ExportSettings = {
  format: 'mp4',
  codec: 'h264',
  quality: 'high',
  bitrate: 2000000,
  resolution: { width: 1920, height: 1080 },
  fps: 60,
  exportPath: '',
  autoOpen: true,
  includeMetadata: true,
  includeGitInfo: true,
  includeSnapshots: true,
};

export const DEFAULT_STORAGE: StorageSettings = {
  recordingsPath: '',
  projectsPath: '',
  exportsPath: '',
  snapshotsPath: '',
  cachePath: '',
  maxStorageSize: 10 * 1024 * 1024 * 1024, // 10GB
  autoCleanup: true,
  cleanupAfterDays: 30,
  compressExports: false,
};

export const DEFAULT_PRIVACY: PrivacySettings = {
  analyticsEnabled: false,
  crashReportsEnabled: true,
  usageDataEnabled: false,
  errorReportingEnabled: true,
  autoUpdateCheck: true,
  sendAnonymousStats: false,
  consentGiven: false,
};

export const DEFAULT_UI: UISettings = {
  theme: DEFAULT_THEME,
  language: 'en',
  showTutorialsOnStart: true,
  recentRecordingsCount: 5,
  showNotificationBadges: true,
  compactMode: false,
  animationsEnabled: true,
  animationSpeed: 'normal',
  threeDBackgroundEnabled: true,
  threeDParticleCount: 200,
  threeDShapesEnabled: true,
};

export const DEFAULT_SETTINGS: AppSettings = {
  version: '0.1.0',
  lastUpdated: new Date(),
  theme: DEFAULT_THEME,
  hotkeys: DEFAULT_HOTKEYS,
  recording: DEFAULT_RECORDING,
  audio: DEFAULT_AUDIO,
  export: DEFAULT_EXPORT,
  storage: DEFAULT_STORAGE,
  privacy: DEFAULT_PRIVACY,
  ui: DEFAULT_UI,
  isFirstLaunch: true,
  lastVersion: '0.0.0',
};

// ============================================================
// SETTINGS HELPERS
// ============================================================

/**
 * Get a setting by path (e.g., 'recording.defaultQuality')
 */
export function getSettingByPath(settings: AppSettings, path: string): any {
  const parts = path.split('.');
  let current: any = settings;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return current;
}

/**
 * Set a setting by path
 */
export function setSettingByPath(settings: AppSettings, path: string, value: any): AppSettings {
  const parts = path.split('.');
  const newSettings = { ...settings };
  let current: any = newSettings;
  
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current) || typeof current[part] !== 'object') {
      current[part] = {};
    }
    current = current[part];
  }
  
  current[parts[parts.length - 1]] = value;
  return newSettings;
}

/**
 * Validate settings
 */
export function validateSettings(settings: AppSettings): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate recording quality
  if (!['720p', '1080p', '4K'].includes(settings.recording.defaultQuality)) {
    errors.push('Invalid recording quality');
  }
  
  // Validate FPS
  if (![30, 60, 120].includes(settings.recording.defaultFps)) {
    errors.push('Invalid FPS value');
  }
  
  // Validate audio volume
  if (settings.audio.microphoneVolume < 0 || settings.audio.microphoneVolume > 100) {
    errors.push('Microphone volume must be between 0 and 100');
  }
  
  // Validate camera size
  if (settings.recording.cameraSize.width < 50 || settings.recording.cameraSize.width > 500) {
    errors.push('Camera width must be between 50 and 500');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

export default DEFAULT_SETTINGS;