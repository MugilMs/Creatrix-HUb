-- Creator Platform Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  hive_username TEXT UNIQUE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'creator')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Creator profiles
CREATE TABLE public.creator_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  bio TEXT DEFAULT '',
  cover_image TEXT,
  avatar_url TEXT,
  hive_username TEXT NOT NULL,
  subscriber_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscription tiers
CREATE TABLE public.subscription_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price_hbd DECIMAL(10, 3) NOT NULL CHECK (price_hbd > 0),
  benefits TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Posts
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  cover_image TEXT,
  post_type TEXT NOT NULL DEFAULT 'text' CHECK (post_type IN ('text', 'image', 'video')),
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'subscribers')),
  hive_permlink TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions (cached from blockchain for faster queries)
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscriber_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
  tier_id UUID NOT NULL REFERENCES public.subscription_tiers(id) ON DELETE CASCADE,
  hive_tx_id TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  UNIQUE(subscriber_id, creator_id)
);

-- Function to increment subscriber count
CREATE OR REPLACE FUNCTION increment_subscriber_count(creator_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.creator_profiles
  SET subscriber_count = subscriber_count + 1
  WHERE id = creator_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement subscriber count
CREATE OR REPLACE FUNCTION decrement_subscriber_count(creator_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.creator_profiles
  SET subscriber_count = GREATEST(subscriber_count - 1, 0)
  WHERE id = creator_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all users" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Creator profiles policies
CREATE POLICY "Anyone can view creator profiles" ON public.creator_profiles
  FOR SELECT USING (true);

CREATE POLICY "Creators can update own profile" ON public.creator_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can create creator profile" ON public.creator_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Subscription tiers policies
CREATE POLICY "Anyone can view tiers" ON public.subscription_tiers
  FOR SELECT USING (true);

CREATE POLICY "Creators can manage own tiers" ON public.subscription_tiers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.creator_profiles
      WHERE id = subscription_tiers.creator_id
      AND user_id = auth.uid()
    )
  );

-- Posts policies
CREATE POLICY "Anyone can view public posts" ON public.posts
  FOR SELECT USING (visibility = 'public');

CREATE POLICY "Subscribers can view subscriber posts" ON public.posts
  FOR SELECT USING (
    visibility = 'subscribers' AND (
      -- Creator can see their own posts
      EXISTS (
        SELECT 1 FROM public.creator_profiles
        WHERE id = posts.creator_id AND user_id = auth.uid()
      )
      OR
      -- Active subscribers can see posts
      EXISTS (
        SELECT 1 FROM public.subscriptions
        WHERE creator_id = posts.creator_id
        AND subscriber_id = auth.uid()
        AND status = 'active'
        AND expires_at > NOW()
      )
    )
  );

CREATE POLICY "Creators can manage own posts" ON public.posts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.creator_profiles
      WHERE id = posts.creator_id AND user_id = auth.uid()
    )
  );

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (subscriber_id = auth.uid());

CREATE POLICY "Creators can view their subscribers" ON public.subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.creator_profiles
      WHERE id = subscriptions.creator_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create subscriptions" ON public.subscriptions
  FOR INSERT WITH CHECK (subscriber_id = auth.uid());

CREATE POLICY "Users can update own subscriptions" ON public.subscriptions
  FOR UPDATE USING (subscriber_id = auth.uid());

-- Indexes for performance
CREATE INDEX idx_posts_creator_id ON public.posts(creator_id);
CREATE INDEX idx_posts_visibility ON public.posts(visibility);
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX idx_subscriptions_subscriber_id ON public.subscriptions(subscriber_id);
CREATE INDEX idx_subscriptions_creator_id ON public.subscriptions(creator_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscription_tiers_creator_id ON public.subscription_tiers(creator_id);
CREATE INDEX idx_creator_profiles_hive_username ON public.creator_profiles(hive_username);
