import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';

interface ModalProps {
  visible: boolean;
  onRequestClose?: () => void;
  children: React.ReactNode;
  transparent?: boolean;
  animationType?: 'none' | 'slide' | 'fade';
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  backdropOpacity?: number;
  closeOnBackdropPress?: boolean;
}

// react-native-windows doesn't ship a native implementation of RN's built-in
// <Modal> (there's no RCTModalHostView on Windows), so using it crashes at
// runtime with "requireNativeComponent: 'RCTModalHostView' was not found in
// the UIManager." This component keeps the same external API but is backed
// by a plain absolutely-positioned overlay instead, which works on every
// platform including Windows.
const Modal: React.FC<ModalProps> = ({
  visible,
  onRequestClose,
  children,
  animationType = 'slide',
  style,
  contentStyle,
  backdropOpacity = 0.7,
  closeOnBackdropPress = true,
}) => {
  // Keep the overlay mounted while the exit animation plays, then unmount.
  const [isMounted, setIsMounted] = useState(visible);
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setIsMounted(true);
      const duration = animationType === 'none' ? 0 : 200;
      Animated.parallel([
        Animated.timing(backdropAnim, { toValue: 1, duration, useNativeDriver: true }),
        Animated.timing(contentAnim, { toValue: 1, duration, useNativeDriver: true }),
      ]).start();
    } else {
      const duration = animationType === 'none' ? 0 : 150;
      Animated.parallel([
        Animated.timing(backdropAnim, { toValue: 0, duration, useNativeDriver: true }),
        Animated.timing(contentAnim, { toValue: 0, duration, useNativeDriver: true }),
      ]).start(({ finished }) => {
        if (finished) setIsMounted(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, animationType]);

  if (!isMounted) {
    return null;
  }

  const handleBackdropPress = () => {
    if (closeOnBackdropPress && onRequestClose) {
      onRequestClose();
    }
  };

  const contentTransform =
    animationType === 'slide'
      ? [
          {
            translateY: contentAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [40, 0],
            }),
          },
        ]
      : [];

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableOpacity
          style={[
            styles.backdrop,
            { backgroundColor: `rgba(0, 0, 0, ${backdropOpacity})` },
          ]}
          activeOpacity={1}
          onPress={handleBackdropPress}
        >
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: backdropAnim }]} />
        </TouchableOpacity>
        <Animated.View
          style={[
            styles.contentWrapper,
            style,
            {
              opacity: contentAnim,
              transform: contentTransform,
            },
          ]}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.content, contentStyle]}>
              {children}
            </View>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    elevation: 1000,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  contentWrapper: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
});

export default Modal;