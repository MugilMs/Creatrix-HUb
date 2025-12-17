import { Check } from 'lucide-react';
import { Card, CardContent, Button } from '../ui';
import type { SubscriptionTier } from '../../types';

interface SubscriptionTierCardProps {
  tier: SubscriptionTier;
  isSubscribed?: boolean;
  onSubscribe?: () => void;
}

export const SubscriptionTierCard = ({
  tier,
  isSubscribed,
  onSubscribe,
}: SubscriptionTierCardProps) => {
  return (
    <Card className={`${isSubscribed ? 'ring-2 ring-indigo-500' : ''}`}>
      <CardContent>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{tier.name}</h3>
            <p className="text-gray-600 text-sm mt-1">{tier.description}</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-gray-900">
              {tier.price_hbd}
            </span>
            <span className="text-gray-500 text-sm"> HBD/mo</span>
          </div>
        </div>

        <ul className="space-y-2 mb-6">
          {tier.benefits.map((benefit, index) => (
            <li key={index} className="flex items-start space-x-2">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700 text-sm">{benefit}</span>
            </li>
          ))}
        </ul>

        {isSubscribed ? (
          <Button variant="secondary" className="w-full" disabled>
            Subscribed
          </Button>
        ) : (
          <Button className="w-full" onClick={onSubscribe}>
            Subscribe for {tier.price_hbd} HBD
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
