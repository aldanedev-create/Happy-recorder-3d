import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Button from './Button';
import { storageService } from '../services/storage';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Wraps the app root. In Release builds, App.cpp sets
 * UseDeveloperSupport(false), which disables React Native's red error
 * screen — so an uncaught render error normally unmounts the tree down
 * to nothing, with no on-screen indication and no log anywhere. This is
 * the exact failure signature reported by Microsoft Store certification
 * ("the product does not display any content at launch", no error
 * message).
 *
 * This boundary guarantees SOME content always renders, and writes the
 * error to disk via storageService.logCrash so a blank-launch report can
 * actually be diagnosed instead of reproduced blind.
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('Fatal render error caught by ErrorBoundary:', error, info);
    void storageService.logCrash(error, { componentStack: info.componentStack });
  }

  handleReset = (): void => {
    this.setState({ error: null });
  };

  render(): React.ReactNode {
    const { error } = this.state;

    if (error) {
      return (
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.title}>⚠️ Something went wrong</Text>
            <Text style={styles.subtitle}>
              Happy Recorder 3D hit an unexpected error and couldn&apos;t continue.
              The details below have been saved to help fix this.
            </Text>
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error.message}</Text>
            </View>
            <Button
              title="Try Again"
              onPress={this.handleReset}
              variant="primary"
              size="medium"
              style={styles.button}
            />
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#a8a8b8',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  errorBox: {
    backgroundColor: 'rgba(244, 67, 54, 0.15)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },
  errorText: {
    color: '#f44336',
    fontSize: 13,
    fontFamily: 'monospace',
  },
  button: {
    minWidth: 160,
  },
});

export default ErrorBoundary;