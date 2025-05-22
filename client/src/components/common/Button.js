import React from 'react';
import { StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

const Button = ({ 
  onPress, 
  title, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  style,
  textStyle
}) => {
  const { theme } = useTheme();

  const getButtonStyle = () => {
    const baseStyle = {
      ...styles.button,
      ...(variant === 'primary' && {
        backgroundColor: theme.colors.primary,
      }),
      ...(variant === 'secondary' && {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.primary,
      }),
      ...(size === 'small' && {
        paddingVertical: 8,
        paddingHorizontal: 16,
      }),
      ...(size === 'medium' && {
        paddingVertical: 12,
        paddingHorizontal: 24,
      }),
      ...(size === 'large' && {
        paddingVertical: 16,
        paddingHorizontal: 32,
      }),
      ...(disabled && {
        opacity: 0.5,
      }),
    };

    return [baseStyle, style];
  };

  const getTextStyle = () => {
    const baseStyle = {
      ...styles.text,
      ...(variant === 'primary' && {
        color: theme.colors.white,
      }),
      ...(variant === 'secondary' && {
        color: theme.colors.primary,
      }),
    };

    return [baseStyle, textStyle];
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={getButtonStyle()}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={getTextStyle()}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Button; 