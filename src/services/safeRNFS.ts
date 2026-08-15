import { NativeModules } from 'react-native';

/**
 * Safe wrapper around react-native-fs.
 *
 * ROOT CAUSE of "app shows no content at launch" (Microsoft Store
 * certification failure, 10.1.2.10):
 *
 * react-native-fs ships a Windows native module written in C#
 * (windows/RNFS/RNFSManager.cs), which only works with the C#-flavored
 * React Native Windows project template. This project uses the C++/WinRT
 * template (HappyRecorder3D.vcxproj), so that C# module is never linked —
 * confirmed empty at windows/HappyRecorder3D/AutolinkedNativeModules.g.cpp.
 * NativeModules.RNFSManager is therefore undefined at runtime.
 *
 * react-native-fs's own top-level module code
 * (node_modules/react-native-fs/FS.common.js) does this unconditionally,
 * the moment the package is imported anywhere:
 *
 *   var RNFSFileTypeRegular = RNFSManager.RNFSFileTypeRegular;
 *
 * Reading a property off `undefined` throws synchronously — DURING
 * MODULE EVALUATION, before React ever renders. In Release builds,
 * App.cpp sets UseDeveloperSupport(false), which disables the JS error
 * overlay, so this crash produces exactly the reported symptom: a blank
 * window and no error message, 100% reproducible on every Windows launch.
 *
 * This module isolates that risk: it tries to require react-native-fs,
 * and if that throws, falls back to a stub whose methods reject cleanly.
 * Every call site in this codebase already wraps its RNFS calls in
 * try/catch with sensible fallbacks (return false/0/[]/etc.), so a
 * rejected promise here degrades gracefully — file persistence quietly
 * doesn't work, instead of the whole app crashing at launch.
 *
 * TODO: replace with a real native Windows storage implementation (e.g.
 * a small C++/WinRT native module wrapping Windows.Storage, or a
 * Windows-compatible community fork) so persistence actually works on
 * Windows rather than silently no-op'ing.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let RNFSModule: any;
let isAvailable = true;

try {
  if (!NativeModules.RNFSManager) {
    throw new Error('NativeModules.RNFSManager is not linked on this platform');
  }
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  RNFSModule = require('react-native-fs');
  if (!RNFSModule || typeof RNFSModule.exists !== 'function') {
    throw new Error('react-native-fs loaded but is missing expected methods');
  }
} catch (error) {
  console.warn(
    '⚠️ react-native-fs is unavailable on this platform — file persistence ' +
      'will be disabled until a native implementation is added.',
    error
  );
  isAvailable = false;

  const unavailable = (name: string) => async (): Promise<never> => {
    throw new Error(`react-native-fs is unavailable on this platform (called ${name})`);
  };

  RNFSModule = {
    DocumentDirectoryPath: '',
    ExternalDirectoryPath: '',
    CachesDirectoryPath: '',
    exists: async () => false,
    mkdir: unavailable('mkdir'),
    writeFile: unavailable('writeFile'),
    readFile: unavailable('readFile'),
    unlink: unavailable('unlink'),
    readDir: async () => [],
    stat: unavailable('stat'),
    copyFile: unavailable('copyFile'),
    moveFile: unavailable('moveFile'),
    getFSInfo: async () => ({ totalSpace: 0, freeSpace: 0 }),
  };
}

export const RNFSAvailable = isAvailable;
export default RNFSModule;