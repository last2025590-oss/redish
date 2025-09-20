import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import { RedditPost, Analytics } from './types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types for better TypeScript integration
export type Database = {
  public: {
    Tables: {
      posts: {
        Row: RedditPost;
        Insert: Omit<RedditPost, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<RedditPost, 'id' | 'created_at' | 'updated_at'>>;
      };
      analytics: {
        Row: Analytics;
        Insert: Omit<Analytics, 'id' | 'updated_at'>;
        Update: Partial<Omit<Analytics, 'id' | 'updated_at'>>;
      };
    };
  };
};