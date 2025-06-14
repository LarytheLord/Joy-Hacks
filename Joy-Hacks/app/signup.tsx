import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { AuthForm } from '../components/AuthForm';

export default function SignUpScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <AuthForm mode="signup" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
  },
});