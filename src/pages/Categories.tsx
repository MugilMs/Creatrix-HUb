import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Palette,
  Cpu,
  Music,
  UtensilsCrossed,
  Dumbbell,
  Plane,
  GraduationCap,
  Camera,
  Gamepad2,
  Sparkles,
} from 'lucide-react';
import BlurText from '../components/ui/BlurText';

const categoryData = [
  { name: 'Art & Design', icon: Palette, color: 'from-pink-500 to-rose-500', count: 1250 },
  { name: 'Technology', icon: Cpu, color: 'from-blue-500 to-cyan-500', count: 2340 },
  { name: 'Music', icon: Music, color: 'from-purple-500 to-violet-500', count: 890 },
  { name: 'Food & Cooking', icon: UtensilsCrossed, color: 'from-orange-500 to-amber-500', count: 1560 },
  { name: 'Health & Fitness', icon: Dumbbell, color: 'from-green-500 to-emerald-500', count: 980 },
  { name: 'Travel', icon: Plane, color: 'from-sky-500 to-blue-500', count: 1120 },
  { name: 'Education', icon: GraduationCap, color: 'from-indigo-500 to-purple-500', count: 3200 },
  { name: 'Photography', icon: Camera, color: 'from-gray-600 to-gray-800', count: 760 },
  { name: 'Gaming', icon: Gamepad2, color: 'from-red-500 to-pink-500', count: 2100 },
  { name: 'Lifestyle', icon: Sparkles, color: 'from-teal-500 to-cyan-500', count: 1890 },
];

export const Categories = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BlurText
            text="Browse Categories"
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
            Find creators in your favorite categories
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categoryData.map((category, index) => (
            <CategoryCard key={category.name} category={category} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

const CategoryCard = ({
  category,
  index,
}: {
  category: { name: string; icon: any; color: string; count: number };
  index: number;
}) => {
  const Icon = category.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link
        to={`/explore?category=${encodeURIComponent(category.name)}`}
        className="block group"
      >
        <div className={`bg-gradient-to-br ${category.color} rounded-2xl p-6 text-white transition-transform hover:scale-105 hover:shadow-xl`}>
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Icon className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-semibold mb-1">{category.name}</h3>
          <p className="text-white/80 text-sm">{category.count.toLocaleString()} creators</p>
        </div>
      </Link>
    </motion.div>
  );
};
