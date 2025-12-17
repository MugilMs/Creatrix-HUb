import { useState } from 'react';
import { Search, Filter, TrendingUp, Star, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { Input } from '../components/ui';
import { MockCreatorCard } from '../components/creator/MockCreatorCard';
import { mockCreators, categories } from '../data/mockCreators';
import BlurText from '../components/ui/BlurText';

type SortOption = 'popular' | 'trending' | 'newest';

export const Explore = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<SortOption>('popular');

  const filteredCreators = mockCreators.filter((creator) => {
    const matchesSearch =
      creator.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.hive_username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.bio?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || creator.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const sortedCreators = [...filteredCreators].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.subscriber_count - a.subscriber_count;
      case 'trending':
        return b.post_count - a.post_count;
      case 'newest':
        return parseInt(b.id) - parseInt(a.id);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BlurText
            text="Explore Creators"
            delay={100}
            animateBy="words"
            direction="top"
            className="text-3xl md:text-4xl font-bold"
          />
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white/80 mt-2 text-lg"
          >
            Discover amazing creators and support their work
          </motion.p>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative max-w-xl mt-8"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search creators by name, username, or bio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-500">Sort by:</span>
            <div className="flex gap-1 bg-white rounded-lg p-1 border border-gray-200">
              <SortButton
                active={sortBy === 'popular'}
                onClick={() => setSortBy('popular')}
                icon={Star}
                label="Popular"
              />
              <SortButton
                active={sortBy === 'trending'}
                onClick={() => setSortBy('trending')}
                icon={TrendingUp}
                label="Trending"
              />
              <SortButton
                active={sortBy === 'newest'}
                onClick={() => setSortBy('newest')}
                icon={Clock}
                label="Newest"
              />
            </div>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-500 mb-6">
          Showing {sortedCreators.length} creator{sortedCreators.length !== 1 ? 's' : ''}
          {selectedCategory !== 'All' && ` in ${selectedCategory}`}
        </p>

        {/* Creators Grid */}
        {sortedCreators.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg">
              {searchQuery ? 'No creators found matching your search' : 'No creators in this category yet'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Clear filters
            </button>
          </motion.div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedCreators.map((creator, index) => (
              <MockCreatorCard key={creator.id} creator={creator} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const SortButton = ({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: any;
  label: string;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
      active ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
    }`}
  >
    <Icon className="w-4 h-4" />
    <span className="hidden sm:inline">{label}</span>
  </button>
);
