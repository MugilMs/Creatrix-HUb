import { Client } from '@hiveio/dhive';
import type { HiveSubscriptionPayload, HiveTipPayload } from '../types';
import {
  validateHiveUsername,
  validateAmount,
  verifyTransactionData,
  subscriptionRateLimiter,
  tipRateLimiter,
  getSafeErrorMessage,
  logSecurityEvent,
} from './security';

// Hive API nodes - using reliable public nodes
const HIVE_NODES = [
  'https://api.hive.blog',
  'https://api.deathwing.me',
  'https://hive-api.arcange.eu',
];

export const hiveClient = new Client(HIVE_NODES);

// Platform configuration - NEVER expose private keys
const PLATFORM_COMMISSION = parseFloat(import.meta.env.VITE_PLATFORM_COMMISSION || '0.10');

// Check if Hive Keychain is available
export const isKeychainAvailable = (): boolean => {
  return typeof window !== 'undefined' && !!(window as any).hive_keychain;
};

// Get Hive Keychain
const getKeychain = () => {
  if (!isKeychainAvailable()) {
    throw new Error('Hive Keychain not installed. Please install the browser extension.');
  }
  return (window as any).hive_keychain;
};

// Request Hive Keychain handshake (verify user owns account)
export const requestKeychainHandshake = (username: string): Promise<{ success: boolean; username: string }> => {
  return new Promise((resolve, reject) => {
    const keychain = getKeychain();
    const message = `Login to Creator Platform: ${Date.now()}`;
    
    keychain.requestSignBuffer(
      username,
      message,
      'Posting',
      (response: any) => {
        if (response.success) {
          resolve({ success: true, username });
        } else {
          reject(new Error(response.message || 'Keychain verification failed'));
        }
      }
    );
  });
};

// Subscribe to a creator using Hive Keychain
// This sends HBD to creator (minus platform fee) and broadcasts custom_json
// SECURITY: All signing happens in user's Keychain - we never touch private keys
export const subscribeToCreator = async (
  subscriberUsername: string,
  creatorHiveUsername: string,
  tierId: string,
  amountHBD: number
): Promise<{ success: boolean; txId: string }> => {
  // Security validations
  if (!validateHiveUsername(subscriberUsername)) {
    logSecurityEvent('Invalid subscriber username', { subscriberUsername });
    throw new Error('Invalid subscriber username');
  }
  if (!validateHiveUsername(creatorHiveUsername)) {
    logSecurityEvent('Invalid creator username', { creatorHiveUsername });
    throw new Error('Invalid creator username');
  }
  if (!validateAmount(amountHBD)) {
    logSecurityEvent('Invalid subscription amount', { amountHBD });
    throw new Error('Invalid subscription amount');
  }

  // Rate limiting
  if (!subscriptionRateLimiter.check(subscriberUsername)) {
    logSecurityEvent('Rate limit exceeded', { subscriberUsername, action: 'subscribe' });
    throw new Error('Too many subscription attempts. Please wait a moment.');
  }

  return new Promise((resolve, reject) => {
    const keychain = getKeychain();
    
    // Calculate platform fee and creator amount
    const platformFee = amountHBD * PLATFORM_COMMISSION;
    const creatorAmount = amountHBD - platformFee;
    
    // Subscription payload for custom_json
    const subscriptionPayload: HiveSubscriptionPayload = {
      type: 'subscription',
      creator: creatorHiveUsername,
      subscriber: subscriberUsername,
      tier_id: tierId,
      amount: amountHBD.toFixed(3),
      duration_days: 30,
      timestamp: Date.now(),
    };

    // First, transfer HBD to creator
    keychain.requestTransfer(
      subscriberUsername,
      creatorHiveUsername,
      creatorAmount.toFixed(3),
      JSON.stringify({ type: 'subscription', tier: tierId }),
      'HBD',
      (transferResponse: any) => {
        if (!transferResponse.success) {
          reject(new Error(transferResponse.message || 'Transfer failed'));
          return;
        }

        // Then broadcast custom_json to record subscription on-chain
        keychain.requestCustomJson(
          subscriberUsername,
          'creator_platform_subscription',
          'Posting',
          JSON.stringify(subscriptionPayload),
          'Subscribe to Creator',
          (jsonResponse: any) => {
            if (jsonResponse.success) {
              resolve({ 
                success: true, 
                txId: jsonResponse.result?.id || transferResponse.result?.id 
              });
            } else {
              // Transfer succeeded but custom_json failed - still consider it success
              console.warn('Custom JSON failed but transfer succeeded');
              resolve({ 
                success: true, 
                txId: transferResponse.result?.id 
              });
            }
          }
        );
      }
    );
  });
};

// Send a tip to creator
// SECURITY: All signing happens in user's Keychain - we never touch private keys
export const tipCreator = async (
  tipperUsername: string,
  creatorHiveUsername: string,
  amount: number,
  currency: 'HIVE' | 'HBD',
  message?: string
): Promise<{ success: boolean; txId: string }> => {
  // Security validations
  const validation = verifyTransactionData({
    from: tipperUsername,
    to: creatorHiveUsername,
    amount,
    currency,
  });

  if (!validation.valid) {
    logSecurityEvent('Invalid tip transaction', { error: validation.error });
    throw new Error(validation.error);
  }

  // Rate limiting
  if (!tipRateLimiter.check(tipperUsername)) {
    logSecurityEvent('Rate limit exceeded', { tipperUsername, action: 'tip' });
    throw new Error('Too many tip attempts. Please wait a moment.');
  }

  return new Promise((resolve, reject) => {
    const keychain = getKeychain();
    
    const tipPayload: HiveTipPayload = {
      type: 'tip',
      creator: creatorHiveUsername,
      tipper: tipperUsername,
      message,
    };

    keychain.requestTransfer(
      tipperUsername,
      creatorHiveUsername,
      amount.toFixed(3),
      JSON.stringify(tipPayload),
      currency,
      (response: any) => {
        if (response.success) {
          resolve({ success: true, txId: response.result?.id });
        } else {
          reject(new Error(response.message || 'Tip transfer failed'));
        }
      }
    );
  });
};

// Get account info from Hive
export const getHiveAccount = async (username: string) => {
  try {
    const accounts = await hiveClient.database.getAccounts([username]);
    return accounts[0] || null;
  } catch (error) {
    console.error('Failed to fetch Hive account:', error);
    return null;
  }
};

// Get HBD balance
export const getHBDBalance = async (username: string): Promise<number> => {
  const account = await getHiveAccount(username);
  if (!account) return 0;
  return parseFloat(account.hbd_balance.toString().split(' ')[0]);
};

// Get HIVE balance
export const getHiveBalance = async (username: string): Promise<number> => {
  const account = await getHiveAccount(username);
  if (!account) return 0;
  return parseFloat(account.balance.toString().split(' ')[0]);
};

// Fetch subscription records from Hive custom_json operations
// This reads the blockchain to verify active subscriptions
export const getSubscriptionsForCreator = async (
  creatorUsername: string
): Promise<HiveSubscriptionPayload[]> => {
  try {
    // Query account history for custom_json operations
    const history = await hiveClient.database.call('get_account_history', [
      creatorUsername,
      -1,
      1000,
    ]);

    const subscriptions: HiveSubscriptionPayload[] = [];
    const now = Date.now();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

    for (const [, operation] of history) {
      if (operation.op[0] === 'custom_json') {
        const customJson = operation.op[1];
        if (customJson.id === 'creator_platform_subscription') {
          try {
            const payload: HiveSubscriptionPayload = JSON.parse(customJson.json);
            // Check if subscription is still active (within 30 days)
            if (payload.creator === creatorUsername && 
                now - payload.timestamp < thirtyDaysMs) {
              subscriptions.push(payload);
            }
          } catch (e) {
            // Invalid JSON, skip
          }
        }
      }
    }

    return subscriptions;
  } catch (error) {
    console.error('Failed to fetch subscriptions:', error);
    return [];
  }
};

// Check if user is subscribed to creator
export const isUserSubscribed = async (
  subscriberUsername: string,
  creatorUsername: string
): Promise<boolean> => {
  const subscriptions = await getSubscriptionsForCreator(creatorUsername);
  return subscriptions.some(sub => sub.subscriber === subscriberUsername);
};

// Post content to Hive blockchain
export const postToHive = async (
  username: string,
  title: string,
  body: string,
  tags: string[] = ['creatorplatform'],
  metadata: Record<string, any> = {}
): Promise<{ success: boolean; permlink: string }> => {
  return new Promise((resolve, reject) => {
    const keychain = getKeychain();
    
    // Generate permlink from title
    const permlink = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Date.now();

    const jsonMetadata = JSON.stringify({
      app: 'creatorplatform/1.0',
      tags,
      ...metadata,
    });

    keychain.requestPost(
      username,
      title,
      body,
      '', // parent_permlink (empty for root post)
      '', // parent_author (empty for root post)
      jsonMetadata,
      permlink,
      '', // comment_options
      (response: any) => {
        if (response.success) {
          resolve({ success: true, permlink });
        } else {
          reject(new Error(response.message || 'Failed to post to Hive'));
        }
      }
    );
  });
};

// Get creator earnings from transfer history
export const getCreatorEarnings = async (
  creatorUsername: string,
  days: number = 30
): Promise<{ hbd: number; hive: number; subscriptions: number; tips: number }> => {
  try {
    const history = await hiveClient.database.call('get_account_history', [
      creatorUsername,
      -1,
      2000,
    ]);

    const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
    let hbd = 0;
    let hive = 0;
    let subscriptions = 0;
    let tips = 0;

    for (const [, operation] of history) {
      const timestamp = new Date(operation.timestamp + 'Z').getTime();
      if (timestamp < cutoffTime) continue;

      if (operation.op[0] === 'transfer') {
        const transfer = operation.op[1];
        if (transfer.to === creatorUsername) {
          const amount = parseFloat(transfer.amount.split(' ')[0]);
          const currency = transfer.amount.split(' ')[1];
          
          // Try to parse memo to categorize
          try {
            const memo = JSON.parse(transfer.memo);
            if (memo.type === 'subscription') {
              subscriptions++;
              if (currency === 'HBD') hbd += amount;
              else hive += amount;
            } else if (memo.type === 'tip') {
              tips++;
              if (currency === 'HBD') hbd += amount;
              else hive += amount;
            }
          } catch {
            // Regular transfer
            if (currency === 'HBD') hbd += amount;
            else hive += amount;
          }
        }
      }
    }

    return { hbd, hive, subscriptions, tips };
  } catch (error) {
    console.error('Failed to fetch earnings:', error);
    return { hbd: 0, hive: 0, subscriptions: 0, tips: 0 };
  }
};
