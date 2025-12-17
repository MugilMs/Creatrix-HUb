import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { getCreatorEarnings } from '../lib/hive';
import type { CreatorProfile, Post, SubscriptionTier, Subscription } from '../types';

interface CreatorState {
  profile: CreatorProfile | null;
  posts: Post[];
  tiers: SubscriptionTier[];
  subscribers: Subscription[];
  earnings: { hbd: number; hive: number; subscriptions: number; tips: number };
  isLoading: boolean;

  // Actions
  fetchCreatorProfile: (userId: string) => Promise<void>;
  fetchCreatorByUsername: (username: string) => Promise<CreatorProfile | null>;
  updateCreatorProfile: (updates: Partial<CreatorProfile>) => Promise<void>;
  fetchPosts: (creatorId: string) => Promise<void>;
  createPost: (post: Omit<Post, 'id' | 'created_at' | 'updated_at'>) => Promise<Post>;
  updatePost: (postId: string, updates: Partial<Post>) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  fetchTiers: (creatorId: string) => Promise<void>;
  createTier: (tier: Omit<SubscriptionTier, 'id' | 'created_at'>) => Promise<void>;
  updateTier: (tierId: string, updates: Partial<SubscriptionTier>) => Promise<void>;
  deleteTier: (tierId: string) => Promise<void>;
  fetchSubscribers: (creatorId: string) => Promise<void>;
  fetchEarnings: (hiveUsername: string) => Promise<void>;
}

export const useCreatorStore = create<CreatorState>((set, get) => ({
  profile: null,
  posts: [],
  tiers: [],
  subscribers: [],
  earnings: { hbd: 0, hive: 0, subscriptions: 0, tips: 0 },
  isLoading: false,

  fetchCreatorProfile: async (userId) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('creator_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      set({ profile: data as CreatorProfile });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchCreatorByUsername: async (username) => {
    const { data, error } = await supabase
      .from('creator_profiles')
      .select('*')
      .eq('hive_username', username)
      .single();

    if (error) return null;
    return data as CreatorProfile;
  },

  updateCreatorProfile: async (updates) => {
    const { profile } = get();
    if (!profile) return;

    const { error } = await supabase
      .from('creator_profiles')
      .update(updates)
      .eq('id', profile.id);

    if (error) throw error;
    set({ profile: { ...profile, ...updates } });
  },

  fetchPosts: async (creatorId) => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('creator_id', creatorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    set({ posts: data as Post[] });
  },

  createPost: async (post) => {
    const { data, error } = await supabase
      .from('posts')
      .insert(post)
      .select()
      .single();

    if (error) throw error;
    
    const newPost = data as Post;
    set({ posts: [newPost, ...get().posts] });
    return newPost;
  },

  updatePost: async (postId, updates) => {
    const { error } = await supabase
      .from('posts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', postId);

    if (error) throw error;
    set({
      posts: get().posts.map(p => 
        p.id === postId ? { ...p, ...updates } : p
      ),
    });
  },

  deletePost: async (postId) => {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) throw error;
    set({ posts: get().posts.filter(p => p.id !== postId) });
  },

  fetchTiers: async (creatorId) => {
    const { data, error } = await supabase
      .from('subscription_tiers')
      .select('*')
      .eq('creator_id', creatorId)
      .order('price_hbd', { ascending: true });

    if (error) throw error;
    set({ tiers: data as SubscriptionTier[] });
  },

  createTier: async (tier) => {
    const { data, error } = await supabase
      .from('subscription_tiers')
      .insert(tier)
      .select()
      .single();

    if (error) throw error;
    set({ tiers: [...get().tiers, data as SubscriptionTier] });
  },

  updateTier: async (tierId, updates) => {
    const { error } = await supabase
      .from('subscription_tiers')
      .update(updates)
      .eq('id', tierId);

    if (error) throw error;
    set({
      tiers: get().tiers.map(t => 
        t.id === tierId ? { ...t, ...updates } : t
      ),
    });
  },

  deleteTier: async (tierId) => {
    const { error } = await supabase
      .from('subscription_tiers')
      .delete()
      .eq('id', tierId);

    if (error) throw error;
    set({ tiers: get().tiers.filter(t => t.id !== tierId) });
  },

  fetchSubscribers: async (creatorId) => {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('creator_id', creatorId)
      .eq('status', 'active');

    if (error) throw error;
    set({ subscribers: data as Subscription[] });
  },

  fetchEarnings: async (hiveUsername) => {
    const earnings = await getCreatorEarnings(hiveUsername, 30);
    set({ earnings });
  },
}));
