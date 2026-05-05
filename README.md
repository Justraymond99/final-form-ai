# Final Form

AI-powered fitness and nutrition companion. Plan workouts, track meals, and get personalized coaching backed by AI.

## Tech Stack

- **Frontend**: Vite + React 18 + TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions, Storage)
- **AI**: Google Gemini 2.5 Flash via AI gateway
- **Payments**: Stripe
- **Mobile**: Capacitor (iOS + Android)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ and npm (install via [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- A Supabase project (for auth + database + edge functions)
- An AI gateway API key (for the AI features)

### Local Development

```sh
# 1. Clone the repository
git clone https://github.com/Justraymond99/final-form-ai.git
cd final-form-ai

# 2. Install dependencies
npm install

# 3. Configure environment variables
# Copy .env and fill in your Supabase project credentials
#   VITE_SUPABASE_PROJECT_ID
#   VITE_SUPABASE_PUBLISHABLE_KEY
#   VITE_SUPABASE_URL

# 4. Start the dev server
npm run dev
```

The app will be available at [http://localhost:8080](http://localhost:8080).

### Building for Production

```sh
npm run build      # production build to dist/
npm run preview    # preview the production build locally
npm run lint       # run ESLint
```

## Project Structure

```
src/
  pages/          Top-level routes (Auth, Dashboard, Workouts, Nutrition, Goals, ...)
  components/     Reusable UI and feature components
  hooks/          Custom React hooks (state, API, analytics)
  lib/            Utilities, validation, security helpers
  integrations/   Third-party clients (Supabase, etc.)
supabase/
  functions/      Edge Functions (AI, payments, analytics, search, ...)
ios/              Capacitor iOS project
public/           Static assets (icons, manifest, service worker)
```

See `ARCHITECTURE.md` for a deeper look at the system design and data flow.

## Mobile Builds

Capacitor is configured for both iOS and Android. After running `npm run build`:

```sh
npx cap sync
npx cap open ios       # opens in Xcode
npx cap open android   # opens in Android Studio
```

See `APP_STORE_ASSETS.md` for store listing requirements.

## Documentation

- `ARCHITECTURE.md` — system architecture, data flow, edge functions
- `TESTING_GUIDE.md` — testing strategy and how to run tests
- `GOOGLE_OAUTH_SETUP.md` — configuring Google Sign-In
- `APP_STORE_ASSETS.md` — assets required for App Store / Play Store

## License

Proprietary — all rights reserved.
