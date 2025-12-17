import { useState } from 'react';
import { Wallet, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { isKeychainAvailable } from '../../lib/hive';
import { Button, Input, Card, CardContent, Modal } from '../ui';

interface ConnectHiveWalletProps {
  onSuccess?: () => void;
}

export const ConnectHiveWallet = ({ onSuccess }: ConnectHiveWalletProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hiveUsername, setHiveUsername] = useState('');
  const [error, setError] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const { connectHive, isHiveConnected, hiveUsername: connectedUsername, disconnectHive } = useAuthStore();

  const keychainAvailable = isKeychainAvailable();

  const handleConnect = async () => {
    if (!hiveUsername.trim()) {
      setError('Please enter your Hive username');
      return;
    }

    setError('');
    setIsConnecting(true);

    try {
      await connectHive(hiveUsername.toLowerCase().trim());
      setIsModalOpen(false);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  if (isHiveConnected) {
    return (
      <Card>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Hive Wallet Connected</p>
                <p className="text-sm text-gray-500">@{connectedUsername}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={disconnectHive}>
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Wallet className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Connect Hive Wallet</p>
                <p className="text-sm text-gray-500">Required for subscriptions & payments</p>
              </div>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>
              Connect
            </Button>
          </div>
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Connect Hive Wallet"
        size="md"
      >
        <div className="space-y-4">
          {!keychainAvailable && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800">Hive Keychain Required</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Please install the Hive Keychain browser extension to connect your wallet.
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
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <Input
            label="Hive Username"
            value={hiveUsername}
            onChange={(e) => setHiveUsername(e.target.value)}
            placeholder="Enter your Hive username (without @)"
            disabled={!keychainAvailable}
          />

          <p className="text-sm text-gray-500">
            You'll be asked to sign a message with Hive Keychain to verify ownership.
          </p>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConnect}
              isLoading={isConnecting}
              disabled={!keychainAvailable}
            >
              Connect Wallet
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
