# Security Guidelines for Creatrix Hub

## 🔒 Security Best Practices

### 1. Environment Variables
**NEVER commit `.env` files to version control!**

All sensitive configuration should be in `.env` files:
```bash
# .env (NEVER COMMIT THIS FILE)
VITE_SUPABASE_URL=your_actual_supabase_url
VITE_SUPABASE_ANON_KEY=your_actual_anon_key
VITE_PLATFORM_COMMISSION=0.10
VITE_PLATFORM_HIVE_ACCOUNT=your_platform_account
```

### 2. Hive Keychain Security

**✅ SECURE - What We Do:**
- Use Hive Keychain browser extension for all transactions
- Never store or transmit private keys
- All signing happens in the user's browser via Keychain
- Users maintain full control of their keys

**❌ NEVER DO:**
- Store Hive private keys in code
- Store Hive private keys in database
- Transmit private keys over network
- Ask users for their private keys

### 3. User Data Protection

**Personal Information:**
- Only store necessary user data (username, email, public Hive username)
- Never store passwords (use Supabase Auth)
- Never store private keys or sensitive credentials
- Use Supabase Row Level Security (RLS) for data access control

**Transaction Data:**
- All Hive transactions are public on blockchain (by design)
- Only store transaction IDs, not sensitive details
- Subscription data is linked to public Hive usernames

### 4. Supabase Security

**Row Level Security (RLS):**
```sql
-- Users can only read their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Creators can only update their own profiles
CREATE POLICY "Creators can update own profile" ON creator_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Public can view creator profiles
CREATE POLICY "Anyone can view creator profiles" ON creator_profiles
  FOR SELECT USING (true);
```

**API Keys:**
- Use Supabase Anon Key (safe for client-side)
- Never expose Service Role Key in frontend
- Service Role Key should only be in backend/serverless functions

### 5. Frontend Security

**XSS Prevention:**
- React automatically escapes content
- Never use `dangerouslySetInnerHTML` without sanitization
- Validate and sanitize all user inputs

**CSRF Protection:**
- Supabase handles CSRF tokens automatically
- Use SameSite cookies
- Validate origin headers

### 6. Hive Blockchain Integration

**Safe Practices:**
```typescript
// ✅ CORRECT - Using Keychain
const keychain = window.hive_keychain;
keychain.requestTransfer(from, to, amount, memo, currency, callback);

// ❌ WRONG - Never do this
const privateKey = "5J..."; // NEVER STORE KEYS
```

**Transaction Verification:**
- Always verify transactions on Hive blockchain
- Check transaction IDs match
- Validate amounts and recipients
- Use memo fields for metadata only

### 7. Content Security Policy

Add to `index.html`:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' 'unsafe-eval'; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: https:; 
               connect-src 'self' https://*.supabase.co https://api.hive.blog;">
```

### 8. Rate Limiting

**Implement rate limiting for:**
- API calls to Supabase
- Hive blockchain queries
- User actions (posting, subscribing)

### 9. Input Validation

**Always validate:**
- Email formats
- Usernames (alphanumeric, length limits)
- Amounts (positive numbers, reasonable limits)
- URLs (whitelist domains)
- File uploads (type, size limits)

### 10. Audit Trail

**Log important actions:**
- Subscription creations
- Payment transactions
- Profile updates
- Failed authentication attempts

## 🚨 Security Checklist

Before deploying:

- [ ] All `.env` files are in `.gitignore`
- [ ] No private keys in code
- [ ] Supabase RLS policies are enabled
- [ ] Input validation on all forms
- [ ] Rate limiting implemented
- [ ] HTTPS enforced in production
- [ ] Content Security Policy configured
- [ ] Error messages don't leak sensitive info
- [ ] Dependencies are up to date
- [ ] Security headers configured

## 🔐 Key Management

**For Developers:**
1. Store `.env` files locally only
2. Use password manager for credentials
3. Rotate keys regularly
4. Use different keys for dev/staging/prod
5. Never share keys via email/chat

**For Users:**
1. Install Hive Keychain from official source
2. Never share private keys with anyone
3. Verify transaction details before signing
4. Use strong passwords for Keychain
5. Keep browser and extensions updated

## 📞 Reporting Security Issues

If you discover a security vulnerability:
1. **DO NOT** open a public issue
2. Email: security@creatrixhub.com
3. Include detailed description
4. Allow time for fix before disclosure

## 🔄 Regular Security Updates

- Review dependencies monthly
- Update Supabase SDK regularly
- Monitor Hive blockchain for issues
- Review access logs
- Update security policies as needed

---

**Remember: Security is everyone's responsibility!**
