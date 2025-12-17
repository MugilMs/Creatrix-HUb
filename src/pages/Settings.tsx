import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Wallet, Shield, Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCreatorStore } from '../store/creatorStore';
import { Button, Input, Card, CardContent, Modal } from '../components/ui';
import { ConnectHiveWallet } from '../components/hive/ConnectHiveWallet';


type Tab = 'profile' | 'wallet' | 'creator';

export const Settings = () => {
  const navigate = useNavigate();
  const { user, isHiveConnected, hiveUsername, becomeCreator, updateProfile } = useAuthStore();
  const { profile, tiers, fetchCreatorProfile, fetchTiers, updateCreatorProfile, createTier, deleteTier } = useCreatorStore();

  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [username, setUsername] = useState(user?.username || '');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Creator settings
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [coverImage, setCoverImage] = useState('');

  // Tier modal
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);
  const [tierName, setTierName] = useState('');
  const [tierDescription, setTierDescription] = useState('');
  const [tierPrice, setTierPrice] = useState('5');
  const [tierBenefits, setTierBenefits] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.role === 'creator') {
      fetchCreatorProfile(user.id);
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name);
      setBio(profile.bio);
      setCoverImage(profile.cover_image || '');
      fetchTiers(profile.id);
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      await updateProfile({ username });
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBecomeCreator = async () => {
    setMessage(null);
    try {
      await becomeCreator();
      setMessage({ type: 'success', text: 'You are now a creator! Setting up your profile...' });
      setTimeout(() => {
        fetchCreatorProfile(user!.id);
      }, 1000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to become creator' });
    }
  };

  const handleSaveCreatorProfile = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      await updateCreatorProfile({
        display_name: displayName,
        bio,
        cover_image: coverImage || undefined,
      });
      setMessage({ type: 'success', text: 'Creator profile updated' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateTier = async () => {
    if (!profile) return;
    
    try {
      await createTier({
        creator_id: profile.id,
        name: tierName,
        description: tierDescription,
        price_hbd: parseFloat(tierPrice),
        benefits: tierBenefits.split('\n').filter(b => b.trim()),
      });
      setIsTierModalOpen(false);
      setTierName('');
      setTierDescription('');
      setTierPrice('5');
      setTierBenefits('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to create tier' });
    }
  };

  const handleDeleteTier = async (tierId: string) => {
    if (confirm('Delete this subscription tier?')) {
      await deleteTier(tierId);
    }
  };

  if (!user) return null;

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'creator', label: 'Creator', icon: Shield },
  ] as const;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
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

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <Card>
          <CardContent className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Account Settings</h2>
            
            <Input
              label="Email"
              value={user.email}
              disabled
              className="bg-gray-50"
            />
            
            <Input
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <div className="flex justify-end">
              <Button onClick={handleSaveProfile} isLoading={isSaving}>
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Wallet Tab */}
      {activeTab === 'wallet' && (
        <div className="space-y-6">
          <ConnectHiveWallet />
          
          {isHiveConnected && (
            <Card>
              <CardContent>
                <h3 className="font-semibold text-gray-900 mb-4">Wallet Info</h3>
                <p className="text-gray-600">
                  Your Hive wallet (@{hiveUsername}) is connected. You can now subscribe to creators and receive payments.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Creator Tab */}
      {activeTab === 'creator' && (
        <div className="space-y-6">
          {user.role !== 'creator' ? (
            <Card>
              <CardContent className="text-center py-8">
                <Shield className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Become a Creator</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Start earning by sharing exclusive content with your subscribers. 
                  {!isHiveConnected && ' Connect your Hive wallet first.'}
                </p>
                <Button 
                  onClick={handleBecomeCreator} 
                  disabled={!isHiveConnected}
                >
                  Become a Creator
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Creator Profile */}
              <Card>
                <CardContent className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900">Creator Profile</h2>
                  
                  <Input
                    label="Display Name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      placeholder="Tell your subscribers about yourself..."
                    />
                  </div>
                  
                  <Input
                    label="Cover Image URL"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://example.com/cover.jpg"
                  />

                  <div className="flex justify-end">
                    <Button onClick={handleSaveCreatorProfile} isLoading={isSaving}>
                      Save Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Subscription Tiers */}
              <Card>
                <CardContent>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Subscription Tiers</h2>
                    <Button size="sm" onClick={() => setIsTierModalOpen(true)}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Tier
                    </Button>
                  </div>

                  {tiers.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No subscription tiers yet. Create one to start accepting subscribers.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {tiers.map((tier) => (
                        <div
                          key={tier.id}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                        >
                          <div>
                            <h4 className="font-medium text-gray-900">{tier.name}</h4>
                            <p className="text-sm text-gray-500">{tier.price_hbd} HBD/month</p>
                          </div>
                          <button
                            onClick={() => handleDeleteTier(tier.id)}
                            className="p-2 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* Create Tier Modal */}
      <Modal
        isOpen={isTierModalOpen}
        onClose={() => setIsTierModalOpen(false)}
        title="Create Subscription Tier"
      >
        <div className="space-y-4">
          <Input
            label="Tier Name"
            value={tierName}
            onChange={(e) => setTierName(e.target.value)}
            placeholder="e.g., Basic, Premium, VIP"
          />
          
          <Input
            label="Description"
            value={tierDescription}
            onChange={(e) => setTierDescription(e.target.value)}
            placeholder="What subscribers get at this tier"
          />
          
          <Input
            label="Price (HBD/month)"
            type="number"
            min="1"
            step="0.1"
            value={tierPrice}
            onChange={(e) => setTierPrice(e.target.value)}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Benefits (one per line)
            </label>
            <textarea
              value={tierBenefits}
              onChange={(e) => setTierBenefits(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="Access to exclusive posts&#10;Early access to content&#10;Monthly Q&A sessions"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setIsTierModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTier}>
              Create Tier
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
