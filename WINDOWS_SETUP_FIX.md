# 🪟 WINDOWS SETUP GUIDE - ARC Raiders LFG

## ⚠️ YOUR CURRENT ERROR

```
Error: Could not find Prisma Schema
Error: 'next' is not recognized as an internal or external command
```

**Cause:** Missing Prisma schema and dependencies not installed properly

**Solution:** Follow this guide step-by-step

---

## 🚀 QUICK FIX (5 Minutes)

### Step 1: Open PowerShell as Administrator

1. Press `Windows Key + X`
2. Click **"Windows PowerShell (Admin)"**
3. Type this to navigate:
```powershell
cd I:\ARC-RAIDERS_LFG
```

### Step 2: Create Prisma Folder

```powershell
mkdir prisma
```

### Step 3: Copy Schema File

You need to copy one of the Prisma schema files you have:

**Option A: Using Owner Schema (Recommended)**
```powershell
Copy-Item "prisma-schema-owner.prisma" "prisma\schema.prisma"
```

**Option B: Using Discord Schema**
```powershell
Copy-Item "prisma-schema-discord.prisma" "prisma\schema.prisma"
```

### Step 4: Clean and Reinstall

```powershell
npm cache clean --force
rm -r node_modules -Force
rm package-lock.json
npm install
```

### Step 5: Create Database

```powershell
npx prisma generate
npx prisma db push
```

### Step 6: Start Development Server

```powershell
npm run dev
```

If it works, you'll see:
```
> arc-raiders-lfg@1.0.0 dev
> next dev

▲ Next.js 14.0.0
- Local: http://localhost:3000
```

---

## 📁 COMPLETE DIRECTORY STRUCTURE

Your `I:\ARC-RAIDERS_LFG\` should look like this:

```
I:\ARC-RAIDERS_LFG\
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── api/
│   │   │   └── auth/
│   │   │       └── [...nextauth]/
│   │   │           └── route.ts
│   │   └── admin/
│   │       └── page.tsx
│   ├── components/
│   │   ├── Navigation.tsx
│   │   └── (other components)
│   ├── lib/
│   │   ├── db.ts
│   │   ├── owner.ts
│   │   └── (other libs)
│   └── types/
│       └── index.ts
├── prisma/
│   ├── schema.prisma          ← MUST EXIST
│   └── dev.db                 ← AUTO-CREATED
├── public/
├── node_modules/              ← AUTO-CREATED
├── .env.local                 ← YOU CREATE
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── (other config files)
```

---

## 🔧 DETAILED SETUP - STEP BY STEP

### Step 1: Verify You're in Right Folder

```powershell
cd I:\ARC-RAIDERS_LFG
ls
```

You should see these files:
- `package.json`
- `next.config.js`
- `tsconfig.json`
- Various `.md` files

If not, you're in the wrong folder!

### Step 2: Create Required Folders

```powershell
# Create main directories
mkdir prisma
mkdir src
mkdir src\app
mkdir src\lib
mkdir src\components
mkdir src\types
mkdir src\app\api
mkdir src\app\api\auth
mkdir src\app\api\auth\['...nextauth']
mkdir src\app\admin
mkdir src\app\api\admin
mkdir public
```

### Step 3: Copy Prisma Schema

**Use PowerShell (important - Command Prompt doesn't handle special chars well):**

```powershell
# Copy the Discord version (simpler)
Copy-Item "prisma-schema-discord.prisma" "prisma\schema.prisma" -Force

# OR copy the Owner version (more features)
Copy-Item "prisma-schema-owner.prisma" "prisma\schema.prisma" -Force
```

**Verify it was copied:**
```powershell
ls prisma\
```

You should see `schema.prisma` listed.

### Step 4: Reinstall Dependencies

```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules (this can take a minute)
rm -r node_modules -Force -ErrorAction SilentlyContinue

# Delete package lock
rm package-lock.json -ErrorAction SilentlyContinue

# Fresh install
npm install
```

Wait for it to complete - you'll see `added XXX packages`.

### Step 5: Generate Prisma Client

```powershell
npx prisma generate
```

You should see:
```
✔ Generated Prisma Client
```

### Step 6: Create Database

```powershell
npx prisma db push
```

Answer `y` when asked to create database. You should see:
```
✔ Database synced
```

### Step 7: Test Start

```powershell
npm run dev
```

Wait 10-30 seconds. You should see:
```
▲ Next.js 14.0.0
- Local: http://localhost:3000
```

**If you see this, SUCCESS! 🎉**

### Step 8: Open in Browser

Press `Ctrl+Click` on `http://localhost:3000` in the terminal, or:

1. Open browser
2. Go to `http://localhost:3000`
3. You should see the ARC LFG landing page

### Step 9: Create .env.local

You need environment variables for Discord OAuth. Create file:

```
I:\ARC-RAIDERS_LFG\.env.local
```

Copy this content:

```env
# Discord OAuth
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_CLIENT_SECRET=your_client_secret_here

# NextAuth
NEXTAUTH_SECRET=paste_generated_secret_here
NEXTAUTH_URL=http://localhost:3000

# Database
DATABASE_URL="file:./prisma/dev.db"

# API
NEXT_PUBLIC_API_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

**Need the values?** See the Discord OAuth setup guide.

### Step 10: Restart Server

```powershell
# Stop current server: Ctrl+C

# Start again:
npm run dev
```

Now you can sign in with Discord!

---

## 🐛 TROUBLESHOOTING

### Error: "Could not find Prisma Schema"

**Solution:**
```powershell
# Make sure schema file exists:
ls prisma\

# If not there, copy it:
Copy-Item "prisma-schema-discord.prisma" "prisma\schema.prisma" -Force

# Then try again:
npx prisma db push
```

### Error: "'next' is not recognized"

**Solution:**
```powershell
# Make sure node_modules exists:
ls node_modules

# If not, reinstall:
npm install

# Try again:
npm run dev
```

### Error: "DISCORD_CLIENT_ID is required"

**Solution:**
```powershell
# Create .env.local file with Discord credentials
# See Step 9 above
```

### Port 3000 already in use

**Solution:**
```powershell
# Use different port:
npm run dev -- -p 3001

# Or kill process using port 3000:
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F
```

### Database error / Can't create tables

**Solution:**
```powershell
# Delete and recreate database:
rm prisma\dev.db
npx prisma db push
```

---

## ✅ VERIFICATION CHECKLIST

After setup, verify everything:

```powershell
# 1. Check Prisma schema exists
ls prisma\schema.prisma

# 2. Check Node modules installed
ls node_modules | head -5

# 3. Check database created
ls prisma\dev.db

# 4. Check .env.local exists
cat .env.local

# 5. Try starting dev server
npm run dev
```

All of these should succeed!

---

## 📝 NEXT: COPY APPLICATION FILES

After setup works, you need to copy the actual application files:

### Pages & Components
Copy these `.tsx` files to `src/`:

- `app-layout-discord.tsx` → `src/app/layout.tsx`
- `app-page.tsx` → `src/app/page.tsx`
- `components-Navigation-Discord.tsx` → `src/components/Navigation.tsx`
- `components-LinkEmbarkId.tsx` → `src/components/LinkEmbarkId.tsx`
- `components-LFGPostingCard.tsx` → `src/components/LFGPostingCard.tsx`
- `app-admin-page.tsx` → `src/app/admin/page.tsx`

### Library Files
Copy these `.ts` files to `src/lib/`:

- `lib-db.ts` → `src/lib/db.ts`
- `lib-owner.ts` → `src/lib/owner.ts`
- `lib-embark-api.ts` → `src/lib/embark-api.ts`
- `lib-store.ts` → `src/lib/store.ts`

### API Routes
Create folders and copy:

- `api-nextauth-owner.ts` → `src/app/api/auth/[...nextauth]/route.ts`
- Other API files to `src/app/api/`

### Types
- `types-index.ts` → `src/types/index.ts`

### CSS
- `globals.css` → `src/app/globals.css`

---

## 🎯 COMMAND CHEAT SHEET

```powershell
# Navigate to project
cd I:\ARC-RAIDERS_LFG

# Install/reinstall
npm install
npm cache clean --force

# Prisma
npx prisma generate
npx prisma db push
npx prisma studio        # View database

# Run dev
npm run dev

# Build
npm run build
npm start

# Stop dev server
Ctrl+C

# Kill port 3000
netstat -ano | findstr :3000
taskkill /PID [number] /F
```

---

## 🎉 WHEN IT WORKS

You'll see this in PowerShell:

```
▲ Next.js 14.0.0
- Local: http://localhost:3000
```

Then:
1. Open http://localhost:3000
2. You see ARC Raiders LFG landing page
3. Click "Sign in with Discord"
4. You can log in! ✅

---

## 🚀 NEXT STEPS

1. ✅ Follow this entire guide
2. ✅ Verify everything works
3. ✅ Copy application files
4. ✅ Create .env.local with Discord credentials
5. ✅ Restart npm run dev
6. ✅ Sign in with Discord
7. ✅ Access admin panel

---

**You've got this!** 💪

If stuck, check the troubleshooting section or re-read the step-by-step carefully.

**Good luck!** 🚀
