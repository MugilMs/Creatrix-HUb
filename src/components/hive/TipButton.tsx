import { useState } from 'react';
import { Heart, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { tipCreator, isKeychainAvailable } from '../../lib/hive';
import { Button, Input, Modal } from '../ui';

interface TipButtonProps {
  creatorHiveUsername: string;
  creatorDisplayName: string;
}

export const TipButton = ({ creatorHiveUsername, creatorDisplayName }: TipButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState('1');
  const [currency, setCurrency] = useState<'HIVE' | 'HBD'>('HBD');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const { isHiveConnected, hiveUsername } = useAuthStore();

  const handleTip = async () => {
    if (!hiveUsername) return;
    
    const tipAmount = parseFloat(amount);
    if (isNaN(tipAmount) || tipAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setError('');
    setIsProcessing(true);

    try {
      await tipCreator(hiveUsername, creatorHiveUsername, tipAmount, currency, message);
      setSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess(false);
        setAmount('1');
        setMessage('');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to send tip');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isHiveConnected || !isKeychainAvailable()) {
    return null;
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsModalOpen(true)}
        className="flex items-center space-x-2"
      >
        <Heart className="w-4 h-4" />
        <span>Tip</span>
      </Button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Tip ${creatorDisplayName}`}
        size="sm"
      >
        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Tip Sent!</h3>
            <p className="text-gray-600 mt-1">Thank you for supporting {creatorDisplayName}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  label="Amount"
                  type="number"
                  min="0.001"
                  step="0.001"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as 'HIVE' | 'HBD')}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                >
                  <option value="HBD">HBD</option>
                  <option value="HIVE">HIVE</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message (optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Say something nice..."
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                maxLength={200}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleTip} isLoading={isProcessing}>
                Send {amount} {currency}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};
