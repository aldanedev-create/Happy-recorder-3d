module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: [
          '.windows.tsx',
          '.windows.ts',
          '.windows.jsx',
          '.windows.js',
          '.native.tsx',
          '.native.ts',
          '.native.js',
          '.tsx',
          '.ts',
          '.jsx',
          '.js',
          '.json',
        ],
        alias: {
          '@': './src',
          '@components': './src/components',
          '@screens': './src/screens',
          '@recording': './src/recording',
          '@editor': './src/editor',
          '@three': './src/three',
          '@services': './src/services',
          '@data': './src/data',
        },
      },
    ],
  ],
  env: {
    production: {
      plugins: ['transform-remove-console'],
    },
  },
};
