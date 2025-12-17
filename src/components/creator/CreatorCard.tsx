import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { Card, Avatar } from '../ui';
import type { CreatorProfile } from '../../types';

interface CreatorCardProps {
  creator: CreatorProfile;
}

export const CreatorCard = ({ creator }: CreatorCardProps) => {
  return (
    <Link to={`/creator/${creator.hive_username}`}>
      <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
        {/* Cover Image */}
        <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-600">
          {creator.cover_image && (
            <img
              src={creator.cover_image}
              alt=""
              className="w-full h-full object-cover"
            />
          )}
        </div>
        
        {/* Profile Info */}
        <div className="px-4 pb-4">
          <div className="-mt-8 mb-3">
            <Avatar
              src={creator.avatar_url}
              fallback={creator.display_name}
              size="lg"
            />
          </div>
          
          <h3 className="font-semibold text-gray-900 truncate">
            {creator.display_name}
          </h3>
          <p className="text-sm text-gray-500 mb-2">@{creator.hive_username}</p>
          
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {creator.bio || 'No bio yet'}
          </p>
          
          <div className="flex items-center text-sm text-gray-500">
            <Users className="w-4 h-4 mr-1" />
            <span>{creator.subscriber_count} subscribers</span>
          </div>
        </div>
      </Card>
    </Link>
  );
};
