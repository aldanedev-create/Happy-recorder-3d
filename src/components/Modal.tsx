import React from 'react';
import {
  Modal as RNModal,
  View,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
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

const Modal: React.FC<ModalProps> = ({
  visible,
  onRequestClose,
  children,
  transparent = true,
  animationType = 'slide',
  style,
  contentStyle,
  backdropOpacity = 0.7,
  closeOnBackdropPress = true,
}) => {
  const handleBackdropPress = () => {
    if (closeOnBackdropPress && onRequestClose) {
      onRequestClose();
    }
  };

  return (
    <RNModal
      visible={visible}
      onRequestClose={onRequestClose}
      transparent={transparent}
      animationType={animationType}
      statusBarTranslucent
    >
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
        />
        <View style={[styles.contentWrapper, style]}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.content, contentStyle]}>
              {children}
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  );
};

const styles = StyleSheet.create({
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