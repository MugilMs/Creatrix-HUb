# CreatorHub - Creator Subscription Platform

A Patreon/Substack-like platform built with React, Supabase, and Hive blockchain.

## Tech Stack
- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Backend**: Supabase (Auth, DB, Storage)
- **Blockchain**: Hive (dhive) + Hive Keychain

## Setup

1. **Install dependencies**
```bash
npm install
```

2. **Configure environment**
```bash
cp .env.example .env
# Add your Supabase credentials
```

3. **Setup Supabase**
- Create a new Supabase project
- Run `supabase/schema.sql` in SQL Editor
- Copy URL and anon key to `.env`

4. **Run development server**
```bash
npm run dev
```

## Features
- Email/password authentication
- Optional Hive Keychain wallet connection
- Creator profiles with subscription tiers
- Public and subscriber-only posts
- HBD payments via Hive blockchain
- Tipping system
- Creator dashboard with earnings

## Blockchain Integration
All payments are processed on Hive blockchain via Keychain browser extension.
Subscriptions are recorded as `custom_json` operations for transparency.
