# Final Form - Architecture Documentation

## Overview

Final Form is a comprehensive AI-powered fitness and nutrition application built with:
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions + Auth + Storage)
- **AI**: Lovable AI Gateway (Google Gemini 2.5 Flash)
- **Payments**: Stripe Subscriptions
- **Mobile**: Capacitor for iOS/Android

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                               │
├─────────────────────────────────────────────────────────────────────┤
│  React SPA (Vite)                                                    │
│  ├── Pages (Auth, Dashboard, Workouts, Nutrition, Goals, etc.)     │
│  ├── Components (UI, Features, Shared)                              │
│  ├── Hooks (State, API, Analytics)                                  │
│  └── Lib (Utils, Validation, Analytics)                             │
├─────────────────────────────────────────────────────────────────────┤
│  Capacitor (iOS/Android)                                            │
│  ├── Push Notifications                                             │
│  ├── Local Storage                                                  │
│  └── Native APIs                                                    │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          SUPABASE LAYER                              │
├─────────────────────────────────────────────────────────────────────┤
│  Edge Functions                                                      │
│  ├── AI Functions (chat, workout, nutrition, recovery, suggestions) │
│  ├── Payment Functions (checkout, subscription, portal)            │
│  ├── Analytics Functions (events, tracking)                         │
│  ├── Search Functions (food, products, recipes)                     │
│  └── Utility Functions (notifications, voice)                       │
├─────────────────────────────────────────────────────────────────────┤
│  PostgreSQL Database                                                 │
│  ├── User Data (profiles, daily_tracking, goals)                    │
│  ├── Fitness Data (workouts, sessions, templates, records)          │
│  ├── Nutrition Data (food_logs, meal_plans, water_logs)             │
│  ├── Social Data (friends, challenges, achievements)                │
│  ├── Analytics (analytics_events, error_logs)                       │
│  └── Cache (ai_response_cache)                                      │
├─────────────────────────────────────────────────────────────────────┤
│  Auth (Supabase Auth)                                               │
│  └── Email/Password, Google OAuth                                   │
├─────────────────────────────────────────────────────────────────────┤
│  Storage (Supabase Storage)                                         │
│  └── progress-photos bucket                                         │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL SERVICES                             │
├─────────────────────────────────────────────────────────────────────┤
│  Lovable AI Gateway                                                  │
│  └── google/gemini-2.5-flash (chat, workout gen, meal plans)        │
├─────────────────────────────────────────────────────────────────────┤
│  Stripe                                                              │
│  ├── Checkout Sessions                                               │
│  ├── Subscriptions                                                   │
│  └── Customer Portal                                                 │
├─────────────────────────────────────────────────────────────────────┤
│  USDA FoodData Central API                                          │
│  └── Food nutrition database                                        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### Workout Generation Flow
```
User Request → Frontend → ai-workout-generator Edge Function
    ↓
Fetch User Context (profile, recent workouts, goals)
    ↓
Check AI Cache (optional, for common patterns)
    ↓
Call Lovable AI Gateway with personalized prompt
    ↓
Validate AI Response (Zod schema)
    ↓
Save to workout_templates table
    ↓
Return to Frontend → Display to User
```

### Food Logging Flow
```
User Input (manual/barcode/voice) → Frontend
    ↓
[If voice] voice-to-text Edge Function → parse-food-voice
    ↓
[If barcode] search-products Edge Function
    ↓
Validate with Zod schema
    ↓
Insert to food_logs table
    ↓
Trigger: update_daily_calories → daily_tracking
    ↓
Trigger: trigger_check_achievements → achievements
    ↓
Analytics event → analytics_events table
```

### Subscription Flow
```
User clicks Subscribe → create-checkout Edge Function
    ↓
Create Stripe Checkout Session
    ↓
User completes payment on Stripe
    ↓
Redirect to success page
    ↓
check-subscription Edge Function (polling)
    ↓
Update SubscriptionContext in Frontend
    ↓
Gate premium features accordingly
```

---

## Database Schema Overview

### Core Tables
| Table | Purpose | Key Indexes |
|-------|---------|-------------|
| profiles | User profile data | user_id (unique) |
| daily_tracking | Daily stats | (user_id, date) |
| workout_sessions | Completed workouts | (user_id, completed_at) |
| workout_templates | Saved workout plans | (user_id, type) |
| food_logs | Food entries | (user_id, logged_at), (user_id, meal_type) |
| water_logs | Hydration tracking | (user_id, date) |
| goals | User goals | (user_id, completed) |
| achievements | Gamification | (user_id, completed) |

### Analytics/Audit Tables
| Table | Purpose |
|-------|---------|
| analytics_events | User behavior tracking |
| error_logs | Error monitoring |
| ai_response_cache | AI response caching |
| security_audit_log | Security events |

---

## Edge Functions Reference

### AI Functions
| Function | Auth | Purpose |
|----------|------|---------|
| ai-fitness-chat | JWT | Chat with AI coach (streaming) |
| ai-workout-generator | JWT | Generate personalized workouts |
| ai-nutrition-generator | JWT | Generate meal plans |
| ai-recovery-planner | JWT | Rest day recommendations |
| ai-food-suggestions | JWT | Food recommendations |

### Payment Functions
| Function | Auth | Purpose |
|----------|------|---------|
| create-checkout | JWT | Start Stripe checkout |
| check-subscription | JWT | Verify subscription status |
| customer-portal | JWT | Manage subscription |

### Utility Functions
| Function | Auth | Purpose |
|----------|------|---------|
| analytics | JWT | Track user events |
| search-food | JWT | Search USDA database |
| search-products | Public | Barcode product lookup |
| voice-to-text | JWT | Speech recognition |
| parse-food-voice | JWT | Extract food from speech |

---

## Security

### Row Level Security (RLS)
All tables have RLS enabled with policies ensuring users can only access their own data:
```sql
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id)
```

### API Security
- JWT verification on most edge functions
- Rate limiting via security_audit_log
- Input validation with Zod schemas
- CORS headers on all responses

### Secrets Management
Stored in Supabase secrets:
- STRIPE_SECRET_KEY
- LOVABLE_API_KEY
- OPENAI_API_KEY (legacy)
- USDA_API_KEY

---

## Performance Optimizations

### Database
- Composite indexes on frequently queried columns
- GIN indexes for JSONB searches
- Materialized views for dashboards (future)
- Cache table for AI responses

### Frontend
- React Query for data caching
- Lazy loading for heavy components
- Optimistic updates for mutations
- Service worker for offline support

### AI
- Response caching (24h TTL)
- Batch user context fetching
- Fallback responses for failures
- Structured output validation

---

## Deployment

### Frontend
- Automatic deployment via Lovable
- Production build with `npm run build`
- CDN distribution via Lovable

### Edge Functions
- Automatic deployment with code changes
- Config in `supabase/config.toml`

### Mobile
- iOS: Xcode → App Store Connect
- Android: Android Studio → Google Play Console
- See `APP_STORE_ASSETS.md` for details

---

## Monitoring

### Error Tracking
- `error_logs` table for backend errors
- Console logging in development
- Structured logging in edge functions

### Analytics
- `analytics_events` table for user behavior
- Custom hooks for tracking
- Session-based grouping

### Health Checks
- Edge function logs in Supabase dashboard
- Subscription status polling
- Network request monitoring in dev tools
