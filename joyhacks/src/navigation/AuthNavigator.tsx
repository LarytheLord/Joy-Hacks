// src/navigation/AuthNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen'; // Adjust path
import SignUpScreen from '../screens/SignUpScreen'; // Adjust path

// Define the ParamList for the AuthStack
export type AuthStackParamList = {
  Login: undefined; // No params for Login screen
  SignUp: undefined; // No params for SignUp screen
};

const Stack = createStackNavigator<AuthStackParamList>();

export default function AuthNavigator(): JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
}