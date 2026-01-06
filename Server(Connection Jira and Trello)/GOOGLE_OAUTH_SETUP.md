# Google OAuth Setup Guide

## ✅ What I've Done:

1. ✅ Removed signup/login forms from login page
2. ✅ Added "Sign in with Google" button
3. ✅ Created Google OAuth configuration (`config/passport.js`)
4. ✅ Added Google OAuth routes to handle authentication
5. ✅ Updated User model to support Google accounts
6. ✅ Updated server.js to initialize Passport
7. ✅ Updated dashboard to handle OAuth callback

## 🔑 What You Need to Do:

### Step 1: Get Google OAuth Credentials

1. Go to: https://console.cloud.google.com/apis/credentials
2. Create a new project (or select existing)
3. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
4. Configure consent screen if prompted
5. Application type: **Web application**
6. Add authorized redirect URI:
   ```
   http://localhost:5000/api/auth/google/callback
   ```
7. Click "Create"
8. Copy your **Client ID** and **Client Secret**

### Step 2: Update .env File

Open your `.env` file and replace these values:

```env
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

**Example:**
```env
GOOGLE_CLIENT_ID=123456789-abc123xyz.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz789
```

### Step 3: Install Required Packages

Run this command:

```powershell
npm install passport passport-google-oauth20
```

### Step 4: Start Your Server

```powershell
npm start
```

### Step 5: Test Google Login

1. Open: http://localhost:5000/login.html
2. Click "Continue with Google"
3. Sign in with your Google account
4. You'll be redirected to the dashboard

## 🎯 Next Steps (After Google Login Works):

Later, you can add buttons in the settings page to:
- **Connect Jira** (using Jira OAuth)
- **Connect Trello** (using Trello OAuth)

These will be separate connections that happen **after** the user logs in with Google.

## 📋 Current Flow:

```
1. User clicks "Sign in with Google" → Google login page
2. User authorizes → Redirected back to your app
3. Backend creates/finds user → Generates JWT token
4. User redirected to dashboard → Authenticated ✅
```

## ❓ Need Help?

If you get any errors, send me:
1. The error message
2. Which step you're on

Once Google OAuth works, we can add the Jira/Trello connection buttons!
