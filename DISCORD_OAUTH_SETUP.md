# Discord OAuth Setup Guide for ARC Raiders LFG

## 🎮 Overview

This guide walks you through setting up **Discord OAuth authentication** for the ARC Raiders LFG platform. Discord OAuth provides seamless login for gamers without password management.

---

## 📋 Prerequisites

- Node.js 18+ installed
- Next.js 14 project initialized
- Discord account (free)
- Text editor or IDE

---

## 🔧 Step 1: Create Discord Application

### 1.1 Go to Discord Developer Portal

1. Visit: https://discord.com/developers/applications
2. Sign in with your Discord account (or create one)
3. Click **"New Application"** button

### 1.2 Configure Application

1. **Enter Application Name:** `ARC Raiders LFG` (or your preferred name)
2. Click **"Create"**
3. You'll see your application dashboard

### 1.3 Get Credentials

In the left sidebar, click **OAuth2** → **General**

You'll see:
- **Client ID** - Copy this
- **Client Secret** - Click **"Reset Secret"**, then copy it

Keep these safe! You'll need them next.

### 1.4 Set Redirect URI

In the same OAuth2 page, scroll to **Redirects**

Click **"Add Redirect"** and add:

```
http://localhost:3000/api/auth/callback/discord
```

For production, you'll also add:
```
https://your-domain.com/api/auth/callback/discord
```

Click **"Save Changes"**

---

## 🛠️ Step 2: Project Setup

### 2.1 Use Discord OAuth Files

Replace these files in your project:

**Configuration:**
- Use `package-discord-oauth.json` → Rename to `package.json`
- Use `.env.local.discord.template` → Rename to `.env.local`

**Prisma:**
- Use `prisma-schema-discord.prisma` → Replace `prisma/schema.prisma`

**Pages:**
- Use `app-layout-discord.tsx` → Replace `src/app/layout.tsx`

**Components:**
- Use `components-Navigation-Discord.tsx` → Replace `src/components/Navigation.tsx`

**API Routes:**
- Use `api-nextauth.ts` → Create `src/app/api/auth/[...nextauth]/route.ts`

### 2.2 Install Dependencies

```bash
npm install
```

This will install NextAuth and other required packages.

### 2.3 Generate NextAuth Secret

Open terminal and run:

```bash
# On Windows PowerShell
$secret = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString()))
Write-Host $secret

# On Mac/Linux
openssl rand -base64 32
```

Copy the output - you'll need it for `.env.local`

### 2.4 Configure Environment Variables

Create `.env.local` in your project root:

```env
# NextAuth Secret (paste the generated secret)
NEXTAUTH_SECRET=your_generated_secret_here

# Discord OAuth Credentials (from Step 1.3)
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_CLIENT_SECRET=your_client_secret_here

# NextAuth URL
NEXTAUTH_URL=http://localhost:3000

# Database (SQLite for local dev)
DATABASE_URL="file:./prisma/dev.db"

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
```

**⚠️ IMPORTANT:** Never commit `.env.local` to GitHub!

### 2.5 Initialize Database

```bash
# Generate Prisma client
npx prisma generate

# Create database and tables
npx prisma db push

# Optional: Seed database with test data
npx prisma db seed
```

---

## 🚀 Step 3: Test Locally

### 3.1 Start Development Server

```bash
npm run dev
```

Your app should be running at `http://localhost:3000`

### 3.2 Test Sign In

1. Visit `http://localhost:3000`
2. Click **"Sign in with Discord"** button
3. You'll be redirected to Discord
4. Authorize the application
5. You'll be logged in!

### 3.3 Verify Database

The user should be created in your database. Check with:

```bash
npx prisma studio
```

This opens a visual database explorer.

---

## 📝 How Discord OAuth Works

```
1. User clicks "Sign in with Discord"
   ↓
2. Redirects to Discord login page
   ↓
3. User enters Discord credentials
   ↓
4. Discord asks for permissions
   ↓
5. Redirects back to your app with auth code
   ↓
6. NextAuth exchanges code for user data
   ↓
7. User created in database (if new)
   ↓
8. Session created and stored
   ↓
9. User logged in and redirected to /dashboard
```

---

## 🔐 Understanding the Files

### NextAuth Route (`api/auth/[...nextauth]/route.ts`)
- Handles all authentication logic
- Manages Discord OAuth flow
- Creates sessions in database
- Handles sign in/out

### Prisma Schema
- Contains NextAuth required models:
  - `Account` - Discord OAuth account data
  - `Session` - User session data
  - `User` - User information
  - `VerificationToken` - Email verification
- Application models:
  - `GameProfile` - ARC Raiders stats
  - `LFGPosting` - Looking for group posts
  - `Friend` - Friend relationships

### Environment Variables
- `DISCORD_CLIENT_ID` - Identifies your app to Discord
- `DISCORD_CLIENT_SECRET` - Secret key (keep private!)
- `NEXTAUTH_SECRET` - Encrypts sessions
- `NEXTAUTH_URL` - Where your app is hosted

### Navigation Component
- Uses `useSession()` hook to get current user
- Displays user info when logged in
- Shows Discord login button when logged out
- Has sign out button for logged in users

---

## 🎨 Customization

### Change Sign In Redirect

Edit `src/app/api/auth/[...nextauth]/route.ts`:

```typescript
// After successful sign in, go to:
signIn: '/dashboard',  // Change this path
```

### Change User Info Stored

In the session callback:

```typescript
async session({ session, user }) {
  if (session.user) {
    session.user.id = user.id
    session.user.customField = user.customField  // Add custom fields
  }
  return session
}
```

### Add More Providers

In `providers` array:

```typescript
import GitHubProvider from 'next-auth/providers/github'

providers: [
  DiscordProvider({...}),
  GitHubProvider({
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
  }),
]
```

---

## 🛡️ Security Best Practices

✅ **Keep Secrets Secret**
- Never commit `.env.local` to GitHub
- Add to `.gitignore` (should be automatic)

✅ **Use HTTPS in Production**
- Discord only allows HTTPS redirects on production

✅ **Regenerate Secrets**
- Periodically regenerate NEXTAUTH_SECRET
- Rotate Discord Client Secret if compromised

✅ **Validate User Input**
- Never trust user data from sessions
- Verify ownership before operations

✅ **Use Database Sessions**
- Configured to use database (not JWT)
- More secure for sensitive operations

---

## 🐛 Troubleshooting

### "Invalid redirect URI"
**Problem:** Discord says redirect URL is wrong
**Solution:** 
- Check `http://localhost:3000/api/auth/callback/discord` is added in Discord Developer Portal
- Make sure you clicked "Save Changes"
- Clear browser cache and try again

### "DISCORD_CLIENT_ID is required"
**Problem:** Environment variables not loaded
**Solution:**
- Create `.env.local` file in project root
- Make sure file has correct variable names
- Restart `npm run dev`

### "Unexpected token / in JSON"
**Problem:** Generated secret has special characters
**Solution:**
- Use `openssl rand -base64 32` command
- Or copy the entire secret exactly as generated

### User not created in database
**Problem:** Prisma schema not migrated
**Solution:**
- Run `npx prisma db push`
- Check database with `npx prisma studio`

### Sign out not working
**Problem:** Callback URL not set
**Solution:**
- In Navigation component, ensure callback is set:
```typescript
signOut({ callbackUrl: '/' })
```

---

## 📱 Testing Checklist

- [ ] Discord app created
- [ ] Client ID and Secret copied
- [ ] Redirect URI added to Discord
- [ ] `.env.local` file created with all variables
- [ ] `npm install` completed
- [ ] `npx prisma db push` successful
- [ ] `npm run dev` starts without errors
- [ ] Can see login button on home page
- [ ] Can click "Sign in with Discord"
- [ ] Redirected to Discord login
- [ ] Can authorize application
- [ ] Redirected back to dashboard
- [ ] User data displayed correctly
- [ ] Can sign out successfully

---

## 🚀 Next Steps After Auth Works

1. **Link EMBARK ID** - Allow users to add their ARC Raiders profile
2. **Create LFG Page** - Browse and create looking for group posts
3. **Add Friends System** - Send and accept friend requests
4. **Customize Profile** - Add bio, timezone, preferred game modes
5. **Deploy** - Put on production server

---

## 📚 Additional Resources

- **NextAuth.js Docs:** https://next-auth.js.org
- **NextAuth Discord Provider:** https://next-auth.js.org/providers/discord
- **Discord Developer Docs:** https://discord.com/developers/docs
- **Prisma Adapter:** https://authjs.dev/reference/adapter/prisma

---

## 💡 Quick Reference Commands

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Create/update database
npx prisma db push

# Open database viewer
npx prisma studio

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Create new migration
npx prisma migrate dev --name add_field
```

---

## ✅ You're Ready!

Discord OAuth is now fully configured and working. Users can sign in with their Discord account securely.

**Next:** Continue to the dashboard and LFG features! 🎮🚀
