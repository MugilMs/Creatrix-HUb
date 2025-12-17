import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Using mock mode.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Database types for Supabase
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username: string;
          hive_username: string | null;
          role: 'user' | 'creator';
          avatar_url: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      creator_profiles: {
        Row: {
          id: string;
          user_id: string;
          display_name: string;
          bio: string;
          cover_image: string | null;
          avatar_url: string | null;
          hive_username: string;
          subscriber_count: number;
          created_at: string;
        };
      };
      subscription_tiers: {
        Row: {
          id: string;
          creator_id: string;
          name: string;
          description: string;
          price_hbd: number;
          benefits: string[];
          created_at: string;
        };
      };
      posts: {
        Row: {
          id: string;
          creator_id: string;
          title: string;
          content: string;
          excerpt: string | null;
          cover_image: string | null;
          post_type: 'text' | 'image' | 'video';
          visibility: 'public' | 'subscribers';
          hive_permlink: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          subscriber_id: string;
          creator_id: string;
          tier_id: string;
          hive_tx_id: string;
          started_at: string;
          expires_at: string;
          status: 'active' | 'expired' | 'cancelled';
        };
      };
    };
  };
};
