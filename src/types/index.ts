// User types
export interface User {
  id: string;
  email: string;
  username: string;
  hive_username?: string;
  role: 'user' | 'creator';
  avatar_url?: string;
  created_at: string;
}

// Creator profile
export interface CreatorProfile {
  id: string;
  user_id: string;
  display_name: string;
  bio: string;
  cover_image?: string;
  avatar_url?: string;
  hive_username: string;
  subscriber_count: number;
  created_at: string;
}

// Subscription tier
export interface SubscriptionTier {
  id: string;
  creator_id: string;
  name: string;
  description: string;
  price_hbd: number;
  benefits: string[];
  created_at: string;
}

// Post types
export interface Post {
  id: string;
  creator_id: string;
  title: string;
  content: string;
  excerpt?: string;
  cover_image?: string;
  post_type: 'text' | 'image' | 'video';
  visibility: 'public' | 'subscribers';
  hive_permlink?: string;
  created_at: string;
  updated_at: string;
}

// Subscription record
export interface Subscription {
  id: string;
  subscriber_id: string;
  creator_id: string;
  tier_id: string;
  hive_tx_id: string;
  started_at: string;
  expires_at: string;
  status: 'active' | 'expired' | 'cancelled';
}

// Hive custom_json for subscription
export interface HiveSubscriptionPayload {
  type: 'subscription';
  creator: string;
  subscriber: string;
  tier_id: string;
  amount: string;
  duration_days: number;
  timestamp: number;
}

// Tip payload
export interface HiveTipPayload {
  type: 'tip';
  creator: string;
  tipper: string;
  message?: string;
}
