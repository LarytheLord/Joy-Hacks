import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import TabBarIcon from '../../components/navigation/TabBarIcon';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
           tabBarIcon: ({ color, focused }) => (
             <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
           ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
           tabBarIcon: ({ color, focused }) => (
             <TabBarIcon name={focused ? 'code-slash' : 'code-slash-outline'} color={color} />
           ),
        }}
      />
      <Tabs.Screen
        name="VideoCodeScreen"
        options={{
          title: 'Video & Code',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'play-circle' : 'play-circle-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
