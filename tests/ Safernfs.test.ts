/**
 * Regression test for the react-native-fs crash that caused Microsoft
 * Store certification to fail with "the product does not display any
 * content at launch". See src/services/safeRNFS.ts for the full story.
 *
 * Unlike tests/app.test.tsx, this file deliberately does NOT mock
 * '../src/services/safeRNFS' or 'react-native-fs' — the whole point is
 * to exercise the real import chain and prove it can never crash the
 * app at module-load time again, on any platform, regardless of
 * whether a native RNFS module happens to be linked.
 */

describe('safeRNFS regression guard', () => {
  test('importing the wrapper never throws, even without a native module', () => {
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('../src/services/safeRNFS');
    }).not.toThrow();
  });

  test('exposes every method the app actually calls', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const RNFS = require('../src/services/safeRNFS').default;
    const requiredMethods = [
      'exists', 'mkdir', 'writeFile', 'readFile', 'unlink',
      'readDir', 'stat', 'copyFile', 'moveFile', 'getFSInfo',
    ];
    for (const method of requiredMethods) {
      expect(typeof RNFS[method]).toBe('function');
    }
  });

  test('calling a method never throws synchronously, even when unavailable', async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const RNFS = require('../src/services/safeRNFS').default;
    // Whether or not the native module is linked in this test
    // environment, calling exists() must resolve/reject as a promise —
    // never throw synchronously, which is what would crash the app.
    await expect(RNFS.exists('/some/path')).resolves.toBeDefined();
  });

  test('storage.ts, files.ts, and editor.ts no longer import react-native-fs directly', () => {
    const fs = require('fs');
    const path = require('path');
    const filesToCheck = [
      '../src/services/storage.ts',
      '../src/services/files.ts',
      '../src/editor/editor.ts',
    ];
    for (const relPath of filesToCheck) {
      const fullPath = path.join(__dirname, relPath);
      const content = fs.readFileSync(fullPath, 'utf8');
      // Runtime imports (import * as X / import X from '...') are the
      // dangerous pattern. `import type { ... }` is erased at compile
      // time and never executes react-native-fs's module code, so it's
      // explicitly allowed here (files.ts uses it for the StatResult type).
      const runtimeImportPattern = /^import\s+(?!type\s)[\s\S]*?from ['"]react-native-fs['"]/m;
      expect(content).not.toMatch(runtimeImportPattern);
    }
  });
});