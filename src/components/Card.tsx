import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  elevation?: 'low' | 'medium' | 'high';
  noPadding?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  elevation = 'medium',
  noPadding = false,
}) => {
  const getElevationStyles = (): ViewStyle => {
    switch (elevation) {
      case 'low':
        return {
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        };
      case 'medium':
        return {
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
          elevation: 4,
        };
      case 'high':
        return {
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 8,
        };
      default:
        return {
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
          elevation: 4,
        };
    }
  };

  const content = (
    <View
      style={[
        styles.card,
        getElevationStyles(),
        !noPadding && styles.padding,
        style,
      ]}
    >
      {children}
    </View>
  );

  return onPress ? (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>{content}</TouchableOpacity>
  ) : content;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    backdropFilter: 'blur(10px)',
    overflow: 'hidden',
  },
  padding: {
    padding: 16,
  },
});

export default Card;
