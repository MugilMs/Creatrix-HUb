-- Fix for Hive-only login (no Supabase auth)
-- Run this in Supabase SQL Editor

-- Step 1: Remove foreign key constraint linking users.id to auth.users
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Step 2: Disable RLS on all tables (simpler for MVP)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_tiers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions DISABLE ROW LEVEL SECURITY;

-- Note: For production, you'd want to re-enable RLS with proper policies
-- that check the hive_username instead of auth.uid()
