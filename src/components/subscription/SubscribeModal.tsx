import { useState } from 'react';
import { Wallet, AlertCircle, CheckCircle, Loader2, ExternalLink } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useSubscriptionStore } from '../../store/subscriptionStore';
import { isKeychainAvailable, getHBDBalance } from '../../lib/hive';
import { Button, Modal } from '../ui';
import type { SubscriptionTier, CreatorProfile } from '../../types';

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier: SubscriptionTier;
  creator: CreatorProfile;
  onSuccess?: () => void;
}

type Step = 'confirm' | 'processing' | 'success' | 'error';

export const SubscribeModal = ({
  isOpen,
  onClose,
  tier,
  creator,
  onSuccess,
}: SubscribeModalProps) => {
  const { user, hiveUsername, isHiveConnected } = useAuthStore();
  const { subscribe } = useSubscriptionStore();
  
  const [step, setStep] = useState<Step>('confirm');
  const [error, setError] = useState('');
  const [balance, setBalance] = useState<number | null>(null);

  const keychainAvailable = isKeychainAvailable();

  // Check balance when modal opens
  useState(() => {
    if (isOpen && hiveUsername) {
      getHBDBalance(hiveUsername).then(setBalance);
    }
  });

  const handleSubscribe = async () => {
    if (!user || !hiveUsername) {
      setError('Please connect your Hive wallet first');
      return;
    }

    if (!keychainAvailable) {
      setError('Hive Keychain is required for payments');
      return;
    }

    if (balance !== null && balance < tier.price_hbd) {
      setError(`Insufficient HBD balance. You have ${balance.toFixed(3)} HBD`);
      return;
    }

    setStep('processing');
    setError('');

    try {
      await subscribe(
        user.id,
        hiveUsername,
        creator.id,
        creator.hive_username,
        tier.id,
        tier.price_hbd
      );
      
      setStep('success');
      setTimeout(() => {
        onSuccess?.();
        onClose();
        setStep('confirm');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Subscription failed');
      setStep('error');
    }
  };

  const handleClose = () => {
    if (step !== 'processing') {
      onClose();
      setStep('confirm');
      setError('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Subscribe" size="md">
      {step === 'confirm' && (
        <div className="space-y-6">
          {/* Subscription Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{tier.name}</h3>
                <p className="text-sm text-gray-500">@{creator.hive_username}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{tier.price_hbd} HBD</p>
                <p className="text-sm text-gray-500">per month</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">{tier.description}</p>
          </div>

          {/* Wallet Status */}
          {!isHiveConnected ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800">Wallet Not Connected</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Connect your Hive wallet in Settings to subscribe.
                  </p>
                </div>
              </div>
            </div>
          ) : !keychainAvailable ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800">Keychain Required</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Install Hive Keychain to make payments.
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
          ) : (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Wallet className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">@{hiveUsername}</span>
                </div>
                {balance !== null && (
                  <span className="text-sm text-green-700">
                    Balance: {balance.toFixed(3)} HBD
                  </span>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Payment Breakdown */}
          <div className="border-t pt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Subscription</span>
              <span className="text-gray-900">{tier.price_hbd} HBD</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Platform fee (10%)</span>
              <span className="text-gray-900">{(tier.price_hbd * 0.1).toFixed(3)} HBD</span>
            </div>
            <div className="flex justify-between font-semibold border-t pt-2">
              <span>Creator receives</span>
              <span>{(tier.price_hbd * 0.9).toFixed(3)} HBD</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSubscribe}
              className="flex-1"
              disabled={!isHiveConnected || !keychainAvailable}
            >
              <Wallet className="w-4 h-4 mr-2" />
              Pay {tier.price_hbd} HBD
            </Button>
          </div>
        </div>
      )}

      {step === 'processing' && (
        <div className="text-center py-8">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Payment</h3>
          <p className="text-gray-600">
            Please confirm the transaction in Hive Keychain...
          </p>
        </div>
      )}

      {step === 'success' && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Subscription Active!</h3>
          <p className="text-gray-600">
            You now have access to {creator.display_name}'s exclusive content.
          </p>
        </div>
      )}

      {step === 'error' && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Failed</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => setStep('confirm')}>Try Again</Button>
        </div>
      )}
    </Modal>
  );
};
