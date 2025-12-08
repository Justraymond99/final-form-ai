# Final Form - App Store Submission Guide

## App Store Connect (iOS)

### App Information
- **App Name**: Final Form
- **Subtitle**: AI-Powered Fitness & Nutrition
- **Bundle ID**: app.lovable.97e01a4005924d06bc0df350295addf5
- **SKU**: finalform-fitness-2024
- **Primary Category**: Health & Fitness
- **Secondary Category**: Lifestyle

### Description (4000 chars max)
```
Final Form is your ultimate AI-powered fitness companion, designed to help you achieve your health and wellness goals through personalized workout plans, intelligent nutrition tracking, and adaptive coaching.

🏋️ SMART WORKOUTS
• AI-generated workout plans tailored to your goals
• 100+ exercise library with detailed instructions
• Real-time workout timer with rest intervals
• Track personal records and progressive overload
• Multi-week periodized training programs

🥗 INTELLIGENT NUTRITION
• AI-powered meal planning and recommendations
• Comprehensive food database with barcode scanning
• Macro and calorie tracking with visual breakdowns
• Voice-powered food logging for hands-free entry
• Smart grocery list generation from meal plans

📊 PROGRESS ANALYTICS
• Weekly and monthly progress dashboards
• Body measurement and weight tracking
• Progress photo journal with comparisons
• Streak tracking and achievement system
• Personalized insights powered by AI

🤖 AI FITNESS COACH
• Chat with Athena, your personal AI trainer
• Get real-time advice on workouts and nutrition
• Adaptive recommendations based on your progress
• Recovery planning and rest day optimization

🎯 GOAL TRACKING
• Custom goal creation and tracking
• Hydration monitoring
• Daily step counting
• Meditation and wellness tracking
• Gamified challenges and achievements

💪 SOCIAL FEATURES
• Join fitness challenges with friends
• Share achievements and milestones
• Leaderboards and friendly competition

Whether you're just starting your fitness journey or you're a seasoned athlete looking to optimize your training, Final Form adapts to your needs and grows with you.

Download now and transform your fitness routine with the power of AI!
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
• AI-powered workout generation with personalized recommendations
• Voice-controlled food logging
• Multi-week training programs
• Enhanced analytics dashboard
• Improved offline support
• Bug fixes and performance improvements
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
- **Package Name**: app.lovable.97e01a4005924d06bc0df350295addf5
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

Both stores require a privacy policy URL. Current: `/privacy-policy`

Key points to include:
- Data collection (fitness data, health metrics)
- Data storage (Supabase, encrypted)
- Third-party services (Stripe, AI services)
- User data rights (export, deletion)
- GDPR/CCPA compliance

---

## Pre-Submission Checklist

### iOS
- [ ] Remove dev server URL from capacitor.config.ts
- [ ] Generate production icons in all sizes
- [ ] Create App Store screenshots
- [ ] Configure push notification certificates
- [ ] Add privacy descriptions to Info.plist
- [ ] Test on physical devices
- [ ] Submit for TestFlight beta testing first

### Android
- [ ] Generate signed APK/AAB
- [ ] Create keystore for signing
- [ ] Add all required graphics
- [ ] Configure Firebase for push notifications
- [ ] Test on multiple device sizes
- [ ] Submit for internal testing first

---

## Info.plist Privacy Descriptions (iOS)

Add these to your iOS project's Info.plist:

```xml
<key>NSCameraUsageDescription</key>
<string>Final Form uses your camera to scan food barcodes and capture progress photos.</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>Final Form needs access to your photo library to save and view your progress photos.</string>

<key>NSPhotoLibraryAddUsageDescription</key>
<string>Final Form needs permission to save your progress photos to your library.</string>

<key>NSMicrophoneUsageDescription</key>
<string>Final Form uses your microphone for voice-controlled food logging.</string>

<key>NSHealthShareUsageDescription</key>
<string>Final Form can read your health data to provide personalized fitness recommendations.</string>

<key>NSHealthUpdateUsageDescription</key>
<string>Final Form can write workout data to Apple Health to keep all your fitness data in sync.</string>
```

---

## Build Commands

```bash
# Pull latest code
git pull

# Install dependencies
npm install

# Build production
npm run build

# Add platforms (first time only)
npx cap add ios
npx cap add android

# Sync changes
npx cap sync

# Open in IDE
npx cap open ios     # Opens Xcode
npx cap open android # Opens Android Studio
```

## Production Config

Before submitting, update `capacitor.config.ts`:

```typescript
const config: CapacitorConfig = {
  appId: 'app.lovable.97e01a4005924d06bc0df350295addf5',
  appName: 'Final Form',
  webDir: 'dist',
  // REMOVE the server block for production:
  // server: {
  //   url: "...",
  //   cleartext: true
  // },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1a1f2e",
      showSpinner: false,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  }
};
```
