import { Link } from 'react-router-dom';
import { Users, FileText, BadgeCheck } from 'lucide-react';
import { motion } from 'motion/react';
import type { MockCreator } from '../../data/mockCreators';

interface MockCreatorCardProps {
  creator: MockCreator;
  index?: number;
}

export const MockCreatorCard = ({ creator, index = 0 }: MockCreatorCardProps) => {
  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link
        to={`/creator/${creator.hive_username}`}
        className="block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
      >
        {/* Cover Image */}
        <div className="h-24 relative overflow-hidden">
          <img
            src={creator.cover_url}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>

        {/* Avatar */}
        <div className="relative px-4">
          <div className="absolute -top-8 left-4">
            <img
              src={creator.avatar_url}
              alt={creator.display_name}
              className="w-16 h-16 rounded-full border-4 border-white object-cover shadow-md"
            />
          </div>
        </div>

        {/* Content */}
        <div className="pt-10 pb-4 px-4">
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold text-gray-900 truncate">{creator.display_name}</h3>
            {creator.is_verified && (
              <BadgeCheck className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            )}
          </div>
          <p className="text-sm text-gray-500">@{creator.hive_username}</p>
          
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{creator.bio}</p>

          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Users className="w-4 h-4" />
              <span>{formatCount(creator.subscriber_count)}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <FileText className="w-4 h-4" />
              <span>{creator.post_count} posts</span>
            </div>
          </div>

          <div className="mt-3">
            <span className="inline-block px-2.5 py-1 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-full">
              {creator.category}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
