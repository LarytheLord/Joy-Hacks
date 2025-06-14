import { Ionicons } from '@expo/vector-icons';
import React, { type ComponentProps } from 'react';

interface TabBarIconProps extends ComponentProps<typeof Ionicons> {
  name: ComponentProps<typeof Ionicons>['name'];
  color: string;
}

export default function TabBarIcon({ name, color, ...rest }: TabBarIconProps) {
  return <Ionicons size={28} style={{ marginBottom: -3 }} name={name} color={color} {...rest} />;
}