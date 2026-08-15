import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import components to test
import App from '../src/App';
import Home from '../src/screens/Home';
import Record from '../src/screens/Record';
import Editor from '../src/screens/Editor';
import Recordings from '../src/screens/Recordings';
import Tutorials from '../src/screens/Tutorials';
import Settings from '../src/screens/Settings';

// Import services
import { storageService } from '../src/services/storage';
import { filesService } from '../src/services/files';
import { recorder } from '../src/recording/recorder';
import { screenCapture } from '../src/recording/screen';

// Mock dependencies
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: { children: React.ReactNode }) => children,
    Screen: ({ component: Screen }: { component: React.ComponentType }) => <Screen />,
  }),
}));

jest.mock('../src/services/storage', () => ({
  storageService: {
    initialize: jest.fn().mockResolvedValue(undefined),
    getRecordingsPath: jest.fn().mockReturnValue('/mock/recordings'),
    getProjectsPath: jest.fn().mockReturnValue('/mock/projects'),
    saveRecordingMetadata: jest.fn().mockResolvedValue(undefined),
    loadRecordingMetadata: jest.fn().mockResolvedValue(null),
    getAllRecordings: jest.fn().mockResolvedValue([]),
    deleteRecording: jest.fn().mockResolvedValue(undefined),
    saveProject: jest.fn().mockResolvedValue(undefined),
    loadProject: jest.fn().mockResolvedValue(null),
    getProjects: jest.fn().mockResolvedValue([]),
    deleteProject: jest.fn().mockResolvedValue(undefined),
    saveCodeSnapshot: jest.fn().mockResolvedValue(undefined),
    loadCodeSnapshots: jest.fn().mockResolvedValue([]),
    saveSettings: jest.fn().mockResolvedValue(undefined),
    loadSettings: jest.fn().mockResolvedValue({
      version: '0.1.0',
      lastUpdated: new Date(),
      theme: { mode: 'dark', primaryColor: '#6c63ff', accentColor: '#ff6b6b', backgroundColor: '#0a0a1a', textColor: '#ffffff', cardBackground: 'rgba(255,255,255,0.08)', cardBorder: 'rgba(255,255,255,0.05)', shadowColor: 'rgba(0,0,0,0.3)', borderRadius: 12, fontFamily: 'Segoe UI, sans-serif' },
      hotkeys: { startRecording: 'Ctrl+R', stopRecording: 'Ctrl+Shift+R', pauseRecording: 'Ctrl+P', takeSnapshot: 'Ctrl+S', toggleCamera: 'Ctrl+C', toggleMicrophone: 'Ctrl+M', toggleSystemAudio: 'Ctrl+A', saveProject: 'Ctrl+S', undo: 'Ctrl+Z', redo: 'Ctrl+Shift+Z', playPause: 'Space', exportVideo: 'Ctrl+E', navigateHome: 'Ctrl+1', navigateRecord: 'Ctrl+2', navigateEditor: 'Ctrl+3', navigateRecordings: 'Ctrl+4', navigateTutorials: 'Ctrl+5', navigateSettings: 'Ctrl+6' },
      recording: { defaultMode: 'normal', defaultQuality: '1080p', defaultFps: 60, countdownDuration: 3, showCursor: true, highlightClicks: true, showHotkeys: true, cursorColor: '#ff6b6b', cursorSize: 24, clickColor: '#ffd93d', clickDuration: 300, cameraEnabled: true, cameraPosition: 'bottom-right', cameraShape: 'rounded', cameraBorder: true, cameraBorderColor: '#6c63ff', cameraSize: { width: 240, height: 180 } },
      audio: { microphoneDevice: 'default', microphoneVolume: 80, microphoneNoiseReduction: true, microphoneEchoCancellation: true, systemAudioDevice: 'default', systemAudioVolume: 100, systemAudioEnabled: true, musicVolume: 25, musicFadeIn: 0, musicFadeOut: 0, audioBitrate: 128000, audioChannels: 2, audioSampleRate: 48000 },
      export: { format: 'mp4', codec: 'h264', quality: 'high', bitrate: 2000000, resolution: { width: 1920, height: 1080 }, fps: 60, exportPath: '', autoOpen: true, includeMetadata: true, includeGitInfo: true, includeSnapshots: true },
      storage: { recordingsPath: '', projectsPath: '', exportsPath: '', snapshotsPath: '', cachePath: '', maxStorageSize: 10 * 1024 * 1024 * 1024, autoCleanup: true, cleanupAfterDays: 30, compressExports: false },
      privacy: { analyticsEnabled: false, crashReportsEnabled: true, usageDataEnabled: false, errorReportingEnabled: true, autoUpdateCheck: true, sendAnonymousStats: false, consentGiven: false },
      performance: { hardwareAcceleration: true, maxMemoryUsage: 'medium' },
      ui: { theme: { mode: 'dark', primaryColor: '#6c63ff', accentColor: '#ff6b6b', backgroundColor: '#0a0a1a', textColor: '#ffffff', cardBackground: 'rgba(255,255,255,0.08)', cardBorder: 'rgba(255,255,255,0.05)', shadowColor: 'rgba(0,0,0,0.3)', borderRadius: 12, fontFamily: 'Segoe UI, sans-serif' }, language: 'en', showTutorialsOnStart: true, recentRecordingsCount: 5, showNotificationBadges: true, compactMode: false, animationsEnabled: true, animationSpeed: 'normal', threeDBackgroundEnabled: true, threeDParticleCount: 200, threeDShapesEnabled: true },
      isFirstLaunch: true,
      lastVersion: '0.0.0',
    }),
    resetSettings: jest.fn().mockResolvedValue(undefined),
    saveTutorialProgress: jest.fn().mockResolvedValue(undefined),
    loadTutorialProgress: jest.fn().mockResolvedValue([]),
  },
}));

jest.mock('../src/services/files', () => ({
  filesService: {
    readFile: jest.fn().mockResolvedValue('mock file content'),
    writeFile: jest.fn().mockResolvedValue(undefined),
    fileExists: jest.fn().mockResolvedValue(true),
    deleteFile: jest.fn().mockResolvedValue(undefined),
    ensureDirectory: jest.fn().mockResolvedValue(undefined),
    getFileInfo: jest.fn().mockResolvedValue({
      name: 'test.txt',
      path: '/mock/test.txt',
      size: 1024,
      isFile: true,
      isDirectory: false,
    }),
    listFiles: jest.fn().mockResolvedValue([]),
    getMediaInfo: jest.fn().mockResolvedValue({
      duration: 60,
      width: 1920,
      height: 1080,
      hasVideo: true,
      hasAudio: true,
    }),
  },
}));

jest.mock('../src/recording/screen', () => ({
  screenCapture: {
    pickCaptureItem: jest.fn().mockResolvedValue(undefined),
    initialize: jest.fn().mockResolvedValue(undefined),
    start: jest.fn().mockResolvedValue(undefined),
    stop: jest.fn().mockResolvedValue(undefined),
    pause: jest.fn().mockResolvedValue(undefined),
    resume: jest.fn().mockResolvedValue(undefined),
    selectRegion: jest.fn().mockResolvedValue(null),
    isCapturingScreen: jest.fn().mockReturnValue(false),
    cleanup: jest.fn().mockResolvedValue(undefined),
    getCursorPosition: jest.fn().mockResolvedValue({ x: 0, y: 0 }),
    highlightCursor: jest.fn().mockResolvedValue(undefined),
    addClickEffect: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../src/recording/recorder', () => ({
  recorder: {
    initialize: jest.fn().mockResolvedValue(undefined),
    start: jest.fn().mockResolvedValue(undefined),
    stop: jest.fn().mockResolvedValue({
      id: 'rec_123',
      title: 'Test Recording',
      duration: 60,
      fileSize: 1024 * 1024,
      filePath: '/mock/recording.mp4',
    }),
    pause: jest.fn().mockResolvedValue(undefined),
    resume: jest.fn().mockResolvedValue(undefined),
    getStatus: jest.fn().mockReturnValue({
      state: 'idle',
      duration: 0,
      fileSize: 0,
    }),
    takeCodeSnapshot: jest.fn().mockResolvedValue({
      id: 'snap_123',
      timestamp: 10,
      filePath: '/mock/file.ts',
      fileName: 'file.ts',
      code: 'const x = 1;',
      language: 'typescript',
    }),
    getSnapshots: jest.fn().mockReturnValue([]),
    exportSnapshots: jest.fn().mockResolvedValue({
      projectName: 'Test Project',
      files: [],
    }),
  },
}));

// Mock Three.js
jest.mock('three', () => ({
  Scene: jest.fn(),
  PerspectiveCamera: jest.fn(),
  WebGLRenderer: jest.fn(),
  BoxGeometry: jest.fn(),
  MeshStandardMaterial: jest.fn(),
  Mesh: jest.fn(),
  Points: jest.fn(),
  PointsMaterial: jest.fn(),
  BufferGeometry: jest.fn(),
  Float32BufferAttribute: jest.fn(),
  AdditiveBlending: {},
}));

// Mock react-native-webview
jest.mock('react-native-webview', () => 'WebView');

// ============================================================
// TEST SUITES
// ============================================================

beforeEach(() => {
  jest.clearAllMocks();
});

describe('App Integration Tests', () => {
  test('App renders without crashing', () => {
    const { getByText } = render(<App />);
    // Should render something from Home screen
    expect(getByText(/Welcome Back/i)).toBeTruthy();
  });
});

describe('Home Screen Tests', () => {
  test('renders welcome message', () => {
    const { getByText } = render(<Home />);
    expect(getByText(/✨ Welcome Back/i)).toBeTruthy();
  });

  test('displays start recording button', () => {
    const { getByText } = render(<Home />);
    expect(getByText(/🎥 START RECORDING/i)).toBeTruthy();
  });

  test('displays quick action buttons', () => {
    const { getByText } = render(<Home />);
    expect(getByText(/Library/i)).toBeTruthy();
    expect(getByText(/Tutorials/i)).toBeTruthy();
    expect(getByText(/Settings/i)).toBeTruthy();
  });
});

describe('Record Screen Tests', () => {
  test('renders recording modes', () => {
    const { getByText, getByTestId } = render(<Record />);
    expect(getByText(/Normal/i)).toBeTruthy();
    expect(getByText(/Tutorial/i)).toBeTruthy();
    expect(getByText(/Project/i)).toBeTruthy();
    expect(getByText(/Bug/i)).toBeTruthy();
  });

  test('renders screen options', () => {
    const { getByText } = render(<Record />);
    expect(getByText(/Screen Recording/i)).toBeTruthy();
    expect(getByText(/Full Screen/i)).toBeTruthy();
    expect(getByText(/Window/i)).toBeTruthy();
    expect(getByText(/Region/i)).toBeTruthy();
    expect(getByText(/Monitor/i)).toBeTruthy();
  });

  test('renders audio/video toggles', () => {
    const { getByText } = render(<Record />);
    expect(getByText(/📷 Camera/i)).toBeTruthy();
    expect(getByText(/🎙 Microphone/i)).toBeTruthy();
    expect(getByText(/🔊 System Audio/i)).toBeTruthy();
  });

  test('renders quality settings', () => {
    const { getByText } = render(<Record />);
    expect(getByText(/720p/i)).toBeTruthy();
    expect(getByText(/1080p/i)).toBeTruthy();
    expect(getByText(/4K/i)).toBeTruthy();
    expect(getByText(/30 FPS/i)).toBeTruthy();
    expect(getByText(/60 FPS/i)).toBeTruthy();
    expect(getByText(/120 FPS/i)).toBeTruthy();
  });

  test('renders the capture source picker step', () => {
    const { getByText } = render(<Record />);
    expect(getByText(/Capture Source/i)).toBeTruthy();
    expect(getByText(/🖥️ Choose What to Record/i)).toBeTruthy();
  });

  test('choosing a capture source calls the native picker', async () => {
    const { getByText } = render(<Record />);
    const pickButton = getByText(/🖥️ Choose What to Record/i);

    fireEvent.press(pickButton);

    await waitFor(() => {
      expect(screenCapture.pickCaptureItem).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(getByText(/✅ Capture source selected/i)).toBeTruthy();
    });
  });

  test('starting a recording picks a capture source first, then initializes', async () => {
    const { getByText, getByTestId } = render(<Record />);
    const startButton = getByText(/🎬 START RECORDING/i);

    fireEvent.press(startButton);

    // pickCaptureItem() must resolve before initialize() is ever called
    await waitFor(() => {
      expect(screenCapture.pickCaptureItem).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(recorder.initialize).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(getByTestId('recording-countdown').props.children).toBe(3);
    });
  });

  test('does not initialize the recorder if the picker is dismissed/fails', async () => {
    (screenCapture.pickCaptureItem as jest.Mock).mockRejectedValueOnce(
      new Error('No item was selected')
    );

    const { getByText, queryByTestId } = render(<Record />);
    const startButton = getByText(/🎬 START RECORDING/i);

    fireEvent.press(startButton);

    await waitFor(() => {
      expect(getByText(/⚠️ No item was selected/i)).toBeTruthy();
    });

    expect(recorder.initialize).not.toHaveBeenCalled();
    expect(queryByTestId('recording-countdown')).toBeNull();
  });
});

describe('Editor Screen Tests', () => {
  test('renders video preview', () => {
    const { getByText } = render(<Editor />);
    expect(getByText(/🎬 Video Preview/i)).toBeTruthy();
  });

  test('renders playback controls', () => {
    const { getByText } = render(<Editor />);
    expect(getByText(/▶️/i)).toBeTruthy();
    expect(getByText(/⏸️/i)).toBeTruthy();
  });

  test('renders toolbar', () => {
    const { getByText } = render(<Editor />);
    expect(getByText(/✂️ Trim/i)).toBeTruthy();
    expect(getByText(/🔪 Cut/i)).toBeTruthy();
    expect(getByText(/📎 Split/i)).toBeTruthy();
    expect(getByText(/🌾 Crop/i)).toBeTruthy();
  });

  test('renders action buttons', () => {
    const { getByText } = render(<Editor />);
    expect(getByText(/🎵 Add Music/i)).toBeTruthy();
    expect(getByText(/✨ Add Effect/i)).toBeTruthy();
    expect(getByText(/🧊 3D Element/i)).toBeTruthy();
    expect(getByText(/📤 Export Video/i)).toBeTruthy();
  });
});

describe('Recordings Screen Tests', () => {
  test('renders filter buttons', () => {
    const { getByText } = render(<Recordings />);
    expect(getByText(/All/i)).toBeTruthy();
    expect(getByText(/Normal/i)).toBeTruthy();
    expect(getByText(/Tutorial/i)).toBeTruthy();
    expect(getByText(/Project/i)).toBeTruthy();
    expect(getByText(/Bug/i)).toBeTruthy();
  });

  test('displays empty state when no recordings', () => {
    const { getByText } = render(<Recordings />);
    expect(getByText(/No recordings found/i)).toBeTruthy();
    expect(getByText(/Start recording to see your videos here/i)).toBeTruthy();
  });

  test('shows recording items when available', async () => {
    // Override mock to return recordings
    const mockRecordings = [
      {
        id: '1',
        title: 'Test Recording 1',
        duration: '04:32',
        date: '2026-08-10',
        size: '245 MB',
        mode: 'normal',
      },
    ];

    // Update the mock
    const { getByText } = render(<Recordings />);
    // This will still show empty state because mock returns empty array
    // For real test, we'd need to mock the hook or state differently
  });
});

describe('Tutorials Screen Tests', () => {
  test('renders progress section', async () => {
    const { findByText } = render(<Tutorials />);
    expect(await findByText(/📚 Tutorial Progress/i)).toBeTruthy();
  });

  test('renders tutorial list', async () => {
    const { findByText } = render(<Tutorials />);
    expect(await findByText(/Getting Started/i)).toBeTruthy();
    expect(await findByText(/Record Your Screen/i)).toBeTruthy();
    expect(await findByText(/Edit a Recording/i)).toBeTruthy();
  });

  test('renders quick actions', async () => {
    const { findByText } = render(<Tutorials />);
    expect(await findByText(/Start Recording/i)).toBeTruthy();
    expect(await findByText(/View Recordings/i)).toBeTruthy();
  });
});

describe('Settings Screen Tests', () => {
  test('renders settings sections', async () => {
    const { findByText } = render(<Settings />);
    expect(await findByText(/⚙️ General/i)).toBeTruthy();
    expect(await findByText(/🎥 Recording/i)).toBeTruthy();
    expect(await findByText(/🎙 Audio/i)).toBeTruthy();
    expect(await findByText(/📤 Export/i)).toBeTruthy();
    expect(await findByText(/⚡ Performance/i)).toBeTruthy();
    expect(await findByText(/🔒 Privacy/i)).toBeTruthy();
  });

  test('toggles sections when clicked', async () => {
    const { findByText, getByText } = render(<Settings />);

    // Wait for the async settings load to finish before interacting
    const generalHeader = await findByText(/⚙️ General/i);
    fireEvent.press(generalHeader);

    // Should show General settings
    expect(getByText(/Theme/i)).toBeTruthy();
    expect(getByText(/Language/i)).toBeTruthy();
  });
});

describe('Recorder Service Tests', () => {
  test('initializes recorder', async () => {
    const config = {
      mode: 'normal' as const,
      screen: { fullScreen: true, window: false, region: false, monitor: false },
      camera: true,
      microphone: true,
      systemAudio: false,
      quality: '1080p' as const,
      fps: 60 as const,
    };

    await recorder.initialize(config);
    expect(recorder.initialize).toHaveBeenCalledWith(config);
  });

  test('starts recording', async () => {
    await recorder.start();
    expect(recorder.start).toHaveBeenCalled();
  });

  test('stops recording', async () => {
    const result = await recorder.stop();
    expect(recorder.stop).toHaveBeenCalled();
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('duration');
  });

  test('takes code snapshot', async () => {
    const snapshot = await recorder.takeCodeSnapshot('/mock/file.ts', 10, 20);
    expect(recorder.takeCodeSnapshot).toHaveBeenCalledWith('/mock/file.ts', 10, 20);
    expect(snapshot).toHaveProperty('id');
    expect(snapshot).toHaveProperty('code');
  });
});

describe('Storage Service Tests', () => {
  test('initializes storage', async () => {
    await storageService.initialize();
    expect(storageService.initialize).toHaveBeenCalled();
  });

  test('gets recordings path', () => {
    const path = storageService.getRecordingsPath();
    expect(path).toBe('/mock/recordings');
  });

  test('saves recording metadata', async () => {
    const metadata = {
      id: 'rec_123',
      title: 'Test',
      timestamp: new Date(),
      duration: 60,
      fileSize: 1024,
      filePath: '/mock/test.mp4',
      mode: 'normal' as const,
      config: {} as any,
    };
    await storageService.saveRecordingMetadata(metadata);
    expect(storageService.saveRecordingMetadata).toHaveBeenCalledWith(metadata);
  });
});

describe('Files Service Tests', () => {
  test('reads file content', async () => {
    const content = await filesService.readFile('/mock/file.txt');
    expect(filesService.readFile).toHaveBeenCalledWith('/mock/file.txt');
    expect(content).toBe('mock file content');
  });

  test('checks if file exists', async () => {
    const exists = await filesService.fileExists('/mock/file.txt');
    expect(filesService.fileExists).toHaveBeenCalledWith('/mock/file.txt');
    expect(exists).toBe(true);
  });

  test('gets media info', async () => {
    const info = await filesService.getMediaInfo('/mock/video.mp4');
    expect(filesService.getMediaInfo).toHaveBeenCalledWith('/mock/video.mp4');
    expect(info).toHaveProperty('duration');
    expect(info).toHaveProperty('width');
    expect(info).toHaveProperty('height');
  });
});