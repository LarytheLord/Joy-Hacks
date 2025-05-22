import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

const Card = ({ 
  children, 
  onPress, 
  style,
  variant = 'elevated',
  padding = 'medium'
}) => {
  const { theme } = useTheme();

  const getCardStyle = () => {
    const baseStyle = {
      ...styles.card,
      backgroundColor: theme.colors.surface,
      ...(variant === 'elevated' && {
        shadowColor: theme.colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }),
      ...(variant === 'outlined' && {
        borderWidth: 1,
        borderColor: theme.colors.border,
      }),
      ...(padding === 'small' && {
        padding: theme.spacing.sm,
      }),
      ...(padding === 'medium' && {
        padding: theme.spacing.md,
      }),
      ...(padding === 'large' && {
        padding: theme.spacing.lg,
      }),
    };

    return [baseStyle, style];
  };

  const CardContainer = onPress ? TouchableOpacity : View;

  return (
    <CardContainer
      style={getCardStyle()}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {children}
    </CardContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginVertical: 8,
  },
});

export default Card; 