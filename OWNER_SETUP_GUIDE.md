# 🎮 OWNER SETUP GUIDE - ARC Raiders LFG

## 👑 YOUR OWNER CONFIGURATION

Your information has been configured in the system:

```
Discord ID:    1368087024401252393
Email:         gtagod2020torey@gmail.com
EMBARK ID:     BL0WDART#3014
EMBARK Name:   BL0WDART
Role:          🔐 OWNER (Full Control)
```

**Once you sign in with Discord, you automatically become the owner of the entire platform.**

---

## 🚀 QUICK START - Become Owner in 2 Steps

### Step 1: Sign In with Discord
1. Go to http://localhost:3000
2. Click **"Sign in with Discord"**
3. Use an account linked to Discord ID: `1368087024401252393`
4. Authorize the application

### Step 2: Access Admin Panel
1. Once signed in, you'll see a new **"Admin"** option in navigation
2. Or visit directly: http://localhost:3000/admin
3. You now have FULL OWNER ACCESS! 👑

---

## 🎯 OWNER CAPABILITIES

Once signed in as owner, you have complete control:

### 📊 Dashboard Overview
- View total users and statistics
- See active LFG postings
- Monitor site health
- View recent activity

### 👥 User Management
- View all users with details
- Ban/unban users
- Change user roles
- View user profiles

### 📝 LFG Posting Management
- Feature/unfeature postings
- Remove postings
- View all active groups
- Moderate content

### ⚙️ Site Settings
- Maintenance mode
- Enable/disable registration
- Enable/disable postings
- Site branding settings

### 🔒 Moderation Tools
- Ban users
- Issue warnings
- Remove content
- View mod logs

### 📋 Admin Logs
- See all admin actions
- Track changes
- Monitor security
- Export reports

---

## 📁 FILES TO USE FOR OWNER SETUP

Replace/add these files in your project:

### 1. Owner Configuration
**File:** `lib-owner.ts`
**Location:** `src/lib/owner.ts`
**What it does:** Defines owner ID, checks permissions

### 2. Updated Prisma Schema
**File:** `prisma-schema-owner.prisma`
**Location:** `prisma/schema.prisma`
**What it does:** Adds admin/moderator tables and roles

### 3. Updated NextAuth
**File:** `api-nextauth-owner.ts`
**Location:** `src/app/api/auth/[...nextauth]/route.ts`
**What it does:** Auto-assigns owner role on sign in

### 4. Admin Dashboard
**File:** `app-admin-page.tsx`
**Location:** `src/app/admin/page.tsx`
**What it does:** Full admin control panel

### 5. Admin API Routes
**File:** `api-admin-routes.ts`
**Location:** Create in `src/app/api/admin/`
**What it does:** API endpoints for admin functions

---

## 🔧 SETUP INSTRUCTIONS

### Step 1: Update Prisma Schema

Replace `prisma/schema.prisma` with `prisma-schema-owner.prisma`:

```bash
# Delete old schema
rm prisma/schema.prisma

# Create migration
npx prisma migrate dev --name add_owner_admin_fields

# Answer the migration question:
# "Created migration" - Press enter
```

### Step 2: Update NextAuth

Replace `src/app/api/auth/[...nextauth]/route.ts` with `api-nextauth-owner.ts`:

This version:
- ✅ Checks your Discord ID on sign in
- ✅ Auto-assigns owner role
- ✅ Creates admin logs
- ✅ Stores everything in database

### Step 3: Add Owner Library

Create `src/lib/owner.ts` with content from `lib-owner.ts`:

```typescript
export const OWNER_CONFIG = {
  discordId: '1368087024401252393',
  email: 'gtagod2020torey@gmail.com',
  embarkId: 'BL0WDART#3014',
}
```

### Step 4: Create Admin Page

Create folder: `src/app/admin/`

Create file: `src/app/admin/page.tsx` with content from `app-admin-page.tsx`:

This gives you the admin dashboard.

### Step 5: Create Admin API Routes

Create folder structure:
```
src/app/api/admin/
├── users/
│   └── route.ts
├── postings/
│   └── route.ts
├── stats/
│   └── route.ts
├── ban-user/
│   └── route.ts
└── feature-posting/
    └── route.ts
```

Use content from `api-admin-routes.ts`

### Step 6: Restart Database

```bash
# Remove old database
rm prisma/dev.db

# Create new one with owner tables
npx prisma db push

# Verify tables were created
npx prisma studio
```

### Step 7: Start & Test

```bash
npm run dev
```

Visit http://localhost:3000 and sign in!

---

## 🔑 HOW IT WORKS

### Sign In Flow
```
1. You click "Sign in with Discord"
   ↓
2. Discord asks you to authorize
   ↓
3. Discord returns your Discord ID
   ↓
4. NextAuth checks if Discord ID matches OWNER_CONFIG
   ↓
5. If it matches, database is updated:
   - isOwner = true
   - role = 'owner'
   - isAdmin = true
   ↓
6. You're signed in as OWNER
   ↓
7. Session includes: user.isOwner = true
   ↓
8. Admin page checks this and grants access
```

### Permission Check
```typescript
// In any component or API route:
if (isOwner(session?.user?.id)) {
  // Show admin features
}

// Or check role:
if (session?.user?.role === 'owner') {
  // Grant access
}
```

---

## 👑 OWNER FEATURES BREAKDOWN

### 1. Admin Dashboard (http://localhost:3000/admin)

**Overview Tab:**
- Stats cards (Users, Postings, Health)
- Recent activity feed
- Quick action buttons

**Users Tab:**
- User list with filtering
- Role assignment
- Ban/unban users
- View user details

**Postings Tab:**
- All LFG postings
- Feature/remove
- View participants
- Moderate content

**Settings Tab:**
- Site configuration
- Enable/disable features
- Maintenance mode
- Danger zone (reset data)

### 2. User Management
- Ban users (blocks login)
- Assign roles (admin, moderator)
- View all user data
- Track user actions

### 3. Content Moderation
- Feature postings (appear first)
- Remove postings
- Lock/unlock discussions
- Issue warnings

### 4. Analytics
- User statistics
- Activity tracking
- Site health score
- Admin action logs

### 5. Site Settings
- Maintenance mode (shut down site)
- Feature toggles
- Email notifications
- Content policies

---

## 🚀 CUSTOMIZATION

### Add More Admin Users

Edit `src/lib/owner.ts` to add admins:

```typescript
export const ADMIN_USERS = [
  '1368087024401252393', // You (Owner)
  'OTHER_DISCORD_ID_HERE', // Another admin
]

export function isAdmin(discordId: string): boolean {
  return ADMIN_USERS.includes(discordId)
}
```

Then in NextAuth callback:
```typescript
if (ADMIN_USERS.includes(account?.providerAccountId)) {
  await prisma.user.update({
    where: { id: user.id },
    data: {
      isAdmin: true,
      role: account?.providerAccountId === OWNER_CONFIG.discordId 
        ? 'owner' 
        : 'admin',
    },
  })
}
```

### Add New Admin Pages

Create any page at: `src/app/admin/{page-name}/page.tsx`

Protect it with:
```typescript
'use client'

import { useSession } from 'next-auth/react'
import { isOwner } from '@/lib/owner'

export default function Page() {
  const { data: session } = useSession()

  if (!isOwner(session?.user?.id)) {
    return <div>Access Denied</div>
  }

  return <div>Admin Content</div>
}
```

---

## 🔐 SECURITY NOTES

✅ **Owner ID stored in code** - Keep `src/lib/owner.ts` private
✅ **Database verification** - Check Discord ID at sign in
✅ **Role-based access** - API routes verify role before allowing
✅ **Admin logs** - All actions logged to database
✅ **Session verification** - Each page checks session

### Don't Do This:
❌ Don't put owner credentials in .env.local
❌ Don't commit owner file to public repository
❌ Don't share your Discord ID
❌ Don't hardcode permissions on frontend

---

## 🧪 TESTING OWNER ACCESS

### Test 1: Sign In
1. Go to http://localhost:3000
2. Click "Sign in with Discord"
3. Use your Discord account
4. You should be logged in

### Test 2: Check Role in Database
```bash
npx prisma studio
# Click on "User" table
# Find your user
# Check: isOwner = true, role = "owner"
```

### Test 3: Access Admin Panel
1. Logged in as owner
2. Go to http://localhost:3000/admin
3. You should see the admin dashboard
4. If denied, check Discord ID in lib/owner.ts

### Test 4: Try Admin Functions
1. Click on "Users" tab
2. You should see all users
3. Try to ban a user (not yourself!)
4. Check database to verify ban

---

## 🛠️ TROUBLESHOOTING

### "Access Denied" on admin page?

**Check 1:** Are you signed in?
```
- Check if you see user info in top right
- If not, sign in with Discord
```

**Check 2:** Is your Discord ID correct?
```typescript
// src/lib/owner.ts
discordId: '1368087024401252393' // Must match YOUR Discord ID
```

**Check 3:** Check database
```bash
npx prisma studio
# Go to User table
# Find yourself
# Check: discordId = your Discord ID
# Check: isOwner = true
```

**Check 4:** Check NextAuth configuration
```
DISCORD_CLIENT_ID=correct_value
DISCORD_CLIENT_SECRET=correct_value
NEXTAUTH_SECRET=correct_value
```

### Stuck at sign in screen?

1. Clear browser cookies
2. Close browser completely
3. Open new tab
4. Try signing in again

### Database errors?

```bash
# Delete and recreate database
rm prisma/dev.db
npx prisma db push
npm run dev
```

---

## 📊 OWNER COMMAND REFERENCE

### Quick Access
- **Admin Dashboard:** `/admin`
- **Users Management:** `/admin` (Users tab)
- **Postings Management:** `/admin` (Postings tab)
- **Site Settings:** `/admin` (Settings tab)

### Database Commands
```bash
# View database
npx prisma studio

# See all admin actions
SELECT * FROM AdminLog ORDER BY createdAt DESC

# See all users
SELECT * FROM User

# See bans
SELECT * FROM User WHERE isBanned = true
```

---

## 🎉 YOU'RE NOW THE OWNER!

**Congratulations!** 🎊

You now have:
- ✅ Full owner access
- ✅ Admin dashboard
- ✅ User management
- ✅ Content moderation
- ✅ Site configuration
- ✅ Analytics & logs
- ✅ Complete control

**Start using your powers:** Visit http://localhost:3000/admin

---

## 📚 NEXT STEPS

1. **Explore Admin Panel** - Get familiar with all features
2. **Customize Settings** - Adjust site configuration
3. **Create Test Users** - Sign up extra accounts
4. **Test Ban Feature** - Ban a test account, verify
5. **Feature Postings** - Make some LFG postings featured
6. **Build Features** - Add custom admin tools

---

**Welcome to ownership, Torey!** 👑

Your platform is ready to manage. Make it awesome!
