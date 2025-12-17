import { Link } from 'react-router-dom';
import { Lock, Calendar, Image, Video, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, Avatar } from '../ui';
import type { Post, CreatorProfile } from '../../types';

interface PostCardProps {
  post: Post;
  creator?: CreatorProfile;
  isSubscribed?: boolean;
  showCreator?: boolean;
}

export const PostCard = ({ post, creator, isSubscribed, showCreator = true }: PostCardProps) => {
  const isLocked = post.visibility === 'subscribers' && !isSubscribed;
  
  const PostTypeIcon = {
    text: FileText,
    image: Image,
    video: Video,
  }[post.post_type];

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      {/* Cover Image */}
      {post.cover_image && (
        <div className="relative h-48">
          <img
            src={post.cover_image}
            alt=""
            className={`w-full h-full object-cover ${isLocked ? 'blur-sm' : ''}`}
          />
          {isLocked && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Lock className="w-8 h-8 text-white" />
            </div>
          )}
        </div>
      )}

      <CardContent>
        {/* Creator Info */}
        {showCreator && creator && (
          <Link
            to={`/creator/${creator.hive_username}`}
            className="flex items-center space-x-2 mb-3 hover:opacity-80"
          >
            <Avatar src={creator.avatar_url} fallback={creator.display_name} size="sm" />
            <span className="text-sm font-medium text-gray-900">{creator.display_name}</span>
          </Link>
        )}

        {/* Post Meta */}
        <div className="flex items-center space-x-3 text-sm text-gray-500 mb-2">
          <div className="flex items-center space-x-1">
            <PostTypeIcon className="w-4 h-4" />
            <span className="capitalize">{post.post_type}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
          </div>
          {post.visibility === 'subscribers' && (
            <span className="flex items-center space-x-1 text-amber-600">
              <Lock className="w-4 h-4" />
              <span>Subscribers only</span>
            </span>
          )}
        </div>

        {/* Title */}
        <Link to={`/post/${post.id}`}>
          <h3 className="font-semibold text-lg text-gray-900 hover:text-indigo-600 mb-2">
            {post.title}
          </h3>
        </Link>

        {/* Excerpt */}
        {isLocked ? (
          <p className="text-gray-500 text-sm">
            Subscribe to unlock this content
          </p>
        ) : (
          <p className="text-gray-600 text-sm line-clamp-3">
            {post.excerpt || post.content.slice(0, 200)}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
