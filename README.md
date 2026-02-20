# Final Form - AI-Powered Fitness & Nutrition

An AI-powered fitness companion with personalized workouts, smart nutrition tracking, and progress analytics. Built with React, Capacitor, and Supabase.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: shadcn/ui, Tailwind CSS, Framer Motion
- **Mobile**: Capacitor (iOS & Android)
- **Backend**: Supabase (Auth, Database, Edge Functions)
- **AI**: Google Gemini (via OpenAI-compatible API)
- **Payments**: RevenueCat (iOS in-app subscriptions)
- **Offline**: Service Worker + IndexedDB

## Getting Started

### Prerequisites

- Node.js 20+ (install with [nvm](https://github.com/nvm-sh/nvm))
- npm

### Development

```sh
# Clone the repository
git clone https://github.com/Justraymond99/final-form-ai.git
cd final-form-ai

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:8080`.

### Build for Production

```sh
npm run build
```

### iOS / Android

```sh
# Build web assets first
npm run build

# Add platform (first time only)
npx cap add ios
npx cap add android

# Sync web assets to native projects
npx cap sync

# Open in IDE
npx cap open ios       # Opens Xcode
npx cap open android   # Opens Android Studio
```

## Environment Variables

### Frontend (.env)

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

### Supabase Edge Functions

Set these in your Supabase project dashboard under Edge Functions > Secrets:

```
GEMINI_API_KEY=your-google-gemini-api-key
```

To get a Gemini API key:
1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Create an API key
3. Add it to Supabase Edge Functions secrets as `GEMINI_API_KEY`

## Project Structure

```
src/
  pages/          # Route pages (lazy-loaded)
  components/     # React components
  hooks/          # Custom React hooks
  lib/            # Utility libraries
  integrations/   # Supabase client & types
  test/           # Test files

supabase/
  functions/      # Edge Functions (AI, payments, search)
  migrations/     # Database migrations

ios/              # iOS native project (Capacitor)
public/           # Static assets, PWA manifest, service worker
```

## Key Features

- AI workout generation with multi-week periodization
- AI nutrition planning with voice food logging
- Barcode scanning for food lookup
- Progress tracking (weight, measurements, photos)
- AI fitness coach chatbot (Athena)
- Offline support with background sync
- RevenueCat subscription management
- Apple Health integration (iOS)

## Documentation

- [Architecture](ARCHITECTURE.md) - System design and data flows
- [App Store Guide](APP_STORE_ASSETS.md) - iOS/Android submission checklist
- [Testing Guide](TESTING_GUIDE.md) - Comprehensive test plan
- [Google OAuth Setup](GOOGLE_OAUTH_SETUP.md) - Authentication configuration

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server (port 8080) |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |
