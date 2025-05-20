import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ThemeProvider, Provider as PaperProvider } from 'react-native-paper';
import { theme } from './theme/Theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Screens
import AuthScreen from './screens/AuthScreen';
import FeedScreen from './screens/FeedScreen';
import CreateVideoScreen from './screens/CreateVideoScreen';
import ProfileScreen from './screens/ProfileScreen';
import VideoPlayerScreen from './screens/VideoPlayerScreen';
import CommentsScreen from './screens/CommentsScreen';
import EditProfileScreen from './screens/EditProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Feed') {
            iconName = 'home';
          } else if (route.name === 'Create') {
            iconName = 'plus-circle';
          } else if (route.name === 'Profile') {
            iconName = 'account';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen 
        name="Feed" 
        component={FeedScreen} 
        options={{ headerTitle: 'Code Reels' }}
      />
      <Tab.Screen 
        name="Create" 
        component={CreateVideoScreen} 
        options={{ headerTitle: 'Create Reel' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ headerTitle: 'My Profile' }}
      />
    </Tab.Navigator>
  );
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        setIsLoggedIn(!!token);
      } catch (error) {
        console.error('Error checking login status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={isLoggedIn ? 'Main' : 'Auth'}>
          <Stack.Screen 
            name="Auth" 
            component={AuthScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Main" 
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="VideoPlayer" 
            component={VideoPlayerScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Comments" 
            component={CommentsScreen}
            options={{ headerTitle: 'Comments' }}
          />
          <Stack.Screen 
            name="EditProfile" 
            component={EditProfileScreen}
            options={{ headerTitle: 'Edit Profile' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}