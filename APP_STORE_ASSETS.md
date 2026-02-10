# Final Form - App Store Submission Guide

## App Store Connect (iOS)

### App Information
- **App Name**: Final Form
- **Subtitle**: AI-Powered Fitness & Nutrition
- **Bundle ID**: com.finalform.app
- **SKU**: finalform-fitness-2025
- **Primary Category**: Health & Fitness
- **Secondary Category**: Lifestyle
- **Content Rights**: Does not contain third-party content
- **Age Rating**: 4+ (no objectionable content)

### Description (4000 chars max)
```
Final Form is your AI-powered fitness companion, designed to help you achieve your health and wellness goals through personalized workout plans, intelligent nutrition tracking, and adaptive coaching.

SMART WORKOUTS
- AI-generated workout plans tailored to your goals
- 100+ exercise library with detailed instructions
- Real-time workout timer with rest intervals
- Track personal records and progressive overload
- Multi-week periodized training programs

INTELLIGENT NUTRITION
- AI-powered meal planning and recommendations
- Comprehensive food database with barcode scanning
- Macro and calorie tracking with visual breakdowns
- Voice-powered food logging for hands-free entry
- Smart grocery list generation from meal plans

PROGRESS ANALYTICS
- Weekly and monthly progress dashboards
- Body measurement and weight tracking
- Progress photo journal with comparisons
- Streak tracking and achievement system
- Personalized insights powered by AI

AI FITNESS COACH
- Chat with Athena, your personal AI trainer
- Get real-time advice on workouts and nutrition
- Adaptive recommendations based on your progress
- Recovery planning and rest day optimization

GOAL TRACKING
- Custom goal creation and tracking
- Hydration monitoring
- Daily step counting
- Meditation and wellness tracking
- Gamified challenges and achievements

SOCIAL FEATURES
- Join fitness challenges with friends
- Share achievements and milestones
- Leaderboards and friendly competition

SUBSCRIPTION INFORMATION
Final Form offers a Premium subscription (Final Form Pro) with two options:
- Monthly: $9.99/month
- Annual: $79.99/year (save 33%)

Both plans include a 7-day free trial. Payment will be charged to your Apple ID account at the confirmation of purchase. Subscription automatically renews unless auto-renew is turned off at least 24 hours before the end of the current period. Your account will be charged for renewal within 24 hours prior to the end of the current period. You can manage and cancel your subscriptions by going to your account settings on the App Store after purchase.

Whether you're just starting your fitness journey or you're a seasoned athlete, Final Form adapts to your needs and grows with you.

Privacy Policy: https://finalform.app/privacy
Terms of Service: https://finalform.app/terms
```

### Keywords (100 chars max)
```
fitness,workout,nutrition,calories,AI,trainer,exercise,gym,health,meal,tracking,diet,weight,muscle
```

### Promotional Text (170 chars max)
```
Transform your fitness with AI-powered workouts, smart nutrition tracking, and a personal AI coach. Start your journey to Final Form today!
```

### What's New (4000 chars)
```
Welcome to Final Form 1.0! Your AI-powered fitness companion is here:
- AI-powered workout generation with personalized recommendations
- Voice-controlled food logging
- Multi-week training programs
- Progress analytics dashboard
- Offline support for workouts on the go
```

---

## Required Screenshots

### iPhone 6.7" (1290 x 2796 px) - Required
1. **Home Dashboard** - Show daily stats, streak, next workout
2. **AI Workout Generator** - Show generated workout with exercises
3. **Nutrition Tracking** - Show food log with macros breakdown
4. **AI Chat (Athena)** - Show conversation with AI coach
5. **Progress Analytics** - Show weekly insights and charts

### iPhone 6.5" (1242 x 2688 px) - Required
Same 5 screenshots

### iPhone 5.5" (1242 x 2208 px) - Optional
Same 5 screenshots

### iPad Pro 12.9" (2048 x 2732 px) - If supporting iPad
Same 5 screenshots

---

## Required Icons

### App Icon Requirements
| Size | Use Case |
|------|----------|
| 1024x1024 | App Store |
| 180x180 | iPhone @3x |
| 120x120 | iPhone @2x |
| 167x167 | iPad Pro @2x |
| 152x152 | iPad @2x |
| 76x76 | iPad @1x |

### Recommended Design
- Use the existing orange/coral brand color (#f36d33)
- Simple, bold design that's recognizable at small sizes
- No text in the icon
- Consider a stylized "F" or flame/power symbol

---

## Google Play Store (Android)

### App Information
- **App Name**: Final Form - Fitness & Nutrition
- **Package Name**: com.finalform.app
- **Category**: Health & Fitness
- **Content Rating**: Everyone

### Short Description (80 chars)
```
AI-powered fitness app with personalized workouts, nutrition tracking & coaching
```

### Full Description (4000 chars)
Use the same description as iOS App Store.

### Required Graphics
| Asset | Size | Notes |
|-------|------|-------|
| App Icon | 512x512 | 32-bit PNG with alpha |
| Feature Graphic | 1024x500 | Promotional banner |
| Phone Screenshots | 1080x1920 minimum | 2-8 required |
| 7" Tablet Screenshots | 1200x1920 | Optional |
| 10" Tablet Screenshots | 1800x2560 | Optional |

---

## Privacy Policy Requirements

Both stores require a privacy policy URL. In-app routes: `/privacy-policy` and `/privacy`

Key points covered:
- Data collection (fitness data, health metrics, voice recordings)
- Data storage (Supabase, encrypted in transit and at rest)
- Third-party services (RevenueCat, Google AI/Gemini, USDA FoodData, Apple Health)
- Health data never sold or used for advertising
- User data rights (export, deletion)
- GDPR/CCPA compliance

---

## Pre-Submission Checklist

### iOS (Code Changes - DONE)
- [x] Remove dev server URL from capacitor.config.ts
- [x] Set proper reverse-domain bundle ID (com.finalform.app)
- [x] Add all privacy descriptions to Info.plist template (camera, photos, microphone, health, motion, face ID, tracking)
- [x] Add subscription legal text to Pricing page, PaywallModal, and Terms of Service
- [x] Add Privacy Policy and Terms links on purchase screens
- [x] Add Restore Purchases button on Profile page
- [x] Add EULA section to Terms of Service
- [x] Fix RateAppPrompt to comply with guideline 5.6.1 (no pre-selected ratings)
- [x] Consistent branding (Final Form Pro everywhere, not FitTracker Pro)
- [x] Health data privacy disclosures in Privacy Policy

### iOS (Manual Steps - TODO on your Mac)
- [ ] Run `npx cap add ios` to generate the Xcode project
- [ ] Merge Info.plist.template keys into generated Info.plist
- [ ] Generate app icons in all required sizes from app-icon-1024.png
- [ ] Add icons to Xcode asset catalog (AppIcon)
- [ ] Create App Store screenshots on simulator or device
- [ ] Configure push notification certificates in Apple Developer Portal
- [ ] Set up RevenueCat products in App Store Connect (monthly + yearly with 7-day trial)
- [ ] Register bundle ID `com.finalform.app` in Apple Developer Portal
- [ ] Create provisioning profiles for distribution
- [ ] Enable HealthKit capability in Xcode
- [ ] Enable Push Notifications capability in Xcode
- [ ] Enable In-App Purchase capability in Xcode
- [ ] Test on physical devices
- [ ] Submit for TestFlight beta testing first
- [ ] Create App Store Connect listing with screenshots, description, etc.

### Android
- [ ] Run `npx cap add android` to generate the Android project
- [ ] Generate signed APK/AAB
- [ ] Create keystore for signing
- [ ] Add all required graphics
- [ ] Configure Firebase for push notifications
- [ ] Test on multiple device sizes
- [ ] Submit for internal testing first

---

## Info.plist Privacy Descriptions (iOS)

These are defined in `ios/App/App/Info.plist.template`. After running `npx cap add ios`, merge them into the generated `Info.plist`:

```xml
<key>NSCameraUsageDescription</key>
<string>Final Form needs camera access to take progress photos and scan food barcodes.</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>Final Form needs photo library access to save and view your progress photos.</string>

<key>NSPhotoLibraryAddUsageDescription</key>
<string>Final Form needs permission to save your progress photos to your photo library.</string>

<key>NSMicrophoneUsageDescription</key>
<string>Final Form uses your microphone for voice-powered food logging so you can log meals hands-free.</string>

<key>NSHealthShareUsageDescription</key>
<string>Final Form reads your health data to sync workouts, steps, and activity data.</string>

<key>NSHealthUpdateUsageDescription</key>
<string>Final Form writes workout data to Apple Health to keep your fitness data in sync.</string>

<key>NSMotionUsageDescription</key>
<string>Final Form uses motion data to track your steps and daily activity.</string>

<key>NSFaceIDUsageDescription</key>
<string>Final Form can use Face ID to secure your fitness data and quickly unlock the app.</string>

<key>NSUserTrackingUsageDescription</key>
<string>Final Form may use this data to provide personalized fitness recommendations and improve your experience.</string>
```

---

## Build Commands

```bash
# Install dependencies
npm install

# Build production
npm run build

# Add platforms (first time only)
npx cap add ios
npx cap add android

# Sync changes (after every build)
npx cap sync

# Open in IDE
npx cap open ios     # Opens Xcode
npx cap open android # Opens Android Studio
```

## RevenueCat Setup

1. Create products in App Store Connect:
   - `finalform_pro_monthly` - $9.99/month with 7-day free trial
   - `finalform_pro_yearly` - $79.99/year with 7-day free trial
2. Create a subscription group called "Final Form Pro"
3. In RevenueCat dashboard:
   - Create entitlements: `pro` and/or `premium`
   - Create offerings with the above products
   - iOS API Key is already configured: `appl_FgmYvLdacMBIcQcgaiGzBNqgfPn`
