import { Link } from 'react-router-dom';
import { ArrowRight, Users, Wallet, Shield, Zap, Star, TrendingUp, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../components/ui';
import { Logo } from '../components/ui/Logo';
import { useAuthStore } from '../store/authStore';
import LiquidEther from '../components/ui/LiquidEther';
import BlurText from '../components/ui/BlurText';
import { MockCreatorCard } from '../components/creator/MockCreatorCard';
import { mockCreators } from '../data/mockCreators';

export const Home = () => {
  const { user } = useAuthStore();
  const featuredCreators = mockCreators.slice(0, 4);
  const trendingCreators = mockCreators.slice(4, 8);

  return (
    <div className="relative">
      {/* Full-page LiquidEther Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900" style={{ zIndex: 0 }}>
        <LiquidEther
          colors={['#5227FF', '#FF9FFC', '#B19EEF']}
          mouseForce={20}
          cursorSize={100}
          isViscous={false}
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.5}
          autoIntensity={2.2}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative text-white min-h-screen flex items-center pt-24" style={{ zIndex: 10 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20" style={{ position: 'relative', zIndex: 10 }}>
          <div className="max-w-3xl" style={{ position: 'relative', zIndex: 10 }}>
            <BlurText
              text="Support creators you love"
              delay={100}
              animateBy="words"
              direction="top"
              className="text-4xl md:text-6xl font-bold leading-tight drop-shadow-lg"
            />
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-xl md:text-2xl mt-6 text-white/90 drop-shadow-md"
            >
              Subscribe to your favorite creators, get exclusive content, and help them grow. 
              Powered by blockchain for transparent, instant payments.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 mt-10"
              style={{ position: 'relative', zIndex: 100 }}
            >
              <Link to="/explore" className="inline-block" style={{ position: 'relative', zIndex: 100 }}>
                <button className="px-8 py-4 text-lg font-semibold rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 flex items-center gap-2">
                  Explore Creators
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              {user ? (
                <Link to="/dashboard" className="inline-block" style={{ position: 'relative', zIndex: 100 }}>
                  <button className="px-8 py-4 text-lg font-semibold rounded-xl border-2 border-white/80 text-white hover:bg-white/20 backdrop-blur-sm shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300">
                    Go to Dashboard
                  </button>
                </Link>
              ) : (
                <Link to="/login" className="inline-block" style={{ position: 'relative', zIndex: 100 }}>
                  <button className="px-8 py-4 text-lg font-semibold rounded-xl border-2 border-white/80 text-white hover:bg-white/20 backdrop-blur-sm shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300">
                    Login with Hive
                  </button>
                </Link>
              )}
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="flex flex-wrap gap-8 mt-16"
            >
              <div>
                <p className="text-3xl font-bold">10K+</p>
                <p className="text-white/70">Active Creators</p>
              </div>
              <div>
                <p className="text-3xl font-bold">500K+</p>
                <p className="text-white/70">Subscribers</p>
              </div>
              <div>
                <p className="text-3xl font-bold">50K+ HBD</p>
                <p className="text-white/70">Paid to Creators</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Creators Section */}
      <section className="relative py-20 bg-white/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium text-indigo-600 uppercase tracking-wide">Featured</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Top Creators
              </h2>
              <p className="text-gray-600 mt-2">Discover the most popular creators on our platform</p>
            </div>
            <Link to="/explore" className="hidden sm:flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCreators.map((creator, index) => (
              <MockCreatorCard key={creator.id} creator={creator} index={index} />
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link to="/explore">
              <Button variant="outline">View All Creators</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 bg-gray-50/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <BlurText
              text="Why CreatorHub?"
              delay={80}
              animateBy="words"
              direction="bottom"
              className="text-3xl md:text-4xl font-bold text-gray-900 justify-center"
            />
            <p className="text-xl text-gray-600 mt-4 max-w-2xl mx-auto">
              A modern platform built for Indian creators and their supporters
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={Users}
              title="Direct Support"
              description="100% of your subscription goes to creators (minus small platform fee)"
              index={0}
            />
            <FeatureCard
              icon={Wallet}
              title="Instant Payments"
              description="No waiting for payouts. Creators receive funds instantly via blockchain"
              index={1}
            />
            <FeatureCard
              icon={Shield}
              title="Transparent"
              description="All transactions recorded on Hive blockchain. Fully auditable"
              index={2}
            />
            <FeatureCard
              icon={Zap}
              title="Easy to Use"
              description="Web2 experience with Web3 benefits. No crypto knowledge required"
              index={3}
            />
          </div>
        </div>
      </section>

      {/* Trending Creators Section */}
      <section className="relative py-20 bg-white/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-green-600 uppercase tracking-wide">Trending</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Rising Stars
              </h2>
              <p className="text-gray-600 mt-2">Creators gaining momentum this week</p>
            </div>
            <Link to="/explore" className="hidden sm:flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium">
              Discover More <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingCreators.map((creator, index) => (
              <MockCreatorCard key={creator.id} creator={creator} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-20 bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">How It Works</h2>
            <p className="text-xl text-white/80 mt-4">Get started in three simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number="1"
              title="Connect Your Wallet"
              description="Sign in with your Hive account or create one in seconds"
              index={0}
            />
            <StepCard
              number="2"
              title="Find Creators"
              description="Browse and discover creators across various categories"
              index={1}
            />
            <StepCard
              number="3"
              title="Subscribe & Support"
              description="Choose a tier and start supporting your favorite creators"
              index={2}
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-20 bg-gray-50/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Heart className="w-5 h-5 text-red-500" />
              <span className="text-sm font-medium text-red-500 uppercase tracking-wide">Testimonials</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Loved by Creators
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="CreatorHub has transformed how I connect with my audience. The instant payments are a game-changer!"
              author="Priya Sharma"
              role="Digital Artist"
              avatar="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
              index={0}
            />
            <TestimonialCard
              quote="Finally, a platform that understands Indian creators. The blockchain transparency builds real trust."
              author="Rahul Tech"
              role="Tech Reviewer"
              avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
              index={1}
            />
            <TestimonialCard
              quote="My subscribers love the exclusive content feature. It's helped me grow my community significantly."
              author="Ananya Music"
              role="Singer"
              avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"
              index={2}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 bg-gray-900/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <BlurText
            text="Ready to start creating?"
            delay={80}
            animateBy="words"
            direction="bottom"
            className="text-3xl md:text-4xl font-bold text-white justify-center"
          />
          <p className="text-xl text-gray-300 mt-4 max-w-2xl mx-auto">
            Join thousands of creators earning from their passion. Set up your page in minutes.
          </p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-10"
          >
            <Link to={user ? '/settings' : '/login'}>
              <Button size="lg" className="shadow-lg">
                {user ? 'Become a Creator' : 'Start Creating'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, description, index }: { icon: any; title: string; description: string; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-50px' }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4">
      <Icon className="w-7 h-7 text-indigo-600" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </motion.div>
);

const StepCard = ({ number, title, description, index }: { number: string; title: string; description: string; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.15 }}
    className="text-center"
  >
    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
      {number}
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-white/80">{description}</p>
  </motion.div>
);

const TestimonialCard = ({ quote, author, role, avatar, index }: { quote: string; author: string; role: string; avatar: string; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="bg-white p-6 rounded-2xl shadow-sm"
  >
    <p className="text-gray-600 italic mb-4">"{quote}"</p>
    <div className="flex items-center gap-3">
      <img src={avatar} alt={author} className="w-12 h-12 rounded-full object-cover" />
      <div>
        <p className="font-semibold text-gray-900">{author}</p>
        <p className="text-sm text-gray-500">{role}</p>
      </div>
    </div>
  </motion.div>
);
