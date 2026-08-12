import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  findNodeHandle,
  Platform,
} from 'react-native';
import { sceneManager } from '../three/scene';
import { objectFactory } from '../three/objects';
import { animationManager } from '../three/animations';

// For React Native Windows, you'd use a native view
// This is a simplified version that works with the native view

interface ThreeBackgroundProps {
  particleCount?: number;
  color?: string;
  speed?: number;
}

const ThreeBackgroundNative: React.FC<ThreeBackgroundProps> = ({
  particleCount = 200,
  color = '#6c63ff',
  speed = 0.001,
}) => {
  const containerRef = useRef<View>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (Platform.OS === 'windows') {
      sceneManager.initializeHeadless({ backgroundColor: '#0a0a1a' });
      const particleId = 'background-orb';
      objectFactory.createSphere(particleId, {
        radius: Math.max(0.25, particleCount / 800),
        color,
        position: { x: 0, y: 0, z: 0 },
      });
      animationManager.createFloatAnimation(particleId, { amplitude: 0.5, speed: speed * 1000, axis: 'y' });
      animationManager.createSpinAnimation(particleId, { speed: speed * 1000, axis: 'y' });
      animationManager.start();
      return () => {
        animationManager.stop();
        sceneManager.dispose();
      };
    }

    // A DOM-backed renderer is intentionally not created here. React Native
    // views do not expose a browser canvas; Windows uses the headless scene
    // above until a dedicated native WebGL renderer is supplied.
    const nodeHandle = findNodeHandle(container);
    if (!nodeHandle) return;

    const { width, height } = Dimensions.get('window');

    return undefined;
  }, [particleCount, color, speed]);

  return (
    <View
      ref={containerRef}
      style={styles.container}
      pointerEvents="none"
    />
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
});

export default ThreeBackgroundNative;
