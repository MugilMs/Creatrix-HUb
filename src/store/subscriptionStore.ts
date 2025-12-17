import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { subscribeToCreator, isUserSubscribed } from '../lib/hive';
import type { Subscription } from '../types';

interface SubscriptionState {
  activeSubscriptions: Subscription[];
  isSubscribing: boolean;
  subscriptionCache: Map<string, boolean>; // creatorId -> isSubscribed

  // Actions
  fetchUserSubscriptions: (userId: string) => Promise<void>;
  subscribe: (
    subscriberUserId: string,
    subscriberHiveUsername: string,
    creatorId: string,
    creatorHiveUsername: string,
    tierId: string,
    priceHBD: number
  ) => Promise<void>;
  checkSubscription: (subscriberHiveUsername: string, creatorHiveUsername: string) => Promise<boolean>;
  cancelSubscription: (subscriptionId: string) => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  activeSubscriptions: [],
  isSubscribing: false,
  subscriptionCache: new Map(),

  fetchUserSubscriptions: async (userId) => {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('subscriber_id', userId)
      .eq('status', 'active');

    if (error) throw error;
    set({ activeSubscriptions: data as Subscription[] });
  },

  subscribe: async (subscriberUserId, subscriberHiveUsername, creatorId, creatorHiveUsername, tierId, priceHBD) => {
    set({ isSubscribing: true });
    
    try {
      // 1. Execute Hive blockchain transaction via Keychain
      const { txId } = await subscribeToCreator(
        subscriberHiveUsername,
        creatorHiveUsername,
        tierId,
        priceHBD
      );

      // 2. Record subscription in Supabase for faster queries
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          subscriber_id: subscriberUserId,
          creator_id: creatorId,
          tier_id: tierId,
          hive_tx_id: txId,
          started_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;

      // 3. Update subscriber count
      await supabase.rpc('increment_subscriber_count', { creator_id: creatorId });

      // 4. Update local state
      const newSubscription = data as Subscription;
      set({ 
        activeSubscriptions: [...get().activeSubscriptions, newSubscription],
        subscriptionCache: new Map(get().subscriptionCache).set(creatorId, true),
      });
    } finally {
      set({ isSubscribing: false });
    }
  },

  checkSubscription: async (subscriberHiveUsername, creatorHiveUsername) => {
    // Check cache first
    const cached = get().subscriptionCache.get(creatorHiveUsername);
    if (cached !== undefined) return cached;

    // Check on-chain
    const isSubscribed = await isUserSubscribed(subscriberHiveUsername, creatorHiveUsername);
    
    // Update cache
    const newCache = new Map(get().subscriptionCache);
    newCache.set(creatorHiveUsername, isSubscribed);
    set({ subscriptionCache: newCache });

    return isSubscribed;
  },

  cancelSubscription: async (subscriptionId) => {
    const { error } = await supabase
      .from('subscriptions')
      .update({ status: 'cancelled' })
      .eq('id', subscriptionId);

    if (error) throw error;
    set({
      activeSubscriptions: get().activeSubscriptions.filter(s => s.id !== subscriptionId),
    });
  },
}));
