import React from 'react';
import { AppRegistry } from 'react-native';
import App from './src/App';
import ErrorBoundary from './src/components/ErrorBoundary';
import { storageService } from './src/services/storage';

// React's ErrorBoundary only catches errors thrown during render/lifecycle
// methods. Errors thrown from event handlers, timers, or unhandled promise
// rejections bypass it entirely and — in Release builds, where the native
// host disables UseDeveloperSupport — vanish silently. This global handler
// makes sure those get logged too instead of failing invisibly.
if (typeof ErrorUtils !== 'undefined') {
  const originalHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    void storageService.logCrash(error, { isFatal, source: 'globalHandler' });
    if (originalHandler) originalHandler(error, isFatal);
  });
}

const RootComponent = () => (
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

AppRegistry.registerComponent('HappyRecorder3D', () => RootComponent);