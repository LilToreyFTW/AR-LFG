# Vercel Deployment Guide - ARC Raiders LFG

## ✅ Fixed Issues
- Removed conflicting root `app-page.tsx` file
- Fixed TypeScript errors in API routes and components
- Created proper `vercel.json` configuration
- Build now compiles successfully

## 🚀 Next Steps for Deployment

### 1. Connect to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Link your project
vercel link
```

### 2. Required Environment Variables
Go to your Vercel dashboard → Settings → Environment Variables and add:

**Discord OAuth:**
- `DISCORD_CLIENT_ID` - From Discord Developer Portal
- `DISCORD_CLIENT_SECRET` - From Discord Developer Portal

**NextAuth:**
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `NEXTAUTH_URL` - Set to: `https://your-domain.vercel.app`

**Database:**
- `DATABASE_URL` - Your production database URL (PlanetScale, Railway, etc.)

**App:**
- `NODE_ENV` - Set to: `production`
- `NEXT_PUBLIC_APP_URL` - Set to: `https://your-domain.vercel.app`

### 3. Discord OAuth Setup
1. Go to https://discord.com/developers/applications
2. Create application → OAuth2 → Add Redirect:
   - `https://your-domain.vercel.app/api/auth/callback/discord`

### 4. Database Setup
Choose one:
- **PlanetScale** (Recommended for Vercel)
- **Railway** 
- **Supabase**

### 5. Deploy
```bash
# Deploy to Vercel
vercel --prod
```

## 🔧 Troubleshooting

### Build Errors
- Run `npm run build` locally first
- Check all environment variables are set
- Ensure database is accessible

### Runtime Errors
- Check Vercel Function Logs
- Verify Discord OAuth redirect URL
- Check database connection

### Common Issues
- **"Unauthorized" errors** → Check NEXTAUTH_SECRET and Discord credentials
- **Database errors** → Verify DATABASE_URL is correct
- **OAuth fails** → Check Discord redirect URL matches exactly

## 📋 Pre-Deployment Checklist
- [ ] Discord app created and credentials added to Vercel
- [ ] Production database set up
- [ ] All environment variables configured
- [ ] Local build succeeds (`npm run build`)
- [ ] Git repository connected to Vercel
- [ ] Custom domain configured (if needed)

## 🌐 After Deployment
1. Test Discord sign-in flow
2. Verify database connections
3. Check all API endpoints work
4. Test LFG posting functionality
5. Verify admin panel access

Your site should now be live and working on Vercel! 🎮
