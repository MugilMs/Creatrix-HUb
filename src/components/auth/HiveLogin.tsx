import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { isKeychainAvailable, getHiveAccount } from '../../lib/hive';
import { Button, Input, Card, CardContent } from '../ui';

export const HiveLogin = () => {
  const [hiveUsername, setHiveUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { loginWithHive } = useAuthStore();
  const navigate = useNavigate();

  const keychainAvailable = isKeychainAvailable();

  const handleHiveLogin = async () => {
    if (!hiveUsername.trim()) {
      setError('Please enter your Hive username');
      return;
    }

    if (!keychainAvailable) {
      setError('Hive Keychain extension is required');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      // Verify account exists on Hive
      const account = await getHiveAccount(hiveUsername.toLowerCase().trim());
      if (!account) {
        setError('Hive account not found');
        setIsLoading(false);
        return;
      }

      await loginWithHive(hiveUsername.toLowerCase().trim());
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to login with Hive');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <Wallet className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Login with Hive Keychain</h3>
            <p className="text-sm text-gray-500">Secure, passwordless login</p>
          </div>
        </div>

        {!keychainAvailable && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">Hive Keychain Required</p>
                <p className="text-sm text-amber-700 mt-1">
                  Install the Hive Keychain browser extension to login.
                </p>
                <a
                  href="https://hive-keychain.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-sm text-amber-800 hover:text-amber-900 mt-2"
                >
                  <span>Get Hive Keychain</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <Input
            label="Hive Username"
            value={hiveUsername}
            onChange={(e) => setHiveUsername(e.target.value)}
            placeholder="Enter your Hive username (without @)"
            disabled={!keychainAvailable || isLoading}
            onKeyDown={(e) => e.key === 'Enter' && handleHiveLogin()}
          />

          <Button
            onClick={handleHiveLogin}
            className="w-full"
            disabled={!keychainAvailable || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4 mr-2" />
                Login with Keychain
              </>
            )}
          </Button>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          You'll be asked to sign a message to verify ownership
        </p>
      </CardContent>
    </Card>
  );
};
