// App.tsx
import 'react-native-url-polyfill/auto'; // MUST BE AT THE VERY TOP
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from './src/context/AuthContext'; // Adjust path
import AuthNavigator from './src/navigation/AuthNavigator'; // Adjust path
import MainNavigator from './src/navigation/MainNavigator'; // Adjust path
import { ActivityIndicator, View, StyleSheet } from 'react-native';

const AppContent: React.FC = () => { // Specify component type
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {session && session.user ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default function App(): JSX.Element { // Specify return type
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});