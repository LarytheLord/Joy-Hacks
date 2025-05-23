// src/navigation/MainNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import FeedScreen from '../screens/FeedScreen'; // Adjust path
import CreateReelScreen from '../screens/CreateReelScreen'; // Placeholder
import ProfileScreen from '../screens/ProfileScreen'; // Placeholder

// Define the ParamList for the MainStack
export type MainStackParamList = {
  Feed: undefined;
  CreateReel: undefined; // Or params if CreateReel needs them
  Profile: { userId: string }; // Example: Profile screen needs a userId
  // Add other screens and their params here
};

const Stack = createStackNavigator<MainStackParamList>();

export default function MainNavigator(): JSX.Element {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Feed" component={FeedScreen} options={{ title: 'CoderReels' }} />
      <Stack.Screen name="CreateReel" component={CreateReelScreen} options={{ title: 'Create Reel' }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Stack.Navigator>
  );
}

// Placeholder for screen components if not already created
// src/screens/CreateReelScreen.tsx
// const CreateReelScreen = () => <View><Text>Create Reel Screen</Text></View>;
// src/screens/ProfileScreen.tsx
// const ProfileScreen = () => <View><Text>Profile Screen</Text></View>;