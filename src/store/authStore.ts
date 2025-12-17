import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { requestKeychainHandshake, isKeychainAvailable } from '../lib/hive';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isHiveConnected: boolean;
  hiveUsername: string | null;
  
  // Actions
  loginWithHive: (hiveUsername: string) => Promise<void>;
  signOut: () => Promise<void>;
  connectHive: (hiveUsername: string) => Promise<void>;
  disconnectHive: () => void;
  becomeCreator: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  checkSession: () => Promise<void>;
}

// Generate a deterministic UUID v5-like ID from Hive username
const generateHiveUserId = (hiveUsername: string): string => {
  // Create a deterministic UUID from the hive username
  // Using a simple hash-to-UUID approach
  let hash = 0;
  const str = `hive:${hiveUsername}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  // Convert to hex and format as UUID
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const uuid = `${hex.slice(0, 8)}-${hex.slice(0, 4)}-4${hex.slice(1, 4)}-8${hex.slice(0, 3)}-${hex.padEnd(12, '0').slice(0, 12)}`;
  return uuid;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      isHiveConnected: false,
      hiveUsername: null,

      // Login with Hive Keychain only (no Supabase auth needed)
      loginWithHive: async (hiveUsername) => {
        if (!isKeychainAvailable()) {
          throw new Error('Hive Keychain not installed');
        }

        set({ isLoading: true });
        try {
          // Verify ownership via Keychain signature
          await requestKeychainHandshake(hiveUsername);

          const hiveUserId = generateHiveUserId(hiveUsername);

          let existingUser = null;

          // Only query Supabase if configured
          if (isSupabaseConfigured) {
            const { data } = await supabase
              .from('users')
              .select('*')
              .eq('hive_username', hiveUsername)
              .single();
            existingUser = data;
          }

          if (existingUser) {
            // User exists, restore their session locally
            set({
              user: existingUser as User,
              isLoading: false,
              hiveUsername,
              isHiveConnected: true,
            });
          } else {
            // Create new user profile
            const newUser = {
              id: hiveUserId,
              email: `${hiveUsername}@hive.local`,
              username: hiveUsername,
              hive_username: hiveUsername,
              role: 'user' as const,
              created_at: new Date().toISOString(),
            };

            // Only insert to Supabase if configured
            if (isSupabaseConfigured) {
              const { error: profileError } = await supabase
                .from('users')
                .insert(newUser);

              if (profileError) {
                console.warn('Failed to save user to Supabase:', profileError);
              }
            }

            set({
              user: newUser,
              isLoading: false,
              hiveUsername,
              isHiveConnected: true,
            });
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      signOut: async () => {
        // Clear local session (no Supabase auth to sign out from)
        set({ 
          user: null, 
          isHiveConnected: false, 
          hiveUsername: null,
          isLoading: false,
        });
      },

      connectHive: async (hiveUsername) => {
        if (!isKeychainAvailable()) {
          throw new Error('Hive Keychain not installed');
        }

        // Verify ownership via Keychain signature
        await requestKeychainHandshake(hiveUsername);

        const { user } = get();
        if (user) {
          // Update user profile with Hive username (only if Supabase configured)
          if (isSupabaseConfigured) {
            await supabase
              .from('users')
              .update({ hive_username: hiveUsername })
              .eq('id', user.id);
          }

          set({ 
            isHiveConnected: true, 
            hiveUsername,
            user: { ...user, hive_username: hiveUsername },
          });
        }
      },

      disconnectHive: () => {
        const { user } = get();
        if (user) {
          if (isSupabaseConfigured) {
            supabase
              .from('users')
              .update({ hive_username: null })
              .eq('id', user.id);
          }

          set({ 
            isHiveConnected: false, 
            hiveUsername: null,
            user: { ...user, hive_username: undefined },
          });
        }
      },

      becomeCreator: async () => {
        const { user, hiveUsername } = get();
        if (!user) throw new Error('Not logged in');
        if (!hiveUsername) throw new Error('Connect Hive wallet first');

        if (isSupabaseConfigured) {
          // Update user role
          await supabase
            .from('users')
            .update({ role: 'creator' })
            .eq('id', user.id);

          // Create creator profile
          await supabase
            .from('creator_profiles')
            .insert({
              user_id: user.id,
              display_name: user.username,
              bio: '',
              hive_username: hiveUsername,
              subscriber_count: 0,
            });
        }

        set({ user: { ...user, role: 'creator' } });
      },

      updateProfile: async (updates) => {
        const { user } = get();
        if (!user) throw new Error('Not logged in');

        if (isSupabaseConfigured) {
          await supabase
            .from('users')
            .update(updates)
            .eq('id', user.id);
        }

        set({ user: { ...user, ...updates } });
      },

      checkSession: async () => {
        set({ isLoading: true });
        try {
          // For Hive-only auth, check if we have a stored hiveUsername
          const { hiveUsername, user } = get();
          
          if (hiveUsername) {
            if (isSupabaseConfigured) {
              // Restore session from stored Hive username
              const { data: profile } = await supabase
                .from('users')
                .select('*')
                .eq('hive_username', hiveUsername)
                .single();

              if (profile) {
                set({ 
                  user: profile as User,
                  hiveUsername: profile.hive_username,
                  isHiveConnected: true,
                });
              } else {
                // User not found in DB, clear local session
                set({
                  user: null,
                  hiveUsername: null,
                  isHiveConnected: false,
                });
              }
            } else {
              // Mock mode: keep existing user from localStorage
              if (user) {
                set({
                  user,
                  hiveUsername,
                  isHiveConnected: true,
                });
              }
            }
          }
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        hiveUsername: state.hiveUsername,
        isHiveConnected: state.isHiveConnected,
        user: state.user, // Persist user for session restoration
      }),
    }
  )
);
