import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '../lib/supabase';
import { Avatar, Button, Card, CardContent } from '../components/ui';
import { TipButton } from '../components/hive/TipButton';
import { useSubscriptionAccess } from '../hooks/useSubscriptionAccess';
import type { Post, CreatorProfile } from '../types';

export const PostView = () => {
  const { postId } = useParams<{ postId: string }>();
  
  const [post, setPost] = useState<Post | null>(null);
  const [creator, setCreator] = useState<CreatorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Use the subscription access hook
  const { hasAccess, isLoading: accessLoading } = useSubscriptionAccess({
    creatorId: creator?.id,
    creatorHiveUsername: creator?.hive_username,
    postVisibility: post?.visibility,
  });

  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const fetchPost = async () => {
    setIsLoading(true);
    try {
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single();

      if (postError) throw postError;
      setPost(postData as Post);

      // Fetch creator
      const { data: creatorData } = await supabase
        .from('creator_profiles')
        .select('*')
        .eq('id', postData.creator_id)
        .single();

      setCreator(creatorData as CreatorProfile);
    } catch (error) {
      console.error('Failed to fetch post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || accessLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!post || !creator) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Post not found</h1>
      </div>
    );
  }

  const isLocked = post.visibility === 'subscribers' && !hasAccess;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Back Link */}
      <Link
        to={`/creator/${creator.hive_username}`}
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to {creator.display_name}
      </Link>

      {/* Cover Image */}
      {post.cover_image && (
        <div className="relative rounded-xl overflow-hidden mb-8">
          <img
            src={post.cover_image}
            alt=""
            className={`w-full h-64 md:h-80 object-cover ${isLocked ? 'blur-md' : ''}`}
          />
          {isLocked && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Lock className="w-12 h-12 text-white" />
            </div>
          )}
        </div>
      )}

      {/* Post Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Link to={`/creator/${creator.hive_username}`}>
            <Avatar src={creator.avatar_url} fallback={creator.display_name} />
          </Link>
          <div>
            <Link
              to={`/creator/${creator.hive_username}`}
              className="font-medium text-gray-900 hover:text-indigo-600"
            >
              {creator.display_name}
            </Link>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
              {post.visibility === 'subscribers' && (
                <span className="flex items-center text-amber-600">
                  <Lock className="w-4 h-4 mr-1" />
                  Subscribers only
                </span>
              )}
            </div>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{post.title}</h1>
      </div>

      {/* Post Content */}
      {isLocked ? (
        <Card>
          <CardContent className="text-center py-12">
            <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Subscriber-only content
            </h3>
            <p className="text-gray-600 mb-6">
              Subscribe to {creator.display_name} to unlock this post
            </p>
            <Link to={`/creator/${creator.hive_username}`}>
              <Button>View Subscription Options</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <article className="prose prose-lg max-w-none">
          <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
            {post.content}
          </div>
        </article>
      )}

      {/* Post Footer */}
      {!isLocked && (
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar src={creator.avatar_url} fallback={creator.display_name} />
              <div>
                <p className="text-sm text-gray-500">Written by</p>
                <Link
                  to={`/creator/${creator.hive_username}`}
                  className="font-medium text-gray-900 hover:text-indigo-600"
                >
                  {creator.display_name}
                </Link>
              </div>
            </div>
            <TipButton
              creatorHiveUsername={creator.hive_username}
              creatorDisplayName={creator.display_name}
            />
          </div>
        </div>
      )}
    </div>
  );
};
