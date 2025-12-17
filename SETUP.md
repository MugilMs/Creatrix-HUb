# Creatrix Hub - Setup Guide

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd creator-platform
npm install
```

### 2. Environment Setup

**IMPORTANT: Never commit `.env` files!**

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your actual credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Platform Configuration
VITE_PLATFORM_COMMISSION=0.10
VITE_PLATFORM_HIVE_ACCOUNT=your_platform_hive_account
```

### 3. Supabase Setup

1. Create a Supabase project at https://supabase.com
2. Run the SQL migrations in `supabase/schema.sql`
3. Enable Row Level Security (RLS) with `supabase/fix-rls.sql`
4. Copy your project URL and anon key to `.env`

### 4. Hive Keychain

Users need to install Hive Keychain:
- Chrome: https://chrome.google.com/webstore
- Firefox: https://addons.mozilla.org/firefox
- Brave: Use Chrome extension

### 5. Run Development Server

```bash
npm run dev
```

Visit http://localhost:5173

## 🔒 Security Checklist

Before going live:

- [ ] `.env` file is in `.gitignore`
- [ ] No private keys in code
- [ ] Supabase RLS policies enabled
- [ ] Rate limiting configured
- [ ] HTTPS enforced
- [ ] Content Security Policy set
- [ ] Error messages sanitized
- [ ] Dependencies updated

## 📝 Environment Variables Explained

### Required Variables

**VITE_SUPABASE_URL**
- Your Supabase project URL
- Format: `https://xxxxx.supabase.co`
- Safe to expose in frontend

**VITE_SUPABASE_ANON_KEY**
- Supabase anonymous key
- Safe to expose in frontend (with RLS enabled)
- Never use Service Role Key in frontend!

### Optional Variables

**VITE_PLATFORM_COMMISSION**
- Platform fee percentage (0.10 = 10%)
- Default: 0.10

**VITE_PLATFORM_HIVE_ACCOUNT**
- Your platform's Hive account for receiving fees
- Must be a valid Hive username

## 🔐 Security Best Practices

### What We DO:
✅ Use Hive Keychain for all transactions
✅ Store only public data in database
✅ Validate all user inputs
✅ Use Supabase RLS for access control
✅ Rate limit API calls
✅ Sanitize error messages

### What We DON'T DO:
❌ Store private keys
❌ Ask for private keys
❌ Transmit sensitive data
❌ Store passwords (use Supabase Auth)
❌ Expose internal errors

## 🛠️ Development

### Project Structure

```
creator-platform/
├── src/
│   ├── components/     # React components
│   ├── pages/          # Page components
│   ├── lib/            # Utilities (hive, supabase, security)
│   ├── store/          # State management (Zustand)
│   ├── types/          # TypeScript types
│   └── data/           # Mock data
├── supabase/           # Database schemas
├── public/             # Static assets
└── .env                # Environment variables (DO NOT COMMIT)
```

### Key Files

- `src/lib/hive.ts` - Hive blockchain integration
- `src/lib/security.ts` - Security utilities
- `src/lib/supabase.ts` - Database client
- `SECURITY.md` - Security guidelines

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📦 Building for Production

```bash
npm run build
```

### Production Checklist

- [ ] Update environment variables for production
- [ ] Enable HTTPS
- [ ] Configure CSP headers
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Enable rate limiting
- [ ] Review Supabase RLS policies
- [ ] Test all payment flows
- [ ] Backup database

## 🚨 Troubleshooting

### Hive Keychain Not Found
- Install Hive Keychain extension
- Refresh the page
- Check browser console for errors

### Supabase Connection Failed
- Verify `.env` variables are correct
- Check Supabase project is active
- Verify RLS policies allow access

### Transaction Failed
- Check Hive account has sufficient balance
- Verify recipient username is correct
- Check Keychain is unlocked
- Review transaction in Keychain popup

## 📚 Resources

- [Hive Documentation](https://developers.hive.io/)
- [Supabase Documentation](https://supabase.com/docs)
- [Hive Keychain](https://hive-keychain.com/)
- [Security Best Practices](./SECURITY.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

[Your License Here]

## 💬 Support

For issues or questions:
- GitHub Issues: [repository-url]/issues
- Email: support@creatrixhub.com
- Discord: [your-discord]

---

**Remember: Security first! Never commit sensitive data.**
