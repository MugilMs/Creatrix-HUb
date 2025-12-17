import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Users,
  Loader2,
  AlertCircle,
  BadgeCheck,
  MapPin,
  Calendar,
  Link as LinkIcon,
  Twitter,
  Instagram,
  Youtube,
  Heart,
  MessageCircle,
  Share2,
  Lock,
  Image as ImageIcon,
  Play,
  FileText,
} from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { Button, Card, CardContent } from '../components/ui';
import { TipButton } from '../components/hive/TipButton';
import { mockCreators } from '../data/mockCreators';
import type { CreatorProfile as CreatorProfileType, Post, SubscriptionTier } from '../types';

// Mock posts for demo
const mockPosts = [
  {
    id: '1',
    title: 'Behind the scenes of my latest project',
    excerpt: 'Take a look at how I created this piece from start to finish. Exclusive content for my subscribers!',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=400&fit=crop',
    likes: 234,
    comments: 45,
    tier: 'free',
    type: 'image',
    date: '2 hours ago',
  },
  {
    id: '2',
    title: 'New tutorial: Advanced techniques',
    excerpt: 'Learn the advanced techniques I use in my daily workflow. This comprehensive guide covers everything.',
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=400&fit=crop',
    likes: 567,
    comments: 89,
    tier: 'basic',
    type: 'video',
    date: '1 day ago',
  },
  {
    id: '3',
    title: 'Exclusive Q&A session recording',
    excerpt: 'Watch the full recording of our monthly Q&A session where I answer all your questions.',
    image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=600&h=400&fit=crop',
    likes: 892,
    comments: 156,
    tier: 'premium',
    type: 'video',
    date: '3 days ago',
  },
  {
    id: '4',
    title: 'My creative process explained',
    excerpt: 'A deep dive into how I approach new projects and the tools I use every day.',
    image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600&h=400&fit=crop',
    likes: 445,
    comments: 67,
    tier: 'free',
    type: 'article',
    date: '5 days ago',
  },
];

// Mock subscription tiers (prices in HBD)
const mockTiers = [
  {
    id: '1',
    name: 'Supporter',
    price: 5,
    currency: 'HBD',
    description: 'Support my work and get access to behind-the-scenes content',
    benefits: ['Early access to posts', 'Behind-the-scenes content', 'Supporter badge'],
    color: 'indigo',
  },
  {
    id: '2',
    name: 'Premium',
    price: 15,
    currency: 'HBD',
    description: 'Get exclusive tutorials and monthly Q&A sessions',
    benefits: ['All Supporter benefits', 'Exclusive tutorials', 'Monthly Q&A access', 'Discord access'],
    color: 'purple',
    popular: true,
  },
  {
    id: '3',
    name: 'VIP',
    price: 50,
    currency: 'HBD',
    description: 'One-on-one mentorship and personalized feedback',
    benefits: ['All Premium benefits', '1-on-1 monthly call', 'Personalized feedback', 'Priority support'],
    color: 'amber',
  },
];

export const CreatorProfile = () => {
  const { username } = useParams<{ username: string }>();
  const { hiveUsername } = useAuthStore();
  const { checkSubscription } = useSubscriptionStore();

  const [creator, setCreator] = useState<CreatorProfileType | null>(null);
  const [mockCreator, setMockCreator] = useState<(typeof mockCreators)[0] | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, setIsSubscribed] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (username) {
      fetchCreatorData();
    }
  }, [username]);

  useEffect(() => {
    if (creator && hiveUsername) {
      checkUserSubscription();
    }
  }, [creator, hiveUsername]);

  const fetchCreatorData = async () => {
    setIsLoading(true);
    try {
      // First try to fetch from database
      const { data: creatorData, error: creatorError } = await supabase
        .from('creator_profiles')
        .select('*')
        .eq('hive_username', username)
        .single();

      if (creatorError || !creatorData) {
        // Fall back to mock data
        const foundMock = mockCreators.find((c) => c.hive_username === username);
        if (foundMock) {
          setMockCreator(foundMock);
        } else {
          setError('Creator not found');
        }
      } else {
        setCreator(creatorData as CreatorProfileType);

        // Fetch posts
        const { data: postsData } = await supabase
          .from('posts')
          .select('*')
          .eq('creator_id', creatorData.id)
          .order('created_at', { ascending: false });

        setPosts((postsData as Post[]) || []);

        // Fetch tiers
        const { data: tiersData } = await supabase
          .from('subscription_tiers')
          .select('*')
          .eq('creator_id', creatorData.id)
          .order('price_hbd', { ascending: true });

        setTiers((tiersData as SubscriptionTier[]) || []);
      }
    } catch (err: any) {
      // Fall back to mock data
      const foundMock = mockCreators.find((c) => c.hive_username === username);
      if (foundMock) {
        setMockCreator(foundMock);
      } else {
        setError('Creator not found');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const checkUserSubscription = async () => {
    if (!creator || !hiveUsername) return;
    const subscribed = await checkSubscription(hiveUsername, creator.hive_username);
    setIsSubscribed(subscribed);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error && !mockCreator) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">Creator not found</h1>
        <p className="text-gray-600 mt-2">The creator you're looking for doesn't exist.</p>
        <Link to="/explore">
          <Button className="mt-6">Explore Creators</Button>
        </Link>
      </div>
    );
  }

  // Use mock creator if no real creator found
  if (mockCreator) {
    return <MockCreatorProfile creator={mockCreator} />;
  }

  // Real creator profile (existing code)
  return (
    <div>
      {/* Cover & Profile Header */}
      <div className="h-48 md:h-64 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
        {creator?.cover_image && (
          <img src={creator.cover_image} alt="" className="w-full h-full object-cover" />
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-16 mb-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between">
            <div className="flex items-end space-x-4">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden">
                {creator?.avatar_url && (
                  <img
                    src={creator.avatar_url}
                    alt={creator.display_name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="pb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {creator?.display_name}
                </h1>
                <p className="text-gray-500">@{creator?.hive_username}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <div className="flex items-center space-x-1 text-gray-600">
                <Users className="w-5 h-5" />
                <span>{creator?.subscriber_count} subscribers</span>
              </div>
              {creator && (
                <TipButton
                  creatorHiveUsername={creator.hive_username}
                  creatorDisplayName={creator.display_name}
                />
              )}
            </div>
          </div>
          {creator?.bio && <p className="text-gray-600 mt-4 max-w-2xl">{creator.bio}</p>}
        </div>

        <div className="grid lg:grid-cols-3 gap-8 pb-12">
          {/* Posts Column */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Posts</h2>

            {posts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-gray-500">No posts yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <div key={post.id}>Post: {post.title}</div>
                ))}
              </div>
            )}
          </div>

          {/* Subscription Tiers Column */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Subscribe</h2>

            {tiers.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">No subscription tiers available</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {tiers.map((tier) => (
                  <div key={tier.id}>Tier: {tier.name}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Mock Creator Profile Component
const MockCreatorProfile = ({ creator }: { creator: (typeof mockCreators)[0] }) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const { hiveUsername, isHiveConnected } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image */}
      <div className="h-48 md:h-72 relative">
        <img src={creator.cover_url} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="relative -mt-20 mb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-6">
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative"
            >
              <img
                src={creator.avatar_url}
                alt={creator.display_name}
                className="w-32 h-32 md:w-40 md:h-40 rounded-2xl border-4 border-white shadow-xl object-cover"
              />
              {creator.is_verified && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center border-2 border-white">
                  <BadgeCheck className="w-5 h-5 text-white" />
                </div>
              )}
            </motion.div>

            {/* Info */}
            <div className="flex-1 pb-2">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
                    {creator.display_name}
                    {creator.is_verified && (
                      <BadgeCheck className="w-6 h-6 text-indigo-600" />
                    )}
                  </h1>
                  <p className="text-gray-500">@{creator.hive_username}</p>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant={isFollowing ? 'outline' : 'primary'}
                    onClick={() => setIsFollowing(!isFollowing)}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          <p className="text-gray-600 mt-4 max-w-2xl">{creator.bio}</p>

          {/* Stats & Meta */}
          <div className="flex flex-wrap items-center gap-6 mt-4">
            <div className="flex items-center gap-1 text-gray-600">
              <Users className="w-4 h-4" />
              <span className="font-semibold">{(creator.subscriber_count / 1000).toFixed(1)}K</span>
              <span className="text-gray-500">subscribers</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <FileText className="w-4 h-4" />
              <span className="font-semibold">{creator.post_count}</span>
              <span className="text-gray-500">posts</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>Joined March 2023</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500">
              <MapPin className="w-4 h-4" />
              <span>India</span>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-3 mt-4">
            <a href="#" className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <Twitter className="w-5 h-5 text-gray-600" />
            </a>
            <a href="#" className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <Instagram className="w-5 h-5 text-gray-600" />
            </a>
            <a href="#" className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <Youtube className="w-5 h-5 text-gray-600" />
            </a>
            <a href="#" className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <LinkIcon className="w-5 h-5 text-gray-600" />
            </a>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('posts')}
              className={`pb-4 font-medium transition-colors relative ${
                activeTab === 'posts' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Posts
              {activeTab === 'posts' && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`pb-4 font-medium transition-colors relative ${
                activeTab === 'about' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              About
              {activeTab === 'about' && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                />
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-3 gap-8 pb-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'posts' ? (
              <div className="space-y-6">
                {mockPosts.map((post, index) => (
                  <MockPostCard key={post.id} post={post} index={index} />
                ))}
              </div>
            ) : (
              <AboutSection creator={creator} />
            )}
          </div>

          {/* Sidebar - Subscription Tiers */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Support {creator.display_name}</h3>
            {mockTiers.map((tier, index) => (
              <MockTierCard 
                key={tier.id} 
                tier={tier} 
                index={index} 
                creatorUsername={creator.hive_username}
                subscriberUsername={hiveUsername}
                isHiveConnected={isHiveConnected}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Mock Post Card
const MockPostCard = ({ post, index }: { post: (typeof mockPosts)[0]; index: number }) => {
  const isLocked = post.tier !== 'free';

  const getTypeIcon = () => {
    switch (post.type) {
      case 'video':
        return <Play className="w-4 h-4" />;
      case 'image':
        return <ImageIcon className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Image */}
      <div className="relative aspect-video">
        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
        {isLocked && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center text-white">
              <Lock className="w-8 h-8 mx-auto mb-2" />
              <p className="font-medium">Subscribe to unlock</p>
              <p className="text-sm text-white/70 capitalize">{post.tier} tier required</p>
            </div>
          </div>
        )}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="px-2 py-1 bg-black/50 backdrop-blur-sm rounded-lg text-white text-xs flex items-center gap-1">
            {getTypeIcon()}
            {post.type}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1">{post.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors">
              <Heart className="w-4 h-4" />
              <span className="text-sm">{post.likes}</span>
            </button>
            <button className="flex items-center gap-1 text-gray-500 hover:text-indigo-500 transition-colors">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">{post.comments}</span>
            </button>
          </div>
          <span className="text-xs text-gray-400">{post.date}</span>
        </div>
      </div>
    </motion.div>
  );
};

// Mock Tier Card
const MockTierCard = ({
  tier,
  index,
  creatorUsername,
  subscriberUsername,
  isHiveConnected,
}: {
  tier: (typeof mockTiers)[0];
  index: number;
  creatorUsername: string;
  subscriberUsername: string | null;
  isHiveConnected: boolean;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const colorClasses = {
    indigo: 'from-indigo-500 to-indigo-600',
    purple: 'from-purple-500 to-purple-600',
    amber: 'from-amber-500 to-amber-600',
  };

  const handleSubscribe = async () => {
    // Check if Hive Keychain is available
    if (typeof window === 'undefined' || !(window as any).hive_keychain) {
      setError('Please install Hive Keychain extension to subscribe');
      return;
    }

    if (!isHiveConnected || !subscriberUsername) {
      setError('Please connect your Hive wallet first');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const keychain = (window as any).hive_keychain;
      
      // Create subscription memo
      const memo = JSON.stringify({
        type: 'subscription',
        tier: tier.id,
        tier_name: tier.name,
        app: 'creatorhub',
      });

      // Request transfer via Hive Keychain
      keychain.requestTransfer(
        subscriberUsername,
        creatorUsername,
        tier.price.toFixed(3),
        memo,
        'HBD',
        (response: any) => {
          setIsLoading(false);
          if (response.success) {
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
          } else {
            setError(response.message || 'Transaction failed');
          }
        }
      );
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Failed to process subscription');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`relative bg-white rounded-2xl shadow-sm overflow-hidden ${
        tier.popular ? 'ring-2 ring-purple-500' : ''
      }`}
    >
      {tier.popular && (
        <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs font-medium px-3 py-1 rounded-bl-lg">
          Most Popular
        </div>
      )}

      <div className={`h-2 bg-gradient-to-r ${colorClasses[tier.color as keyof typeof colorClasses]}`} />

      <div className="p-4">
        <h4 className="font-semibold text-gray-900">{tier.name}</h4>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-2xl font-bold text-gray-900">{tier.price}</span>
          <span className="text-gray-500 text-sm">HBD/month</span>
        </div>
        <p className="text-sm text-gray-600 mt-2">{tier.description}</p>

        <ul className="mt-4 space-y-2">
          {tier.benefits.map((benefit, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              {benefit}
            </li>
          ))}
        </ul>

        {error && (
          <p className="text-sm text-red-500 mt-3">{error}</p>
        )}

        {success && (
          <p className="text-sm text-green-500 mt-3">Successfully subscribed! 🎉</p>
        )}

        <Button 
          className="w-full mt-4" 
          variant={tier.popular ? 'primary' : 'outline'}
          onClick={handleSubscribe}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            `Subscribe for ${tier.price} HBD`
          )}
        </Button>
      </div>
    </motion.div>
  );
};

// About Section
const AboutSection = ({ creator }: { creator: (typeof mockCreators)[0] }) => (
  <div className="space-y-6">
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h3 className="font-semibold text-gray-900 mb-4">About</h3>
      <p className="text-gray-600 leading-relaxed">
        {creator.bio}
        <br /><br />
        I've been creating content for over 5 years and love sharing my knowledge with my community. 
        When I'm not creating, you can find me exploring new places and trying out new techniques.
        <br /><br />
        Thank you for being here and supporting my work! Your support means everything to me and 
        helps me continue doing what I love.
      </p>
    </div>

    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h3 className="font-semibold text-gray-900 mb-4">What you'll get</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Play className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Exclusive Videos</p>
            <p className="text-sm text-gray-500">Weekly tutorials and behind-the-scenes</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Community Access</p>
            <p className="text-sm text-gray-500">Join our private Discord server</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Monthly Q&A</p>
            <p className="text-sm text-gray-500">Live sessions to answer your questions</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Resources</p>
            <p className="text-sm text-gray-500">Downloadable templates and guides</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);
