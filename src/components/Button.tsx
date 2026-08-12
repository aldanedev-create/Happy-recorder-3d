import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: '#6c63ff',
          borderColor: '#6c63ff',
        };
      case 'secondary':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderColor: 'rgba(255, 255, 255, 0.2)',
        };
      case 'danger':
        return {
          backgroundColor: '#ff4444',
          borderColor: '#ff4444',
        };
      case 'success':
        return {
          backgroundColor: '#4caf50',
          borderColor: '#4caf50',
        };
      case 'warning':
        return {
          backgroundColor: '#ff9800',
          borderColor: '#ff9800',
        };
      default:
        return {
          backgroundColor: '#6c63ff',
          borderColor: '#6c63ff',
        };
    }
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 6,
          paddingHorizontal: 12,
          borderRadius: 6,
        };
      case 'medium':
        return {
          paddingVertical: 10,
          paddingHorizontal: 20,
          borderRadius: 8,
        };
      case 'large':
        return {
          paddingVertical: 14,
          paddingHorizontal: 28,
          borderRadius: 10,
        };
      default:
        return {
          paddingVertical: 10,
          paddingHorizontal: 20,
          borderRadius: 8,
        };
    }
  };

  const getTextSize = (): TextStyle => {
    switch (size) {
      case 'small':
        return { fontSize: 12 };
      case 'medium':
        return { fontSize: 16 };
      case 'large':
        return { fontSize: 20 };
      default:
        return { fontSize: 16 };
    }
  };

  const getTextColor = (): string => {
    if (variant === 'primary' || variant === 'danger' || variant === 'success' || variant === 'warning') {
      return '#ffffff';
    }
    return '#e0e0e0';
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getVariantStyles(),
        getSizeStyles(),
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color="#ffffff" size="small" />
      ) : (
        <>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text
            style={[
              styles.text,
              getTextSize(),
              { color: getTextColor() },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    minHeight: 40,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  icon: {
    marginRight: 8,
    fontSize: 18,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default Button;
