import { useState } from 'react';
import { TrendingUp, Flame, Clock, ArrowUp } from 'lucide-react';
import { motion } from 'motion/react';
import { MockCreatorCard } from '../components/creator/MockCreatorCard';
import { mockCreators } from '../data/mockCreators';
import BlurText from '../components/ui/BlurText';

type TimeRange = 'today' | 'week' | 'month';

export const Trending = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');

  // Simulate different trending data based on time range
  const getTrendingCreators = () => {
    const shuffled = [...mockCreators].sort(() => Math.random() - 0.5);
    return shuffled;
  };

  const trendingCreators = getTrendingCreators();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <Flame className="w-8 h-8" />
            <BlurText
              text="Trending Now"
              delay={100}
              animateBy="words"
              direction="top"
              className="text-3xl md:text-4xl font-bold"
            />
          </div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white/80 mt-2 text-lg"
          >
            Discover the hottest creators gaining momentum
          </motion.p>

          {/* Time Range Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex gap-2 mt-8"
          >
            <TimeButton
              active={timeRange === 'today'}
              onClick={() => setTimeRange('today')}
              label="Today"
            />
            <TimeButton
              active={timeRange === 'week'}
              onClick={() => setTimeRange('week')}
              label="This Week"
            />
            <TimeButton
              active={timeRange === 'month'}
              onClick={() => setTimeRange('month')}
              label="This Month"
            />
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm mb-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatItem label="New Creators" value="+234" trend="+12%" />
            <StatItem label="New Subscribers" value="+12.5K" trend="+8%" />
            <StatItem label="Posts Published" value="+1,890" trend="+15%" />
            <StatItem label="Tips Sent" value="2.4K HBD" trend="+22%" />
          </div>
        </motion.div>

        {/* Top Trending */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <h2 className="text-xl font-semibold text-gray-900">Top Trending Creators</h2>
          </div>

          {/* Featured Top 3 */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {trendingCreators.slice(0, 3).map((creator, index) => (
              <TrendingTopCard key={creator.id} creator={creator} rank={index + 1} />
            ))}
          </div>
        </div>

        {/* Rest of Trending */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-gray-500" />
            <h2 className="text-xl font-semibold text-gray-900">Rising Stars</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingCreators.slice(3).map((creator, index) => (
              <MockCreatorCard key={creator.id} creator={creator} index={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const TimeButton = ({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
      active
        ? 'bg-white text-orange-600'
        : 'bg-white/20 text-white hover:bg-white/30'
    }`}
  >
    {label}
  </button>
);

const StatItem = ({ label, value, trend }: { label: string; value: string; trend: string }) => (
  <div className="text-center">
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    <p className="text-sm text-gray-500">{label}</p>
    <div className="flex items-center justify-center gap-1 mt-1 text-green-600 text-sm">
      <ArrowUp className="w-3 h-3" />
      <span>{trend}</span>
    </div>
  </div>
);

const TrendingTopCard = ({
  creator,
  rank,
}: {
  creator: typeof mockCreators[0];
  rank: number;
}) => {
  const rankColors = {
    1: 'from-yellow-400 to-amber-500',
    2: 'from-gray-300 to-gray-400',
    3: 'from-orange-400 to-orange-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: rank * 0.1 }}
      className="relative bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Rank Badge */}
      <div className={`absolute top-4 left-4 w-10 h-10 bg-gradient-to-br ${rankColors[rank as keyof typeof rankColors]} rounded-full flex items-center justify-center text-white font-bold shadow-lg z-10`}>
        #{rank}
      </div>

      {/* Cover */}
      <div className="h-32 relative">
        <img src={creator.cover_url} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-4 pt-0 relative">
        <div className="absolute -top-10 left-4">
          <img
            src={creator.avatar_url}
            alt={creator.display_name}
            className="w-20 h-20 rounded-full border-4 border-white object-cover shadow-md"
          />
        </div>

        <div className="pt-12">
          <h3 className="font-semibold text-gray-900 text-lg">{creator.display_name}</h3>
          <p className="text-sm text-gray-500">@{creator.hive_username}</p>
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{creator.bio}</p>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <p className="font-semibold text-gray-900">{(creator.subscriber_count / 1000).toFixed(1)}K</p>
              <p className="text-xs text-gray-500">Subscribers</p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-green-600">+{Math.floor(Math.random() * 500 + 100)}</p>
              <p className="text-xs text-gray-500">This week</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
