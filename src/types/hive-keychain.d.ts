// Type declarations for Hive Keychain browser extension
interface HiveKeychainResponse {
  success: boolean;
  message?: string;
  result?: {
    id?: string;
    [key: string]: any;
  };
}

interface HiveKeychain {
  requestSignBuffer(
    username: string,
    message: string,
    keyType: 'Posting' | 'Active' | 'Memo',
    callback: (response: HiveKeychainResponse) => void
  ): void;

  requestTransfer(
    username: string,
    to: string,
    amount: string,
    memo: string,
    currency: 'HIVE' | 'HBD',
    callback: (response: HiveKeychainResponse) => void
  ): void;

  requestCustomJson(
    username: string,
    id: string,
    keyType: 'Posting' | 'Active',
    json: string,
    displayMsg: string,
    callback: (response: HiveKeychainResponse) => void
  ): void;

  requestPost(
    username: string,
    title: string,
    body: string,
    parent_permlink: string,
    parent_author: string,
    json_metadata: string,
    permlink: string,
    comment_options: string,
    callback: (response: HiveKeychainResponse) => void
  ): void;
}

declare global {
  interface Window {
    hive_keychain?: HiveKeychain;
  }
}

export {};
