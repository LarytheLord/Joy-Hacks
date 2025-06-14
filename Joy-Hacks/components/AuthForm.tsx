import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

type AuthMode = 'login' | 'signup';

interface AuthFormProps {
  mode: AuthMode;
  redirectPath?: string;
}

export function AuthForm({ mode, redirectPath = '/' }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async () => {
    setError(null);
    setSuccessMessage(null);
    
    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
    }
    
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await signIn(email, password);
        router.push(redirectPath);
      } else {
        await signUp(email, password);
        setSuccessMessage('Registration successful! Please check your email to confirm your account.');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || `Failed to ${mode === 'login' ? 'sign in' : 'sign up'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.cardHeader} />
        <View style={styles.cardContent}>
          <View style={styles.headerTextContainer}>
            <View style={styles.logoContainer}>
              <Ionicons name="code" size={30} color="white" />
            </View>
            <Text style={styles.title}>
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </Text>
            <Text style={styles.subtitle}>
              {mode === 'login' ? "Don't have an account yet? " : 'Already have an account? '}
              <Link
                href={mode === 'login' ? '/signup' : '/login'}
                style={styles.linkText}
              >
                {mode === 'login' ? 'Sign up here' : 'Sign in here'}
              </Link>
            </Text>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorTextBold}>Error</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {successMessage && (
            <View style={styles.successContainer}>
              <Text style={styles.successTextBold}>Success</Text>
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          )}

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email address</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail" size={20} color="gray" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  required
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed" size={20} color="gray" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={mode === 'signup' ? 'Create a password' : 'Enter your password'}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  required
                />
              </View>
            </View>

            {mode === 'signup' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed" size={20} color="gray" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    required
                  />
                </View>
              </View>
            )}

            {mode === 'login' && (
              <View style={styles.forgotPasswordContainer}>
                <Link href="/reset-password" style={styles.linkText}>
                  Forgot password?
                </Link>
              </View>
            )}

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>
                  {mode === 'login' ? 'Sign in' : 'Create account'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 400,
    marginHorizontal: 'auto',
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
    overflow: 'hidden',
  },
  cardHeader: {
    height: 8,
    backgroundColor: 'linear-gradient(to right, #3b82f6, #8b5cf6, #ec4899)', // This will need a linear gradient component in RN
  },
  cardContent: {
    padding: 24,
  },
  headerTextContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#4a5568',
    textAlign: 'center',
  },
  linkText: {
    color: '#3b82f6',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    borderLeftWidth: 4,
    borderColor: '#ef4444',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  errorTextBold: {
    fontWeight: 'bold',
    color: '#b91c1c',
  },
  errorText: {
    color: '#b91c1c',
  },
  successContainer: {
    backgroundColor: '#d1fae5',
    borderLeftWidth: 4,
    borderColor: '#10b981',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  successTextBold: {
    fontWeight: 'bold',
    color: '#065f46',
  },
  successText: {
    color: '#065f46',
  },
  form: {
    marginTop: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2d3748',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#1a202c',
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});