# Google OAuth Setup Guide for Final Form

This guide will help you configure Google Sign-In for your Final Form fitness app.

## Prerequisites

- A Google Cloud account
- Access to your Supabase project dashboard
- Your app's deployed URL (or preview URL for testing)

---

## Part 1: Google Cloud Console Setup

### Step 1: Create/Select Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Either create a new project or select an existing one
3. Name it something like "Final Form Auth" or use your app name

### Step 2: Configure OAuth Consent Screen

1. In the Google Cloud Console, navigate to:
   - **APIs & Services** → **OAuth consent screen**

2. Choose **External** user type and click **Create**

3. Fill in the required information:
   - **App name**: Final Form
   - **User support email**: Your support email
   - **App logo**: Upload your app icon (optional but recommended)
   - **Application home page**: Your app URL
   - **Authorized domains**: Add `supabase.co`
   - **Developer contact**: Your email

4. **Add Scopes** (click "Add or Remove Scopes"):
   - Select the following non-sensitive scopes:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
     - `openid`
   - These allow reading basic profile info (name, email, profile picture)

5. Click **Save and Continue**

6. **Test users** (optional during development):
   - Add test email addresses if you want to test before going live
   - For production, skip this or publish the app

### Step 3: Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services** → **Credentials**

2. Click **Create Credentials** → **OAuth Client ID**

3. Select **Application type**: **Web application**

4. Name it: `Final Form Web Client`

5. **Authorized JavaScript origins**:
   Add both your preview and production URLs:
   ```
   https://finalform.app
   https://yourdomain.com
   http://localhost:5173
   ```
   (Add localhost for local development)

6. **Authorized redirect URIs**:
   Add your Supabase callback URL:
   ```
   https://lnocdbqlxepxuohktjxb.supabase.co/auth/v1/callback
   ```
   
   **Important**: Get the exact callback URL from your Supabase dashboard:
   - Go to Supabase Dashboard → Authentication → Providers
   - Expand Google provider
   - Copy the "Callback URL (for OAuth)"

7. Click **Create**

8. **Save your credentials**:
   - **Client ID**: Looks like `123456789-abc123.apps.googleusercontent.com`
   - **Client Secret**: A long string like `GOCSPX-abc123...`
   - ⚠️ Keep these secure! Never commit to git.

---

## Part 2: Supabase Configuration

### Step 1: Enable Google Provider

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `lnocdbqlxepxuohktjxb`
3. Navigate to **Authentication** → **Providers**
4. Find **Google** in the list
5. Toggle it **ON**

### Step 2: Add Google Credentials

In the Google provider settings:

1. **Enabled**: Toggle ON
2. **Client ID**: Paste your Google Client ID
3. **Client Secret**: Paste your Google Client Secret
4. Click **Save**

### Step 3: Configure URL Settings

Still in Supabase Dashboard:

1. Go to **Authentication** → **URL Configuration**

2. Set **Site URL**:
   ```
   https://finalform.app
   ```
   (Or your custom domain)

3. Add **Redirect URLs** (one per line):
   ```
   https://finalform.app/**
   https://yourdomain.com/**
   http://localhost:5173/**
   ```

4. Click **Save**

---

## Part 3: Test the Integration

### Test Flow:

1. **Open your app** in a browser
2. Navigate to `/auth`
3. Click **"Continue with Google"**
4. **Expected behavior**:
   - Google sign-in popup appears
   - Select your Google account
   - Grant permissions
   - Redirected back to your app
   - User logged in successfully
   - Profile created automatically in database

### Troubleshooting Common Issues:

#### Issue: "Invalid redirect_uri"
**Solution**: 
- Verify redirect URI in Google Console matches Supabase callback exactly
- Make sure you saved changes in both Google Console and Supabase

#### Issue: "Unauthorized domain"
**Solution**:
- Add `supabase.co` to authorized domains in OAuth consent screen
- Add your app domain to authorized JavaScript origins

#### Issue: "requested path is invalid"
**Solution**:
- Check Site URL in Supabase matches your app URL exactly
- Ensure redirect URL includes wildcards: `https://yourdomain.com/**`

#### Issue: User signs in but gets redirected to localhost
**Solution**:
- Update Site URL in Supabase to your production URL
- Clear browser cache and cookies
- Try in incognito mode

---

## Part 4: Production Checklist

Before going live:

- [ ] OAuth consent screen submitted for verification (if needed)
- [ ] Correct production URLs in Google Console
- [ ] Correct production URLs in Supabase
- [ ] Test Google sign-in flow end-to-end
- [ ] Test on mobile devices
- [ ] Test on different browsers
- [ ] Verify user data saves correctly
- [ ] Test sign-out and re-sign-in
- [ ] Remove or publish test users

---

## Security Best Practices

1. **Never expose secrets**:
   - Client Secret stays in Supabase only
   - Client ID is public (safe in frontend code)

2. **Use HTTPS**:
   - Google OAuth requires HTTPS for redirect URIs
   - Only exception: `localhost` for development

3. **Limit scopes**:
   - Only request necessary user information
   - Current scopes: email, profile, openid

4. **Monitor usage**:
   - Check Google Cloud Console for API quotas
   - Set up billing alerts if needed

---

## Additional Resources

- [Supabase Google Auth Docs](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)

---

## Support

If you encounter issues:

1. Check Supabase logs:
   - Dashboard → Logs → Authentication logs

2. Check browser console for errors

3. Verify all URLs are correct in both platforms

4. Contact:
   - Email: support@finalform.app
   - Supabase Support: support.supabase.com

---

**Last Updated**: February 2025
