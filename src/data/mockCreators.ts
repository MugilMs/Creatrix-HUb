export interface MockCreator {
  id: string;
  display_name: string;
  hive_username: string;
  avatar_url: string;
  cover_url: string;
  bio: string;
  category: string;
  subscriber_count: number;
  post_count: number;
  is_verified: boolean;
}

export const mockCreators: MockCreator[] = [
  {
    id: '1',
    display_name: 'Priya Sharma',
    hive_username: 'priyacreates',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    cover_url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&h=300&fit=crop',
    bio: 'Digital artist & illustrator. Creating vibrant artwork inspired by Indian culture.',
    category: 'Art & Design',
    subscriber_count: 12500,
    post_count: 234,
    is_verified: true,
  },
  {
    id: '2',
    display_name: 'Rahul Tech',
    hive_username: 'rahultech',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    cover_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=300&fit=crop',
    bio: 'Tech reviewer & gadget enthusiast. Honest reviews in Hindi & English.',
    category: 'Technology',
    subscriber_count: 45000,
    post_count: 567,
    is_verified: true,
  },
  {
    id: '3',
    display_name: 'Ananya Music',
    hive_username: 'ananyasings',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
    cover_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&h=300&fit=crop',
    bio: 'Classical & Bollywood singer. Sharing my musical journey with you.',
    category: 'Music',
    subscriber_count: 28000,
    post_count: 189,
    is_verified: true,
  },
  {
    id: '4',
    display_name: 'Chef Vikram',
    hive_username: 'chefvikram',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
    cover_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=300&fit=crop',
    bio: 'Professional chef sharing authentic Indian recipes & cooking tips.',
    category: 'Food & Cooking',
    subscriber_count: 67000,
    post_count: 412,
    is_verified: true,
  },
  {
    id: '5',
    display_name: 'Fitness with Neha',
    hive_username: 'nehafitness',
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    cover_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=300&fit=crop',
    bio: 'Certified fitness trainer. Home workouts & nutrition advice.',
    category: 'Health & Fitness',
    subscriber_count: 34000,
    post_count: 298,
    is_verified: false,
  },
  {
    id: '6',
    display_name: 'Travel Tales',
    hive_username: 'wanderlustindia',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
    cover_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=300&fit=crop',
    bio: 'Exploring India one destination at a time. Travel guides & hidden gems.',
    category: 'Travel',
    subscriber_count: 52000,
    post_count: 345,
    is_verified: true,
  },
  {
    id: '7',
    display_name: 'Code with Arjun',
    hive_username: 'arjuncodes',
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop',
    cover_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=300&fit=crop',
    bio: 'Full-stack developer. Tutorials on React, Node.js & Web3.',
    category: 'Education',
    subscriber_count: 89000,
    post_count: 623,
    is_verified: true,
  },
  {
    id: '8',
    display_name: 'Meera Photography',
    hive_username: 'meerashots',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop',
    cover_url: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&h=300&fit=crop',
    bio: 'Portrait & landscape photographer. Capturing moments that matter.',
    category: 'Photography',
    subscriber_count: 23000,
    post_count: 456,
    is_verified: false,
  },
];

export const categories = [
  'All',
  'Art & Design',
  'Technology',
  'Music',
  'Food & Cooking',
  'Health & Fitness',
  'Travel',
  'Education',
  'Photography',
  'Gaming',
  'Lifestyle',
];
