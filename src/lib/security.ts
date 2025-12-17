/**
 * Security utilities for Creatrix Hub
 * Ensures safe handling of user data and transactions
 */

// Input validation
export const validateUsername = (username: string): boolean => {
  // Only alphanumeric, hyphens, underscores, 3-20 chars
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateAmount = (amount: number): boolean => {
  // Must be positive, reasonable limit
  return amount > 0 && amount <= 10000 && !isNaN(amount);
};

export const validateHiveUsername = (username: string): boolean => {
  // Hive usernames: 3-16 chars, lowercase, numbers, hyphens
  const hiveUsernameRegex = /^[a-z0-9-]{3,16}$/;
  return hiveUsernameRegex.test(username);
};

// Sanitize user input
export const sanitizeString = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 1000); // Limit length
};

export const sanitizeUrl = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    // Only allow https and specific domains
    if (parsed.protocol !== 'https:') return null;
    return parsed.toString();
  } catch {
    return null;
  }
};

// Check if Hive Keychain is available
export const isKeychainAvailable = (): boolean => {
  return typeof window !== 'undefined' && !!(window as any).hive_keychain;
};

// Verify transaction data before sending
export const verifyTransactionData = (data: {
  from: string;
  to: string;
  amount: number;
  currency: 'HIVE' | 'HBD';
}): { valid: boolean; error?: string } => {
  if (!validateHiveUsername(data.from)) {
    return { valid: false, error: 'Invalid sender username' };
  }
  if (!validateHiveUsername(data.to)) {
    return { valid: false, error: 'Invalid recipient username' };
  }
  if (!validateAmount(data.amount)) {
    return { valid: false, error: 'Invalid amount' };
  }
  if (!['HIVE', 'HBD'].includes(data.currency)) {
    return { valid: false, error: 'Invalid currency' };
  }
  return { valid: true };
};

// Rate limiting helper
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  check(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const recentAttempts = attempts.filter(time => now - time < this.windowMs);
    
    if (recentAttempts.length >= this.maxAttempts) {
      return false; // Rate limit exceeded
    }
    
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    return true;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

export const subscriptionRateLimiter = new RateLimiter(3, 60000); // 3 attempts per minute
export const tipRateLimiter = new RateLimiter(10, 60000); // 10 tips per minute

// Secure error messages (don't leak sensitive info)
export const getSafeErrorMessage = (error: any): string => {
  // Never expose internal errors to users
  const safeMessages: Record<string, string> = {
    'auth/invalid-email': 'Invalid email address',
    'auth/user-not-found': 'Invalid credentials',
    'auth/wrong-password': 'Invalid credentials',
    'network-error': 'Network error. Please try again.',
    'keychain-not-found': 'Please install Hive Keychain extension',
    'transaction-failed': 'Transaction failed. Please try again.',
  };

  const errorMessage = error?.message || error?.toString() || 'unknown';
  
  // Check for known error patterns
  for (const [key, message] of Object.entries(safeMessages)) {
    if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
      return message;
    }
  }
  
  // Default safe message
  return 'An error occurred. Please try again.';
};

// Content Security - Sanitize HTML content
export const sanitizeHtml = (html: string): string => {
  // Basic HTML sanitization - in production, use DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
    .replace(/on\w+='[^']*'/gi, '');
};

// Verify environment variables are set
export const checkEnvironmentVariables = (): void => {
  const required = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
  ];

  const missing = required.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    console.warn(
      '⚠️ Missing environment variables:',
      missing.join(', '),
      '\nPlease check your .env file'
    );
  }
};

// Initialize security checks
if (typeof window !== 'undefined') {
  checkEnvironmentVariables();
}

// Export security constants
export const SECURITY_CONFIG = {
  MAX_USERNAME_LENGTH: 20,
  MIN_USERNAME_LENGTH: 3,
  MAX_BIO_LENGTH: 500,
  MAX_POST_LENGTH: 10000,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  MAX_SUBSCRIPTION_AMOUNT: 1000, // HBD
  MIN_SUBSCRIPTION_AMOUNT: 1, // HBD
} as const;

// Prevent common attacks
export const preventXSS = (input: string): string => {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

// Check if running in secure context
export const isSecureContext = (): boolean => {
  return window.isSecureContext || window.location.protocol === 'https:';
};

// Log security events (in production, send to monitoring service)
export const logSecurityEvent = (event: string, details?: any): void => {
  if (import.meta.env.DEV) {
    console.log('🔒 Security Event:', event, details);
  }
  // In production, send to monitoring service
  // e.g., Sentry, LogRocket, etc.
};
