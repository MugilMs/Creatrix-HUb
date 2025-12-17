import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { isUserSubscribed } from '../lib/hive';
import { supabase } from '../lib/supabase';

interface UseSubscriptionAccessOptions {
  creatorId?: string;
  creatorHiveUsername?: string;
  postVisibility?: 'public' | 'subscribers';
}

interface SubscriptionAccessResult {
  hasAccess: boolean;
  isLoading: boolean;
  isSubscribed: boolean;
  isCreator: boolean;
  error: string | null;
}

/**
 * Hook to check if current user has access to subscriber-only content
 * Checks both Supabase cache and Hive blockchain for subscription status
 */
export const useSubscriptionAccess = ({
  creatorId,
  creatorHiveUsername,
  postVisibility = 'public',
}: UseSubscriptionAccessOptions): SubscriptionAccessResult => {
  const { user, hiveUsername } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      // Public posts are always accessible
      if (postVisibility === 'public') {
        setIsLoading(false);
        return;
      }

      // No creator info provided
      if (!creatorId && !creatorHiveUsername) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Check if current user is the creator
        if (user && creatorId) {
          const { data: creatorProfile } = await supabase
            .from('creator_profiles')
            .select('user_id')
            .eq('id', creatorId)
            .single();

          if (creatorProfile?.user_id === user.id) {
            setIsCreator(true);
            setIsLoading(false);
            return;
          }
        }

        // Check Supabase cache first for faster response
        if (user && creatorId) {
          const { data: subscription } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('subscriber_id', user.id)
            .eq('creator_id', creatorId)
            .eq('status', 'active')
            .gt('expires_at', new Date().toISOString())
            .single();

          if (subscription) {
            setIsSubscribed(true);
            setIsLoading(false);
            return;
          }
        }

        // Verify on Hive blockchain as fallback
        if (hiveUsername && creatorHiveUsername) {
          const onChainSubscribed = await isUserSubscribed(
            hiveUsername,
            creatorHiveUsername
          );
          setIsSubscribed(onChainSubscribed);
        }
      } catch (err: any) {
        console.error('Error checking subscription access:', err);
        setError(err.message || 'Failed to check access');
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [user, hiveUsername, creatorId, creatorHiveUsername, postVisibility]);

  // User has access if: public post, is creator, or is subscribed
  const hasAccess =
    postVisibility === 'public' || isCreator || isSubscribed;

  return {
    hasAccess,
    isLoading,
    isSubscribed,
    isCreator,
    error,
  };
};
