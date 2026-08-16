import { NativeModules } from 'react-native';
import { cameraCapture } from './camera';
import { audioCapture } from './audio';
import { storageService } from '../services/storage';
import { filesService } from '../services/files';
import { nativeService } from '../services/native';

// Type definitions
export interface RecordingConfig {
  mode: 'normal' | 'tutorial' | 'project' | 'bug';
  screen: {
    fullScreen: boolean;
    window: boolean;
    region: boolean;
    monitor: boolean;
    regionBounds?: { x: number; y: number; width: number; height: number };
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
    // Optional path to the project's repo root, used to look up git info
    // via the native module. Not required -- if omitted, we try to infer
    // it from the first tracked file, and fall back to no git info at all.
    repoPath?: string;
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
}

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

class Recorder {
  private config: RecordingConfig | null = null;
  private status: RecordingStatus = {
    state: 'idle',
    duration: 0,
    fileSize: 0,
  };
  private recordingId: string | null = null;
  private startTime: number = 0;
  private timerInterval: NodeJS.Timeout | null = null;
  private snapshots: CodeSnapshot[] = [];
  private outputPath: string = '';
  private gitInfo: GitInfo | null = null;

  /**
   * Native Windows Recorder Module
   * Uses React Native Windows native modules for real screen/audio capture
   */
  private get nativeRecorder(): any {
    return nativeService.isAvailable() ? nativeService.getModule() : {
      initialize: (config: any) => {
        console.log('📦 Using mock native recorder. Implement HappyRecorderNative in Windows C++');
        return Promise.resolve({ success: true });
      },
      startRecording: () => Promise.resolve({ success: true }),
      stopRecording: () => Promise.resolve({ success: true, fileSize: 1024 * 1024 }),
      pauseRecording: () => Promise.resolve({ success: true }),
      resumeRecording: () => Promise.resolve({ success: true }),
      getStatus: () => Promise.resolve({ duration: 0, fileSize: 0 }),
    };
  }

  /**
   * Initialize a new recording session
   */
  async initialize(config: RecordingConfig): Promise<void> {
    try {
      this.config = config;
      this.status.state = 'initializing';

      // Get Git info for code snapshots (project mode only -- needs a repo path)
      const repoPath = config.projectMetadata?.repoPath || this.inferRepoPath(config.projectMetadata?.files);
      this.gitInfo = await this.loadGitInfo(repoPath);

      // Generate recording ID
      this.recordingId = `rec_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

      // Set output path
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${timestamp}_${this.recordingId}.mp4`;
      this.outputPath = config.outputPath || 
        await storageService.getRecordingsPath() + '/' + filename;

      // Initialize native Windows recorder
      await this.nativeRecorder.initialize({
        outputPath: this.outputPath,
        quality: config.quality,
        fps: config.fps,
        captureScreen: true,
        captureCamera: config.camera,
        captureMicrophone: config.microphone,
        captureSystemAudio: config.systemAudio,
        screenBounds: config.screen.regionBounds,
        // Windows-specific options
        useHardwareEncoding: true,
        useGPUAcceleration: true,
        audioBitrate: 128000,
        videoBitrate: 2000000,
      });

      // Initialize camera if enabled
      if (config.camera) {
        await cameraCapture.initialize({
          position: 'bottom-right',
          size: { width: 240, height: 180 },
          shape: 'rounded',
          border: true,
        });
        await cameraCapture.start();
      }

      // Initialize audio if enabled
      if (config.microphone) {
        await audioCapture.initializeMicrophone({
          device: 'default',
          volume: 80,
          noiseReduction: true,
          echoCancellation: true,
        });
        await audioCapture.startMicrophone();
      }

      if (config.systemAudio) {
        await audioCapture.initializeSystemAudio({
          device: 'default',
          volume: 100,
        });
        await audioCapture.startSystemAudio();
      }

      this.status.state = 'idle';
      console.log('🎬 Recorder initialized:', {
        id: this.recordingId,
        mode: config.mode,
        output: this.outputPath,
        git: this.gitInfo ? `${this.gitInfo.branch} (${this.gitInfo.commit})` : 'No git repo',
      });
    } catch (error) {
      this.status.state = 'error';
      this.status.error = error instanceof Error ? error.message : 'Initialization failed';
      throw error;
    }
  }

  /**
   * Start recording
   */
  async start(): Promise<void> {
    try {
      if (this.status.state === 'recording') {
        console.warn('⚠️ Already recording');
        return;
      }

      this.status.state = 'recording';
      this.startTime = Date.now();

      // Start native Windows recording
      await this.nativeRecorder.startRecording();

      // Start timer
      this.timerInterval = setInterval(() => {
        this.status.duration = (Date.now() - this.startTime) / 1000;
      }, 100);

      console.log('▶️ Recording started:', this.recordingId);
    } catch (error) {
      this.status.state = 'error';
      this.status.error = error instanceof Error ? error.message : 'Start failed';
      throw error;
    }
  }

  /**
   * Pause recording
   */
  async pause(): Promise<void> {
    try {
      if (this.status.state !== 'recording') {
        console.warn('⚠️ Not recording');
        return;
      }

      this.status.state = 'paused';
      await this.nativeRecorder.pauseRecording();

      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }

      console.log('⏸️ Recording paused:', this.recordingId);
    } catch (error) {
      this.status.state = 'error';
      this.status.error = error instanceof Error ? error.message : 'Pause failed';
      throw error;
    }
  }

  /**
   * Resume recording
   */
  async resume(): Promise<void> {
    try {
      if (this.status.state !== 'paused') {
        console.warn('⚠️ Not paused');
        return;
      }

      this.status.state = 'recording';
      await this.nativeRecorder.resumeRecording();

      // Restart timer
      this.timerInterval = setInterval(() => {
        this.status.duration = (Date.now() - this.startTime) / 1000;
      }, 100);

      console.log('▶️ Recording resumed:', this.recordingId);
    } catch (error) {
      this.status.state = 'error';
      this.status.error = error instanceof Error ? error.message : 'Resume failed';
      throw error;
    }
  }

  /**
   * Stop recording
   */
  async stop(): Promise<RecordingMetadata> {
    try {
      if (this.status.state === 'idle') {
        console.warn('⚠️ Not recording');
        throw new Error('Not recording');
      }

      this.status.state = 'processing';

      // Stop native Windows recording
      const result = await this.nativeRecorder.stopRecording();

      // Stop timer
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }

      // Get final status
      this.status.duration = (Date.now() - this.startTime) / 1000;
      this.status.fileSize = result.fileSize || 0;
      this.status.state = 'completed';

      // Create metadata with Git info
      const metadata: RecordingMetadata = {
        id: this.recordingId!,
        title: this.generateTitle(),
        timestamp: new Date(),
        duration: this.status.duration,
        fileSize: this.status.fileSize,
        filePath: this.outputPath,
        mode: this.config!.mode,
        config: this.config!,
        snapshots: this.snapshots,
        gitInfo: this.gitInfo || undefined,
      };

      // Save metadata
      await storageService.saveRecordingMetadata(metadata);

      // Cleanup resources
      await this.cleanup();

      console.log('⏹️ Recording stopped:', this.recordingId);
      return metadata;
    } catch (error) {
      this.status.state = 'error';
      this.status.error = error instanceof Error ? error.message : 'Stop failed';
      throw error;
    }
  }

  /**
   * Take a code snapshot during recording with Git context
   */
  async takeCodeSnapshot(filePath: string, lineStart?: number, lineEnd?: number): Promise<CodeSnapshot> {
    try {
      // Read file content
      const content = await filesService.readFile(filePath);
      const lines = content.split('\n');
      
      // Extract code
      let code: string;
      if (lineStart !== undefined && lineEnd !== undefined) {
        code = lines.slice(lineStart - 1, lineEnd).join('\n');
      } else {
        code = content;
      }

      const snapshot: CodeSnapshot = {
        id: `snap_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        timestamp: this.status.duration,
        filePath: filePath,
        fileName: filePath.split('/').pop() || filePath,
        code: code,
        language: this.detectLanguage(filePath),
        lineStart,
        lineEnd,
        note: '',
      };

      this.snapshots.push(snapshot);

      // Store snapshot with Git context
      await storageService.saveCodeSnapshot(this.recordingId!, snapshot, this.gitInfo);

      console.log('📸 Code snapshot taken:', snapshot.fileName, 'at', snapshot.timestamp);
      return snapshot;
    } catch (error) {
      console.error('Failed to take code snapshot:', error);
      throw error;
    }
  }

  /**
   * Add a note to a snapshot
   */
  async addSnapshotNote(snapshotId: string, note: string): Promise<void> {
    const snapshot = this.snapshots.find(s => s.id === snapshotId);
    if (snapshot) {
      snapshot.note = note;
      await storageService.updateCodeSnapshot(this.recordingId!, snapshot);
    }
  }

  /**
   * Get current recording status
   */
  getStatus(): RecordingStatus {
    return { ...this.status };
  }

  /**
   * Get all snapshots
   */
  getSnapshots(): CodeSnapshot[] {
    return [...this.snapshots];
  }

  /**
   * Get Git information for the current project.
   *
   * This calls the native module's getGitCommit/getGitBranch, not the
   * `simple-git` npm package: simple-git shells out via Node's
   * `child_process`, which doesn't exist in the React Native JS engine, and
   * its compiled output isn't even Metro-bundleable (it uses static class
   * blocks Metro's Babel preset can't parse). Only native code can safely
   * read git state, so that's where this belongs.
   */
  private async loadGitInfo(repoPath?: string): Promise<GitInfo | null> {
    if (!repoPath) {
      console.log('ℹ️ No project repo path available, skipping Git info');
      return null;
    }

    if (!nativeService.isAvailable()) {
      return null;
    }

    try {
      const native = nativeService.getModule();
      const [commit, branch] = await Promise.all([
        native.getGitCommit(repoPath),
        native.getGitBranch(repoPath),
      ]);

      if (!commit || !branch) {
        console.log('ℹ️ Not a git repository:', repoPath);
        return null;
      }

      return { commit, branch };
    } catch (error) {
      console.warn('⚠️ Git information not available:', error);
      return null;
    }
  }

  /**
   * Best-effort guess at a project's repo root from one of its tracked
   * file paths, used when the caller doesn't pass an explicit repoPath.
   */
  private inferRepoPath(files?: string[]): string | undefined {
    const first = files?.[0];
    if (!first) return undefined;
    const separator = first.includes('\\') ? '\\' : '/';
    const idx = first.lastIndexOf(separator);
    return idx > 0 ? first.substring(0, idx) : undefined;
  }

  /**
   * Detect programming language from file extension
   */
  private detectLanguage(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase() || '';
    const languageMap: Record<string, string> = {
      'ts': 'typescript',
      'tsx': 'typescript',
      'js': 'javascript',
      'jsx': 'javascript',
      'py': 'python',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'c': 'c',
      'cpp': 'cpp',
      'cs': 'csharp',
      'java': 'java',
      'kt': 'kotlin',
      'swift': 'swift',
      'php': 'php',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'json': 'json',
      'xml': 'xml',
      'yaml': 'yaml',
      'toml': 'toml',
      'md': 'markdown',
      'sql': 'sql',
    };
    return languageMap[ext] || 'text';
  }

  /**
   * Generate a title for the recording
   */
  private generateTitle(): string {
    const config = this.config!;
    const date = new Date().toLocaleString();
    
    switch (config.mode) {
      case 'project':
        return `Project: ${config.projectMetadata?.name || 'Untitled'} (${date})`;
      case 'tutorial':
        return `Tutorial (${date})`;
      case 'bug':
        return `Bug Report: ${config.bugMetadata?.title || 'Untitled'} (${date})`;
      default:
        return `Recording (${date})`;
    }
  }

  /**
   * Cleanup resources
   */
  private async cleanup(): Promise<void> {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    await cameraCapture.cleanup();
    await audioCapture.cleanup();
  }

  /**
   * Cancel recording (cleanup without saving)
   */
  async cancel(): Promise<void> {
    try {
      await this.nativeRecorder.stopRecording();
      await this.cleanup();
      
      // Delete incomplete file
      if (this.outputPath) {
        await filesService.deleteFile(this.outputPath);
      }

      this.status.state = 'idle';
      this.snapshots = [];
      
      console.log('❌ Recording cancelled:', this.recordingId);
    } catch (error) {
      console.error('Failed to cancel recording:', error);
    }
  }

  /**
   * Export snapshot data with Git info
   */
  async exportSnapshots(): Promise<SnapshotData> {
    return {
      projectName: this.config?.projectMetadata?.name,
      gitCommit: this.gitInfo?.commit,
      branch: this.gitInfo?.branch,
      files: this.snapshots,
    };
  }

  /**
   * Get current Git info
   */
  getGitInfo(): GitInfo | null {
    return this.gitInfo;
  }
}

// Export singleton instance
export const recorder = new Recorder();
export default recorder;