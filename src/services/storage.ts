import * as RNFS from 'react-native-fs';
import { Platform } from 'react-native';

export interface StorageConfig {
  appName: string;
  recordingsPath: string;
  projectsPath: string;
  exportsPath: string;
  snapshotsPath: string;
  cachePath: string;
  maxStorageSize?: number; // in bytes
}

export interface RecordingMetadata {
  id: string;
  title: string;
  timestamp: Date;
  duration: number;
  fileSize: number;
  filePath: string;
  mode: 'normal' | 'tutorial' | 'project' | 'bug';
  config: any;
  snapshots?: CodeSnapshot[];
  gitInfo?: any;
  thumbnail?: string;
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

export interface ProjectMetadata {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  filePath: string;
  thumbnail?: string;
}

class StorageService {
  private config: StorageConfig = {
    appName: 'HappyRecorder3D',
    recordingsPath: '',
    projectsPath: '',
    exportsPath: '',
    snapshotsPath: '',
    cachePath: '',
    maxStorageSize: 10 * 1024 * 1024 * 1024, // 10GB default
  };

  private isInitialized: boolean = false;

  /**
   * Initialize storage service
   */
  async initialize(config?: Partial<StorageConfig>): Promise<void> {
    try {
      if (this.isInitialized) {
        console.warn('Storage service already initialized');
        return;
      }

      // Merge config
      if (config) {
        this.config = { ...this.config, ...config };
      }

      // Get base directories
      const basePath = Platform.OS === 'windows'
        ? RNFS.DocumentDirectoryPath || RNFS.ExternalDirectoryPath || ''
        : RNFS.DocumentDirectoryPath || '';

      // Setup paths
      this.config.recordingsPath = `${basePath}/${this.config.appName}/Recordings`;
      this.config.projectsPath = `${basePath}/${this.config.appName}/Projects`;
      this.config.exportsPath = `${basePath}/${this.config.appName}/Exports`;
      this.config.snapshotsPath = `${basePath}/${this.config.appName}/Snapshots`;
      this.config.cachePath = `${basePath}/${this.config.appName}/Cache`;

      // Create directories
      const paths = [
        this.config.recordingsPath,
        this.config.projectsPath,
        this.config.exportsPath,
        this.config.snapshotsPath,
        this.config.cachePath,
      ];

      for (const path of paths) {
        const exists = await RNFS.exists(path);
        if (!exists) {
          await RNFS.mkdir(path);
          console.log(`📁 Created directory: ${path}`);
        }
      }

      // Check storage
      await this.checkStorage();

      this.isInitialized = true;
      console.log('💾 Storage service initialized');
    } catch (error) {
      console.error('Failed to initialize storage:', error);
      throw error;
    }
  }

  /**
   * Check available storage
   */
  async checkStorage(): Promise<{ free: number; total: number; used: number }> {
    try {
      const stats = await RNFS.getFSInfo();
      const free = stats.freeSpace || 0;
      const total = stats.totalSpace || 0;
      const used = total - free;

      console.log(`💾 Storage: ${(used / 1024 / 1024 / 1024).toFixed(2)}GB used, ${(free / 1024 / 1024 / 1024).toFixed(2)}GB free`);
      
      // Check if storage is low
      if (free < 100 * 1024 * 1024) { // Less than 100MB
        console.warn('⚠️ Low storage space!');
      }

      return { free, total, used };
    } catch (error) {
      console.error('Failed to check storage:', error);
      return { free: 0, total: 0, used: 0 };
    }
  }

  /**
   * Get recordings path
   */
  getRecordingsPath(): string {
    return this.config.recordingsPath;
  }

  /**
   * Get projects path
   */
  getProjectsPath(): string {
    return this.config.projectsPath;
  }

  /**
   * Get exports path
   */
  getExportsPath(): string {
    return this.config.exportsPath;
  }

  /**
   * Get snapshots path
   */
  getSnapshotsPath(): string {
    return this.config.snapshotsPath;
  }

  /**
   * Save recording metadata
   */
  async saveRecordingMetadata(metadata: RecordingMetadata): Promise<void> {
    try {
      const filePath = `${this.config.recordingsPath}/${metadata.id}.json`;
      const data = JSON.stringify(metadata, null, 2);
      await RNFS.writeFile(filePath, data, 'utf8');
      console.log(`💾 Recording metadata saved: ${metadata.id}`);
    } catch (error) {
      console.error('Failed to save recording metadata:', error);
      throw error;
    }
  }

  /**
   * Load recording metadata
   */
  async loadRecordingMetadata(id: string): Promise<RecordingMetadata | null> {
    try {
      const filePath = `${this.config.recordingsPath}/${id}.json`;
      const exists = await RNFS.exists(filePath);
      if (!exists) return null;

      const data = await RNFS.readFile(filePath, 'utf8');
      const metadata = JSON.parse(data);
      
      // Convert timestamp back to Date
      if (metadata.timestamp) {
        metadata.timestamp = new Date(metadata.timestamp);
      }

      return metadata;
    } catch (error) {
      console.error('Failed to load recording metadata:', error);
      return null;
    }
  }

  /**
   * Get all recordings
   */
  async getAllRecordings(): Promise<RecordingMetadata[]> {
    try {
      const files = await RNFS.readDir(this.config.recordingsPath);
      const recordings: RecordingMetadata[] = [];

      for (const file of files) {
        if (file.isFile() && file.name.endsWith('.json')) {
          const metadata = await this.loadRecordingMetadata(file.name.replace('.json', ''));
          if (metadata) {
            recordings.push(metadata);
          }
        }
      }

      // Sort by timestamp (newest first)
      recordings.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      return recordings;
    } catch (error) {
      console.error('Failed to get all recordings:', error);
      return [];
    }
  }

  /**
   * Delete recording
   */
  async deleteRecording(id: string): Promise<void> {
    try {
      // Delete metadata
      const metaPath = `${this.config.recordingsPath}/${id}.json`;
      if (await RNFS.exists(metaPath)) {
        await RNFS.unlink(metaPath);
      }

      // Delete video file
      const metadata = await this.loadRecordingMetadata(id);
      if (metadata && metadata.filePath) {
        if (await RNFS.exists(metadata.filePath)) {
          await RNFS.unlink(metadata.filePath);
        }
      }

      // Delete snapshots
      const snapshotsPath = `${this.config.snapshotsPath}/${id}`;
      if (await RNFS.exists(snapshotsPath)) {
        await RNFS.unlink(snapshotsPath);
      }

      console.log(`🗑️ Recording deleted: ${id}`);
    } catch (error) {
      console.error('Failed to delete recording:', error);
      throw error;
    }
  }

  /**
   * Save code snapshot
   */
  async saveCodeSnapshot(recordingId: string, snapshot: CodeSnapshot, gitInfo?: any): Promise<void> {
    try {
      const dirPath = `${this.config.snapshotsPath}/${recordingId}`;
      const exists = await RNFS.exists(dirPath);
      if (!exists) {
        await RNFS.mkdir(dirPath);
      }

      const filePath = `${dirPath}/${snapshot.id}.json`;
      const data = JSON.stringify({
        ...snapshot,
        gitInfo,
      }, null, 2);
      await RNFS.writeFile(filePath, data, 'utf8');
      console.log(`📸 Code snapshot saved: ${snapshot.id}`);
    } catch (error) {
      console.error('Failed to save code snapshot:', error);
      throw error;
    }
  }

  /**
   * Load code snapshots for a recording
   */
  async loadCodeSnapshots(recordingId: string): Promise<CodeSnapshot[]> {
    try {
      const dirPath = `${this.config.snapshotsPath}/${recordingId}`;
      const exists = await RNFS.exists(dirPath);
      if (!exists) return [];

      const files = await RNFS.readDir(dirPath);
      const snapshots: CodeSnapshot[] = [];

      for (const file of files) {
        if (file.isFile() && file.name.endsWith('.json')) {
          const data = await RNFS.readFile(file.path, 'utf8');
          const snapshot = JSON.parse(data);
          snapshots.push(snapshot);
        }
      }

      // Sort by timestamp
      snapshots.sort((a, b) => a.timestamp - b.timestamp);
      return snapshots;
    } catch (error) {
      console.error('Failed to load code snapshots:', error);
      return [];
    }
  }

  /**
   * Update code snapshot
   */
  async updateCodeSnapshot(recordingId: string, snapshot: CodeSnapshot): Promise<void> {
    try {
      const filePath = `${this.config.snapshotsPath}/${recordingId}/${snapshot.id}.json`;
      const data = JSON.stringify(snapshot, null, 2);
      await RNFS.writeFile(filePath, data, 'utf8');
      console.log(`📸 Code snapshot updated: ${snapshot.id}`);
    } catch (error) {
      console.error('Failed to update code snapshot:', error);
      throw error;
    }
  }

  /**
   * Save project
   */
  async saveProject(project: any): Promise<void> {
    try {
      const filePath = `${this.config.projectsPath}/${project.id}.json`;
      const data = JSON.stringify(project, null, 2);
      await RNFS.writeFile(filePath, data, 'utf8');
      console.log(`💾 Project saved: ${project.id}`);
    } catch (error) {
      console.error('Failed to save project:', error);
      throw error;
    }
  }

  /**
   * Load project
   */
  async loadProject(id: string): Promise<any | null> {
    try {
      const filePath = `${this.config.projectsPath}/${id}.json`;
      const exists = await RNFS.exists(filePath);
      if (!exists) return null;

      const data = await RNFS.readFile(filePath, 'utf8');
      const project = JSON.parse(data);
      
      // Convert dates
      if (project.createdAt) {
        project.createdAt = new Date(project.createdAt);
      }
      if (project.updatedAt) {
        project.updatedAt = new Date(project.updatedAt);
      }

      return project;
    } catch (error) {
      console.error('Failed to load project:', error);
      return null;
    }
  }

  /**
   * Get all projects
   */
  async getProjects(): Promise<any[]> {
    try {
      const files = await RNFS.readDir(this.config.projectsPath);
      const projects: any[] = [];

      for (const file of files) {
        if (file.isFile() && file.name.endsWith('.json')) {
          const project = await this.loadProject(file.name.replace('.json', ''));
          if (project) {
            projects.push(project);
          }
        }
      }

      // Sort by updated date (newest first)
      projects.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      return projects;
    } catch (error) {
      console.error('Failed to get projects:', error);
      return [];
    }
  }

  /**
   * Delete project
   */
  async deleteProject(id: string): Promise<void> {
    try {
      const filePath = `${this.config.projectsPath}/${id}.json`;
      if (await RNFS.exists(filePath)) {
        await RNFS.unlink(filePath);
      }
      console.log(`🗑️ Project deleted: ${id}`);
    } catch (error) {
      console.error('Failed to delete project:', error);
      throw error;
    }
  }

  /**
   * Clear cache
   */
  async clearCache(): Promise<void> {
    try {
      const files = await RNFS.readDir(this.config.cachePath);
      for (const file of files) {
        await RNFS.unlink(file.path);
      }
      console.log('🧹 Cache cleared');
    } catch (error) {
      console.error('Failed to clear cache:', error);
      throw error;
    }
  }

  /**
   * Get storage usage
   */
  async getStorageUsage(): Promise<{
    recordings: number;
    projects: number;
    snapshots: number;
    exports: number;
    cache: number;
    total: number;
  }> {
    try {
      const usage = {
        recordings: 0,
        projects: 0,
        snapshots: 0,
        exports: 0,
        cache: 0,
        total: 0,
      };

      // Get sizes for each directory
      const dirs = [
        { path: this.config.recordingsPath, key: 'recordings' as const },
        { path: this.config.projectsPath, key: 'projects' as const },
        { path: this.config.snapshotsPath, key: 'snapshots' as const },
        { path: this.config.exportsPath, key: 'exports' as const },
        { path: this.config.cachePath, key: 'cache' as const },
      ];

      for (const dir of dirs) {
        if (await RNFS.exists(dir.path)) {
          const size = await this.getDirectorySize(dir.path);
          usage[dir.key] = size;
          usage.total += size;
        }
      }

      return usage;
    } catch (error) {
      console.error('Failed to get storage usage:', error);
      return {
        recordings: 0,
        projects: 0,
        snapshots: 0,
        exports: 0,
        cache: 0,
        total: 0,
      };
    }
  }

  /**
   * Get directory size
   */
  private async getDirectorySize(path: string): Promise<number> {
    try {
      const files = await RNFS.readDir(path);
      let totalSize = 0;

      for (const file of files) {
        if (file.isFile()) {
          totalSize += file.size || 0;
        } else if (file.isDirectory()) {
          totalSize += await this.getDirectorySize(file.path);
        }
      }

      return totalSize;
    } catch (error) {
      console.error('Failed to get directory size:', error);
      return 0;
    }
  }

  /**
   * Move file
   */
  async moveFile(from: string, to: string): Promise<void> {
    try {
      await RNFS.moveFile(from, to);
      console.log(`📁 File moved: ${from} → ${to}`);
    } catch (error) {
      console.error('Failed to move file:', error);
      throw error;
    }
  }

  /**
   * Copy file
   */
  async copyFile(from: string, to: string): Promise<void> {
    try {
      await RNFS.copyFile(from, to);
      console.log(`📁 File copied: ${from} → ${to}`);
    } catch (error) {
      console.error('Failed to copy file:', error);
      throw error;
    }
  }

  /**
   * Generate unique filename
   */
  generateUniqueFilename(prefix: string, extension: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const random = Math.random().toString(36).substr(2, 6);
    return `${prefix}_${timestamp}_${random}.${extension}`;
  }

  /**
   * Check if file exists
   */
  async fileExists(path: string): Promise<boolean> {
    try {
      return await RNFS.exists(path);
    } catch (error) {
      console.error('Failed to check file existence:', error);
      return false;
    }
  }

  /**
   * Get file size
   */
  async getFileSize(path: string): Promise<number> {
    try {
      const stats = await RNFS.stat(path);
      return stats.size || 0;
    } catch (error) {
      console.error('Failed to get file size:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const storageService = new StorageService();
export default storageService;