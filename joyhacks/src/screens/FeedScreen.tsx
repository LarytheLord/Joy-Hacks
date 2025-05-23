// src/screens/FeedScreen.tsx
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
import { useAuth } from '../context/AuthContext'; // Adjust path
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../navigation/MainNavigator'; // Import ParamList

type FeedScreenNavigationProp = StackNavigationProp<MainStackParamList, 'Feed'>;

interface Props {
  navigation: FeedScreenNavigationProp;
}

export default function FeedScreen({ navigation }: Props): JSX.Element {
  const { user } = useAuth();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Error logging out:", error.message);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CoderReels Feed</Text>
      {user && <Text>Welcome, {user.email}!</Text>}
      <Button title="Create Reel" onPress={() => navigation.navigate('CreateReel')} />
      {user && <Button title="My Profile" onPress={() => navigation.navigate('Profile', { userId: user.id })} />}
      {user && <Button title="Logout" onPress={handleLogout} />}
    </View>
  );
}
const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 10 },
    title: { fontSize: 22, marginBottom: 20 },
});