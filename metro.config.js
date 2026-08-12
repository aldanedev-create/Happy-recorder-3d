/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */
const fs = require('fs');
const path = require('path');
const exclusionList = require('metro-config/src/defaults/exclusionList');

const rnwPath = fs.realpathSync(
  path.resolve(require.resolve('react-native-windows/package.json'), '..'),
);

// [devMode
const rnwRootNodeModules = path.resolve(rnwPath, '..', 'node_modules');
const rnwPackages = path.resolve(rnwPath, '..', 'packages');
const watchFolders = [rnwPath, rnwRootNodeModules, rnwPackages].filter((folder) =>
  fs.existsSync(folder),
);
// devMode]

module.exports = {
  // [devMode
  watchFolders,
  // devMode]
  resolver: {
    blockList: exclusionList([
      // This stops "react-native run-windows" from causing the metro server to crash if its already running
      new RegExp(
        `${path.resolve(__dirname, 'windows').replace(/[/\\]/g, '/')}.*`,
      ),
      // This prevents "react-native run-windows" from hitting: EBUSY: resource busy or locked, open msbuild.ProjectImports.zip or other files produced by msbuild
      new RegExp(`${rnwPath}/build/.*`),
      new RegExp(`${rnwPath}/target/.*`),
      /.*\.ProjectImports\.zip/,
    ]),
    // [devMode
    extraNodeModules: {
      'react-native-windows': rnwPath,
    },
    // devMode]
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};
