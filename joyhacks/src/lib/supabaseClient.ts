// src/lib/supabaseClient.ts
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, Session as SupabaseSession, User as SupabaseUser } from '@supabase/supabase-js'; // Import types

const supabaseUrl: string = 'https://xoxzsquoptsivhnxecbw.supabase.co';
const supabaseAnonKey: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhveHpzcXVvcHRzaXZobnhlY2J3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4OTgwMzksImV4cCI6MjA2MzQ3NDAzOX0.VT08egtAponWzHbUYUC8aQRr84YQ56sSwjzWkXi3HhQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Re-export Supabase types if you want to use them elsewhere easily
export type Session = SupabaseSession;
export type User = SupabaseUser;