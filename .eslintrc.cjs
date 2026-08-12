module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } },
  settings: { react: { version: 'detect' } },
  extends: ['@react-native-community', 'plugin:@typescript-eslint/recommended', 'plugin:react/recommended', 'plugin:react-hooks/recommended', 'prettier'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'warn',
    'prefer-const': 'error',
    'react-native/no-inline-styles': 'warn',
    'react-native/no-unused-styles': 'warn',
    'react-native/split-platform-components': 'warn'
    ,'prettier/prettier': 'off'
  },
  overrides: [{ files: ['*.test.ts', '*.test.tsx', '*.spec.ts', '*.spec.tsx'], rules: { '@typescript-eslint/no-explicit-any': 'off', 'no-console': 'off' } }],
  ignorePatterns: ['node_modules/', 'windows/', 'coverage/', 'dist/', 'build/']
};
