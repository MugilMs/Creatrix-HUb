import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, Users, DollarSign, 
  Plus, Loader2, TrendingUp, Edit, Trash2 
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCreatorStore } from '../store/creatorStore';
import { Button, Card, CardContent, Modal } from '../components/ui';
import { PostEditor } from '../components/post/PostEditor';
import type { Post } from '../types';

import { EarningsChart } from '../components/dashboard/EarningsChart';

type Tab = 'overview' | 'posts' | 'subscribers' | 'analytics';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user, hiveUsername } = useAuthStore();
  const { 
    profile, posts, subscribers, earnings, isLoading,
    fetchCreatorProfile, fetchPosts, fetchSubscribers, fetchEarnings,
    createPost, updatePost, deletePost
  } = useCreatorStore();

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'creator') {
      navigate('/settings');
      return;
    }
    
    fetchCreatorProfile(user.id);
  }, [user]);

  useEffect(() => {
    if (profile) {
      fetchPosts(profile.id);
      fetchSubscribers(profile.id);
      if (hiveUsername) {
        fetchEarnings(hiveUsername);
      }
    }
  }, [profile, hiveUsername]);

  const handleCreatePost = async (data: Omit<Post, 'id' | 'created_at' | 'updated_at'>) => {
    await createPost(data);
    setIsEditorOpen(false);
  };

  const handleUpdatePost = async (data: Omit<Post, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingPost) {
      await updatePost(editingPost.id, data);
      setEditingPost(null);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      await deletePost(postId);
    }
  };

  if (isLoading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'posts', label: 'Posts', icon: FileText },
    { id: 'subscribers', label: 'Subscribers', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  ] as const;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Creator Dashboard</h1>
          <p className="text-gray-600">Manage your content and subscribers</p>
        </div>
        <Button onClick={() => setIsEditorOpen(true)} className="mt-4 md:mt-0">
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors whitespace-nowrap ${
              activeTab === id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Users}
              label="Subscribers"
              value={profile.subscriber_count}
              color="indigo"
            />
            <StatCard
              icon={FileText}
              label="Posts"
              value={posts.length}
              color="purple"
            />
            <StatCard
              icon={DollarSign}
              label="Earnings (30d)"
              value={`${earnings.hbd.toFixed(2)} HBD`}
              color="green"
            />
            <StatCard
              icon={TrendingUp}
              label="Tips Received"
              value={earnings.tips}
              color="amber"
            />
          </div>

          {/* Recent Posts */}
          <Card>
            <CardContent>
              <h3 className="font-semibold text-gray-900 mb-4">Recent Posts</h3>
              {posts.slice(0, 5).map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">{post.title}</p>
                    <p className="text-sm text-gray-500">
                      {post.visibility === 'subscribers' ? '🔒 Subscribers' : '🌐 Public'}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingPost(post)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'posts' && (
        <div className="space-y-4">
          {posts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-600 mb-4">Create your first post to engage with subscribers</p>
                <Button onClick={() => setIsEditorOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Post
                </Button>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id}>
                <CardContent>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{post.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {post.visibility === 'subscribers' ? '🔒 Subscribers only' : '🌐 Public'} • 
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-gray-600 mt-2 line-clamp-2">{post.excerpt || post.content}</p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => setEditingPost(post)}
                        className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-gray-100"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'subscribers' && (
        <Card>
          <CardContent>
            {subscribers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No subscribers yet</h3>
                <p className="text-gray-600">Share your profile to get your first subscribers</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600">{subscribers.length} active subscribers</p>
                {/* Subscriber list would go here */}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'analytics' && hiveUsername && (
        <EarningsChart hiveUsername={hiveUsername} />
      )}

      {/* Post Editor Modal */}
      <Modal
        isOpen={isEditorOpen || !!editingPost}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingPost(null);
        }}
        title={editingPost ? 'Edit Post' : 'Create New Post'}
        size="lg"
      >
        <PostEditor
          creatorId={profile.id}
          initialData={editingPost || undefined}
          onSubmit={editingPost ? handleUpdatePost : handleCreatePost}
          onCancel={() => {
            setIsEditorOpen(false);
            setEditingPost(null);
          }}
        />
      </Modal>
    </div>
  );
};

const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  color 
}: { 
  icon: any; 
  label: string; 
  value: string | number; 
  color: 'indigo' | 'purple' | 'green' | 'amber';
}) => {
  const colors = {
    indigo: 'bg-indigo-100 text-indigo-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
    amber: 'bg-amber-100 text-amber-600',
  };

  return (
    <Card>
      <CardContent>
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-xl font-semibold text-gray-900">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
