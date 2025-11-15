# Final Form - Pre-Launch Testing Guide

## 🚀 Complete User Flow Testing

### 1. Authentication Flow ✅

#### Sign Up Flow
1. Navigate to `/landing` or `/auth`
2. Click "Sign Up" tab
3. Enter:
   - Email: `test@example.com`
   - Password: `TestPassword123!`
   - Full Name: `Test User`
4. Click "Sign Up"
5. **Expected**: 
   - Success message: "Check your email to confirm your account"
   - User receives confirmation email
   - After email confirmation, redirected to onboarding

#### Sign In Flow
1. Go to `/auth`
2. Enter existing credentials
3. Click "Sign In"
4. **Expected**: 
   - Redirected to home page (/)
   - User data loads correctly
   - Navigation bar appears

#### Password Reset
1. Click "Forgot Password?" on auth page
2. Enter email address
3. Click "Send Reset Link"
4. **Expected**:
   - Success message appears
   - Reset email sent
   - Can reset password via email link

#### Google OAuth (If Configured)
1. Click "Continue with Google"
2. Select/sign in with Google account
3. **Expected**:
   - Redirected to home page
   - Profile created automatically

### 2. Onboarding Flow ✅

After signing up or first login:

1. **Welcome Screen**
   - Displays Final Form branding
   - "Get Started" button

2. **Goals Selection**
   - Select fitness goals (multiple choice)
   - Options: Lose Weight, Gain Muscle, Improve Endurance, etc.

3. **Personal Info**
   - Age, height, weight, target weight
   - Fitness level selection
   - Workout frequency preference

4. **Dietary Preferences**
   - Select dietary restrictions/preferences
   - Options: Vegetarian, Vegan, Keto, etc.

5. **Completion**
   - Success message
   - Redirected to home page
   - Data saved to profile

**Test**: Complete onboarding → Profile should be populated with entered data

### 3. Core Feature Testing

#### A. Home Dashboard
**Location**: `/`

✅ **Check**:
- [ ] Daily progress rings display (calories, water, meditation, steps)
- [ ] Progress values update in real-time
- [ ] Quick action buttons work
- [ ] Today's streak shows correctly
- [ ] Next workout displays
- [ ] AI chatbot accessible

**Actions to Test**:
1. Click water tracker → Should open dialog
2. Add water intake → Ring updates immediately
3. Log steps → Progress updates
4. View next workout → Navigates correctly

#### B. Workout Features
**Locations**: `/workouts`, `/workout-session`, `/workout-builder`

✅ **Workout Templates**:
- [ ] Default templates load (Push, Pull, Legs, etc.)
- [ ] Can view template details
- [ ] Can start workout from template
- [ ] Can create custom workout

✅ **Workout Session** (`/workout-session`):
- [ ] Exercise list displays
- [ ] Can add exercises
- [ ] Can add sets
- [ ] Input reps and weight
- [ ] Mark sets as complete ✓
- [ ] Rest timer starts automatically
- [ ] Timer has sound/vibration
- [ ] Can skip rest period
- [ ] Can finish workout
- [ ] Workout saves to database

✅ **Exercise Library** (`/exercise-library`):
- [ ] 30+ exercises load
- [ ] Search functionality works
- [ ] Filter by muscle group works
- [ ] Filter by equipment works
- [ ] Filter by difficulty works
- [ ] Exercise details display correctly

#### C. Nutrition Features
**Locations**: `/nutrition`, `/food-logger`, `/recipes`

✅ **Food Logging** (`/food-logger`):
- [ ] Can search for food
- [ ] Search results display nutrition info
- [ ] Can log food to meals (breakfast, lunch, dinner, snacks)
- [ ] Barcode scanner button visible
- [ ] Voice food logger works
- [ ] Manual food entry works
- [ ] Food logs appear in history
- [ ] Can edit logged foods
- [ ] Can delete logged foods
- [ ] Daily calorie total updates

✅ **Barcode Scanner**:
1. Click "Scan Barcode"
2. Camera permission requested
3. Position barcode in frame
4. **Expected**:
   - Barcode detected
   - Food data fetched from database
   - Nutrition info pre-filled
   - Can add to meal log

**Test Products** (Common barcodes to try):
- Coca-Cola: 0049000050103
- Cheerios: 0016000275027
- Doritos: 0028400047432

✅ **Recipe Database** (`/recipes`):
- [ ] Recipes load and display
- [ ] Can create new recipe
- [ ] Can add ingredients and instructions
- [ ] Can set nutritional values
- [ ] Can add dietary tags
- [ ] Can filter by dietary preferences
- [ ] Can search recipes
- [ ] Can edit own recipes
- [ ] Can delete own recipes
- [ ] Public recipes visible

✅ **Meal Plans**:
- [ ] Can generate AI meal plan
- [ ] Can save meal plan
- [ ] Can view saved plans
- [ ] Can add meal to food log
- [ ] Can delete meal plan

#### D. Progress Tracking
**Locations**: `/progress`, `/progress-photos`, `/body-measurements`, `/analytics`

✅ **Progress Photos** (`/progress-photos`):
- [ ] Can upload photo
- [ ] Photo upload shows preview
- [ ] Can select photo type (front/side/back)
- [ ] Can add weight and notes
- [ ] Photos display in gallery
- [ ] Can compare photos side-by-side
- [ ] Can delete photos
- [ ] Photos stored securely (private by default)

✅ **Body Measurements** (`/body-measurements`):
- [ ] Can add measurements (weight, chest, waist, etc.)
- [ ] Date selection works
- [ ] Can add notes
- [ ] Measurements display in history
- [ ] Can edit measurements
- [ ] Can delete measurements

✅ **Analytics** (`/analytics`):
- [ ] Weight trend chart displays
- [ ] Workout volume chart displays
- [ ] Body measurement charts display
- [ ] Calorie trend chart displays
- [ ] Date range selector works
- [ ] Charts update when data changes

✅ **Personal Records** (`/personal-records`):
- [ ] Can add PR
- [ ] Exercise selection works
- [ ] Weight and reps input works
- [ ] PRs display in list
- [ ] Can filter by exercise
- [ ] Can delete PRs

#### E. Goals & Achievements
**Locations**: `/goals`, `/awards`

✅ **Goals** (`/goals`):
- [ ] Default goals created
- [ ] Can create custom goal
- [ ] Goal progress updates
- [ ] Can edit goals
- [ ] Can delete goals
- [ ] Completion status tracked

✅ **Achievements** (`/awards`):
- [ ] Achievements display
- [ ] Locked/unlocked states correct
- [ ] Progress bars show correctly
- [ ] Completion dates shown
- [ ] Achievement icons display

#### F. Calendar & Scheduling
**Location**: `/workout-calendar`

✅ **Workout Calendar**:
- [ ] Calendar displays current month
- [ ] Scheduled workouts show
- [ ] Can add workout to date
- [ ] Can view workout details
- [ ] Can mark as complete
- [ ] Completed workouts have checkmark
- [ ] Can navigate months

#### G. Profile & Settings
**Location**: `/profile`

✅ **Profile Page**:
- [ ] User info displays
- [ ] Stats show correctly (workouts, streak, etc.)
- [ ] Can edit profile
- [ ] Can update goals
- [ ] Can access settings
- [ ] Can log out
- [ ] Quick action buttons work

### 4. Offline Functionality Testing 🔌

#### Setup:
1. Open app in browser
2. Open DevTools (F12)
3. Go to Network tab
4. Select "Offline" from throttling dropdown

#### Test Scenarios:

✅ **Page Loading**:
- [ ] App shell loads from cache
- [ ] PWA icon shows "offline" indicator
- [ ] Toast notification: "You're Offline"

✅ **Data Access**:
- [ ] Can view cached workout templates
- [ ] Can view cached meal plans
- [ ] Recent data still accessible
- [ ] Offline banner displays

✅ **Offline Actions**:
- [ ] Can log workout (queued for sync)
- [ ] Can log food (queued for sync)
- [ ] Can log water (queued for sync)
- [ ] Pending actions stored locally

✅ **Back Online**:
1. Re-enable network
2. **Expected**:
   - Toast: "Back Online! Syncing your data..."
   - Pending actions sync automatically
   - Success toast: "Sync Complete"
   - All data reflected in database

#### Service Worker Check:
1. Open DevTools → Application tab
2. Check "Service Workers" section
3. **Expected**:
   - Service worker registered
   - Status: Activated
   - Cache exists with app resources

### 5. Mobile/PWA Testing 📱

#### Install PWA:

**iOS**:
1. Open app in Safari
2. Tap Share button
3. Tap "Add to Home Screen"
4. Name it "Final Form"
5. Tap "Add"

**Android**:
1. Open app in Chrome
2. Tap menu (⋮)
3. Tap "Install app" or "Add to Home Screen"
4. Tap "Install"

✅ **PWA Functionality**:
- [ ] App installs successfully
- [ ] Icon appears on home screen
- [ ] Opens in standalone mode (no browser UI)
- [ ] Works offline
- [ ] Push notifications (if enabled)
- [ ] Splash screen displays

### 6. Security Testing 🔒

✅ **Authentication**:
- [ ] Can't access protected routes when logged out
- [ ] Redirects to /auth when not authenticated
- [ ] Session persists after page refresh
- [ ] Auto-logout after token expiration
- [ ] HTTPS enforced in production

✅ **Data Privacy**:
- [ ] Can only see own data
- [ ] Can't access other users' data via URL manipulation
- [ ] RLS policies working (check Supabase)
- [ ] Progress photos are private by default
- [ ] Can't inject malicious code

### 7. Performance Testing ⚡

✅ **Loading Times**:
- [ ] Initial page load < 3 seconds
- [ ] Navigation feels instant
- [ ] Images load progressively
- [ ] No layout shifts (CLS)

✅ **Data Operations**:
- [ ] Search is responsive
- [ ] Filters apply instantly
- [ ] Charts render smoothly
- [ ] No lag when logging data

### 8. Cross-Browser Testing 🌐

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### 9. Accessibility Testing ♿

✅ **Keyboard Navigation**:
- [ ] Can tab through all interactive elements
- [ ] Focus indicators visible
- [ ] Enter/Space activate buttons
- [ ] Escape closes dialogs

✅ **Screen Reader**:
- [ ] Images have alt text
- [ ] Buttons have labels
- [ ] Form inputs have labels
- [ ] ARIA labels present

---

## 🐛 Bug Reporting

If you find bugs during testing, document:

1. **Steps to reproduce**
2. **Expected behavior**
3. **Actual behavior**
4. **Browser/device info**
5. **Screenshots/videos**
6. **Console errors** (if any)

---

## ✅ Pre-Launch Checklist

### Required Before Launch:
- [ ] All user flows tested and working
- [ ] Offline functionality verified
- [ ] Privacy Policy page added
- [ ] Terms of Service page added
- [ ] App icons uploaded (192x192, 512x512)
- [ ] PWA manifest configured
- [ ] Google OAuth configured (if using)
- [ ] Barcode scanner tested with real products
- [ ] All console errors resolved
- [ ] Mobile responsive on all screen sizes
- [ ] Email confirmation flow tested
- [ ] Password reset tested
- [ ] Data export functionality tested

### Recommended Before Launch:
- [ ] Analytics setup (Google Analytics, etc.)
- [ ] Error tracking (Sentry, etc.)
- [ ] Custom domain configured
- [ ] Social media cards (OG tags)
- [ ] App store submission (if native)
- [ ] Beta testing with real users
- [ ] Load testing for concurrent users
- [ ] Backup strategy in place

---

## 📞 Support

Issues during testing? Check:
1. Console logs (F12 → Console)
2. Network tab (failed requests)
3. Supabase logs (authentication errors)
4. Service worker status (Application tab)

---

**Last Updated**: ${new Date().toLocaleDateString()}
**App Version**: 1.0.0
