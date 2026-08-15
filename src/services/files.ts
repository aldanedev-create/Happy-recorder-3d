import RNFS from './safeRNFS';
import type { StatResult } from 'react-native-fs';
import { Buffer } from 'buffer';

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

export interface FileContent {
  path: string;
  content: string | Buffer;
  encoding: 'utf8' | 'base64' | 'binary';
  size: number;
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

class FilesService {
  /**
   * Read file content
   */
  async readFile(path: string, encoding: 'utf8' | 'base64' = 'utf8'): Promise<string> {
    try {
      const content = await RNFS.readFile(path, encoding);
      return content;
    } catch (error) {
      console.error('Failed to read file:', error);
      throw error;
    }
  }

  /**
   * Write file content
   */
  async writeFile(path: string, content: string | Buffer, encoding: 'utf8' | 'base64' = 'utf8'): Promise<void> {
    try {
      // Ensure directory exists
      const dir = path.substring(0, path.lastIndexOf('/'));
      await this.ensureDirectory(dir);

      await RNFS.writeFile(path, Buffer.isBuffer(content) ? content.toString(encoding) : content, encoding);
      console.log(`📝 File written: ${path}`);
    } catch (error) {
      console.error('Failed to write file:', error);
      throw error;
    }
  }

  /**
   * Read file as buffer
   */
  async readFileAsBuffer(path: string): Promise<Buffer> {
    try {
      const base64 = await RNFS.readFile(path, 'base64');
      return Buffer.from(base64, 'base64');
    } catch (error) {
      console.error('Failed to read file as buffer:', error);
      throw error;
    }
  }

  /**
   * Write file from buffer
   */
  async writeFileFromBuffer(path: string, buffer: Buffer): Promise<void> {
    try {
      const base64 = buffer.toString('base64');
      await this.writeFile(path, base64, 'base64');
    } catch (error) {
      console.error('Failed to write file from buffer:', error);
      throw error;
    }
  }

  /**
   * Ensure directory exists
   */
  async ensureDirectory(path: string): Promise<void> {
    try {
      const exists = await RNFS.exists(path);
      if (!exists) {
        await RNFS.mkdir(path);
        console.log(`📁 Directory created: ${path}`);
      }
    } catch (error) {
      console.error('Failed to ensure directory:', error);
      throw error;
    }
  }

  /**
   * Delete file
   */
  async deleteFile(path: string): Promise<void> {
    try {
      const exists = await RNFS.exists(path);
      if (exists) {
        await RNFS.unlink(path);
        console.log(`🗑️ File deleted: ${path}`);
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
      throw error;
    }
  }

  /**
   * Delete directory
   */
  async deleteDirectory(path: string): Promise<void> {
    try {
      const exists = await RNFS.exists(path);
      if (exists) {
        await RNFS.unlink(path);
        console.log(`🗑️ Directory deleted: ${path}`);
      }
    } catch (error) {
      console.error('Failed to delete directory:', error);
      throw error;
    }
  }

  /**
   * Get file info
   */
  async getFileInfo(path: string): Promise<FileInfo | null> {
    try {
      const exists = await RNFS.exists(path);
      if (!exists) return null;

      const stats = await RNFS.stat(path);
      const name = path.split('/').pop() || '';
      const extension = name.includes('.') ? name.split('.').pop() : undefined;

      return {
        name: name,
        path: path,
        size: stats.size || 0,
        isDirectory: stats.isDirectory(),
        isFile: stats.isFile(),
        modifiedAt: stats.mtime ? new Date(stats.mtime) : new Date(),
        createdAt: stats.ctime ? new Date(stats.ctime) : new Date(),
        extension: extension,
      };
    } catch (error) {
      console.error('Failed to get file info:', error);
      return null;
    }
  }

  /**
   * List files in directory
   */
  async listFiles(directory: string, filter?: (file: FileInfo) => boolean): Promise<FileInfo[]> {
    try {
      const exists = await RNFS.exists(directory);
      if (!exists) return [];

      const items = await RNFS.readDir(directory);
      const files: FileInfo[] = [];

      for (const item of items) {
        const fileInfo: FileInfo = {
          name: item.name,
          path: item.path,
          size: item.size || 0,
          isDirectory: item.isDirectory(),
          isFile: item.isFile(),
          modifiedAt: item.mtime ? new Date(item.mtime) : new Date(),
          createdAt: item.ctime ? new Date(item.ctime) : new Date(),
          extension: item.name.includes('.') ? item.name.split('.').pop() : undefined,
        };

        if (!filter || filter(fileInfo)) {
          files.push(fileInfo);
        }
      }

      // Sort by name
      files.sort((a, b) => a.name.localeCompare(b.name));
      return files;
    } catch (error) {
      console.error('Failed to list files:', error);
      return [];
    }
  }

  /**
   * List files recursively
   */
  async listFilesRecursive(directory: string, filter?: (file: FileInfo) => boolean): Promise<FileInfo[]> {
    try {
      const files: FileInfo[] = [];
      const items = await this.listFiles(directory);

      for (const item of items) {
        if (item.isDirectory) {
          const subFiles = await this.listFilesRecursive(item.path, filter);
          files.push(...subFiles);
        } else {
          if (!filter || filter(item)) {
            files.push(item);
          }
        }
      }

      return files;
    } catch (error) {
      console.error('Failed to list files recursively:', error);
      return [];
    }
  }

  /**
   * Copy file
   */
  async copyFile(source: string, destination: string): Promise<void> {
    try {
      // Ensure destination directory exists
      const destDir = destination.substring(0, destination.lastIndexOf('/'));
      await this.ensureDirectory(destDir);

      await RNFS.copyFile(source, destination);
      console.log(`📁 File copied: ${source} → ${destination}`);
    } catch (error) {
      console.error('Failed to copy file:', error);
      throw error;
    }
  }

  /**
   * Move file
   */
  async moveFile(source: string, destination: string): Promise<void> {
    try {
      // Ensure destination directory exists
      const destDir = destination.substring(0, destination.lastIndexOf('/'));
      await this.ensureDirectory(destDir);

      await RNFS.moveFile(source, destination);
      console.log(`📁 File moved: ${source} → ${destination}`);
    } catch (error) {
      console.error('Failed to move file:', error);
      throw error;
    }
  }

  /**
   * Get file extension
   */
  getFileExtension(filePath: string): string {
    const name = filePath.split('/').pop() || '';
    return name.includes('.') ? name.split('.').pop()?.toLowerCase() || '' : '';
  }

  /**
   * Get file name without extension
   */
  getFileNameWithoutExtension(filePath: string): string {
    const name = filePath.split('/').pop() || '';
    return name.includes('.') ? name.substring(0, name.lastIndexOf('.')) : name;
  }

  /**
   * Check if file is a video
   */
  isVideoFile(filePath: string): boolean {
    const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv', 'm4v'];
    const ext = this.getFileExtension(filePath);
    return videoExtensions.includes(ext);
  }

  /**
   * Check if file is an audio file
   */
  isAudioFile(filePath: string): boolean {
    const audioExtensions = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma'];
    const ext = this.getFileExtension(filePath);
    return audioExtensions.includes(ext);
  }

  /**
   * Check if file is an image
   */
  isImageFile(filePath: string): boolean {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    const ext = this.getFileExtension(filePath);
    return imageExtensions.includes(ext);
  }

  /**
   * Get media info (uses native module)
   */
  async getMediaInfo(filePath: string): Promise<MediaInfo | null> {
    try {
      // @ts-ignore - Native module
      const info = await NativeModules.HappyRecorderNative.getMediaInfo(filePath);
      return {
        path: filePath,
        duration: info.duration || 0,
        width: info.width,
        height: info.height,
        fps: info.fps,
        codec: info.codec,
        bitrate: info.bitrate,
        format: info.format,
        hasVideo: info.hasVideo || false,
        hasAudio: info.hasAudio || false,
      };
    } catch (error) {
      console.error('Failed to get media info:', error);
      return null;
    }
  }

  /**
   * Get thumbnail for video
   */
  async getVideoThumbnail(filePath: string, time: number = 0): Promise<string | null> {
    try {
      // @ts-ignore - Native module
      const thumbnailPath = await NativeModules.HappyRecorderNative.getVideoThumbnail(filePath, time);
      return thumbnailPath;
    } catch (error) {
      console.error('Failed to get video thumbnail:', error);
      return null;
    }
  }

  /**
   * Read file as base64
   */
  async readFileAsBase64(filePath: string): Promise<string | null> {
    try {
      return await RNFS.readFile(filePath, 'base64');
    } catch (error) {
      console.error('Failed to read file as base64:', error);
      return null;
    }
  }

  /**
   * Write base64 as file
   */
  async writeBase64ToFile(base64: string, filePath: string): Promise<void> {
    try {
      const dir = filePath.substring(0, filePath.lastIndexOf('/'));
      await this.ensureDirectory(dir);
      await RNFS.writeFile(filePath, base64, 'base64');
      console.log(`📝 File written from base64: ${filePath}`);
    } catch (error) {
      console.error('Failed to write base64 to file:', error);
      throw error;
    }
  }

  /**
   * Get file stats
   */
  async getFileStats(filePath: string): Promise<StatResult | null> {
    try {
      const exists = await RNFS.exists(filePath);
      if (!exists) return null;
      return await RNFS.stat(filePath);
    } catch (error) {
      console.error('Failed to get file stats:', error);
      return null;
    }
  }

  /**
   * Get available disk space
   */
  async getDiskSpace(): Promise<{ free: number; total: number }> {
    try {
      const info = await RNFS.getFSInfo();
      return {
        free: info.freeSpace || 0,
        total: info.totalSpace || 0,
      };
    } catch (error) {
      console.error('Failed to get disk space:', error);
      return { free: 0, total: 0 };
    }
  }

  /**
   * Check if file is accessible
   */
  async isFileAccessible(filePath: string): Promise<boolean> {
    try {
      const exists = await RNFS.exists(filePath);
      if (!exists) return false;
      const stats = await RNFS.stat(filePath);
      return stats.isFile();
    } catch (error) {
      console.error('Failed to check file accessibility:', error);
      return false;
    }
  }

  /**
   * Get temporary file path
   */
  getTempFilePath(extension: string = 'tmp'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 6);
    return `${RNFS.CachesDirectoryPath}/temp_${timestamp}_${random}.${extension}`;
  }

  /**
   * Clean temp files
   */
  async cleanTempFiles(maxAge: number = 24 * 60 * 60 * 1000): Promise<void> {
    try {
      const files = await RNFS.readDir(RNFS.CachesDirectoryPath);
      const now = Date.now();

      for (const file of files) {
        if (file.name.startsWith('temp_')) {
          const age = now - (file.mtime ? new Date(file.mtime).getTime() : now);
          if (age > maxAge) {
            await RNFS.unlink(file.path);
            console.log(`🧹 Cleaned temp file: ${file.name}`);
          }
        }
      }
    } catch (error) {
      console.error('Failed to clean temp files:', error);
    }
  }

  /**
   * Get file hash (simple hash for comparison)
   */
  async getFileHash(filePath: string): Promise<string | null> {
    try {
      const content = await this.readFile(filePath);
      let hash = 0;
      for (let i = 0; i < content.length; i++) {
        const char = content.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash).toString(16);
    } catch (error) {
      console.error('Failed to get file hash:', error);
      return null;
    }
  }

  async fileExists(filePath: string): Promise<boolean> {
    return RNFS.exists(filePath);
  }
}

// Export singleton instance
export const filesService = new FilesService();
export default filesService;