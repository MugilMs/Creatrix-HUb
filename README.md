# Creatrix Hub

A decentralized creator platform built on Hive blockchain, enabling creators to monetize their content through subscriptions and tips.

## Features

- **Hive Blockchain Integration**: Secure authentication and payments using Hive Keychain
- **Creator Subscriptions**: Multi-tier subscription system for exclusive content
- **Tipping System**: Support creators with HIVE/HBD tips
- **Content Management**: Create and share posts with your subscribers
- **Dashboard Analytics**: Track earnings and subscriber growth
- **Mock Data Support**: Test the platform without blockchain connection

## Tech Stack

- React + TypeScript
- Vite
- Zustand (State Management)
- Supabase (Backend)
- Hive Blockchain
- Recharts (Analytics)

## Getting Started

1. Clone the repository
```bash
git clone https://github.com/MugilMs/Creatrix-HUb.git
cd creator-platform
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

4. Run the development server
```bash
npm run dev
```

## Environment Variables

Create a `.env` file with:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

## License

MIT
