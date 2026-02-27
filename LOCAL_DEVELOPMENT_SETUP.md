# LOCAL DEVELOPMENT SETUP - ARC Raiders LFG with Discord OAuth

## 🚀 Quick Start (30 Minutes)

Follow these steps in order to have a fully working LFG platform locally.

---

## ✅ Step 1: Prerequisites (5 min)

Make sure you have:

- [ ] Node.js 18+ installed
- [ ] A Discord account (free at https://discord.com)
- [ ] A text editor or IDE
- [ ] Git (optional, for version control)

Check versions:
```bash
node --version  # Should be 18+
npm --version   # Should be 9+
```

---

## ⚙️ Step 2: Create Discord Application (10 min)

### 2.1 Create App in Discord Developer Portal

1. Go to: https://discord.com/developers/applications
2. Click **"New Application"**
3. Name it: **"ARC Raiders LFG"**
4. Click **"Create"**

### 2.2 Get Your Credentials

Left sidebar → **OAuth2** → **General**

- Copy **Client ID** → Save it
- Click **"Reset Secret"** → Copy **Client Secret** → Save it

### 2.3 Add Redirect URI

In the same page, scroll to **Redirects**

Click **"Add Redirect"** and add:
```
http://localhost:3000/api/auth/callback/discord
```

Click **"Save Changes"**

✅ **You now have Discord OAuth ready!**

---

## 📂 Step 3: Initialize Project (10 min)

### 3.1 Create Project Folder

```bash
# Create folder
mkdir I:\ARC-RAIDERS_LFG
cd I:\ARC-RAIDERS_LFG
```

### 3.2 Initialize Next.js

```bash
npx create-next-app@latest . --typescript --tailwind --app
```

Answer the prompts:
- ESLint: Yes
- Tailwind CSS: Yes
- `src/` directory: Yes
- App Router: Yes
- Aliases: Yes (use `@/*`)

### 3.3 Install Dependencies

```bash
npm install next-auth @prisma/client axios zustand react-hot-toast lucide-react
npm install -D prisma @types/next-auth
```

---

## 📋 Step 4: Copy Project Files (5 min)

From the provided files, copy these to your project:

### Configuration Files
Copy to **root of project** (`I:\ARC-RAIDERS_LFG\`):
- `package-discord-oauth.json` → Rename to `package.json`
- `middleware.ts` → Keep as `middleware.ts`
- `tsconfig.json`
- `tailwind.config.js`
- `postcss.config.js`
- `next.config.js`

### Prisma
Create folder `prisma/` and copy:
- `prisma-schema-discord.prisma` → Rename to `schema.prisma`

### Source Code
Copy to `src/` folder:

**App folder** (`src/app/`):
- `app-layout-discord.tsx` → Rename to `layout.tsx`
- `app-page.tsx` → Rename to `page.tsx`
- `globals.css`

**Create API folder** (`src/app/api/auth/[...nextauth]/`):
- `api-nextauth.ts` → Rename to `route.ts`

**Components folder** (`src/components/`):
- `components-Navigation-Discord.tsx` → Rename to `Navigation.tsx`
- `components-LinkEmbarkId.tsx`
- `components-LFGPostingCard.tsx`

**Lib folder** (`src/lib/`):
- `lib-db.ts` → Rename to `db.ts`
- `lib-embark-api.ts` → Rename to `embark-api.ts`
- `lib-store.ts` → Rename to `store.ts`

**Types folder** (`src/types/`):
- `types-index.ts` → Rename to `index.ts`

---

## 🔑 Step 5: Set Up Environment Variables (2 min)

### 5.1 Create `.env.local` File

In project root, create `.env.local`:

```env
# Discord OAuth (from Step 2.2)
DISCORD_CLIENT_ID=paste_your_client_id_here
DISCORD_CLIENT_SECRET=paste_your_client_secret_here

# Generate this command:
# Windows PowerShell: [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString()))
# Mac/Linux: openssl rand -base64 32
NEXTAUTH_SECRET=paste_generated_secret_here

# URLs
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000

# Database (SQLite for local dev - no setup needed!)
DATABASE_URL="file:./prisma/dev.db"

# Development
NODE_ENV=development

# Optional - Embark API
EMBARK_API_KEY=your_embark_key_if_available
NEXT_PUBLIC_EMBARK_API_URL=https://api.embark.games/arc-raiders
```

### 5.2 Generate NEXTAUTH_SECRET

**On Windows (PowerShell):**
```powershell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString()))
```

**On Mac/Linux:**
```bash
openssl rand -base64 32
```

Copy the output and paste into `.env.local` for `NEXTAUTH_SECRET`

---

## 🗄️ Step 6: Initialize Database (2 min)

```bash
# Generate Prisma client
npx prisma generate

# Create SQLite database and tables
npx prisma db push

# (Optional) Open visual database editor
npx prisma studio
```

The database is created automatically in `prisma/dev.db`

---

## 🎮 Step 7: Run Development Server (1 min)

```bash
npm run dev
```

You should see:
```
> ready - started server on 0.0.0.0:3000
```

✅ **Your app is running!**

---

## 🌐 Step 8: Test in Browser (2 min)

### 8.1 Open App

Visit: **http://localhost:3000**

You should see:
- Landing page with "ARC LFG" logo
- Discord sign-in button in top right

### 8.2 Test Sign In

1. Click **"Sign in with Discord"**
2. You'll be redirected to Discord login
3. Sign in with your Discord account
4. Click **"Authorize"**
5. You'll be logged in!

### 8.3 Verify User Created

Check the database:
```bash
npx prisma studio
```

Click on "User" table - you should see your Discord account!

---

## 📝 File Structure

Your project should now look like:

```
I:\ARC-RAIDERS_LFG\
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── auth/
│   │   │       └── [...nextauth]/
│   │   │           └── route.ts
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── Navigation.tsx
│   │   ├── LinkEmbarkId.tsx
│   │   └── LFGPostingCard.tsx
│   ├── lib/
│   │   ├── db.ts
│   │   ├── embark-api.ts
│   │   └── store.ts
│   └── types/
│       └── index.ts
├── prisma/
│   ├── schema.prisma
│   └── dev.db (auto-created)
├── .env.local
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
└── middleware.ts
```

---

## ✨ Features Now Available

✅ **Discord Sign In** - Instant login with Discord
✅ **User Profiles** - Name, email, Discord avatar
✅ **Database** - SQLite (no setup needed)
✅ **Type Safety** - Full TypeScript
✅ **Dark Theme** - Neon gaming aesthetic
✅ **Responsive** - Mobile-friendly

---

## 📚 Next: Add More Features

### Create LFG Browsing Page

```bash
mkdir -p src/app/lfg
touch src/app/lfg/page.tsx
```

### Create Dashboard

```bash
mkdir -p src/app/dashboard
touch src/app/dashboard/page.tsx
```

### Create API Routes

```bash
mkdir -p src/app/api/lfg/postings
touch src/app/api/lfg/postings/route.ts
```

See **DISCORD_OAUTH_SETUP.md** for examples.

---

## 🐛 Troubleshooting

### "DISCORD_CLIENT_ID is required"
- Check `.env.local` file exists
- Verify environment variable names are correct
- Restart `npm run dev`

### "Invalid redirect URI"
- Make sure `http://localhost:3000/api/auth/callback/discord` is added in Discord Developer Portal
- Click "Save Changes"
- Wait a few seconds and try again

### "Cannot find module @next-auth"
- Run `npm install next-auth`
- Make sure `package.json` has `next-auth` dependency

### Database errors
- Delete `prisma/dev.db` file
- Run `npx prisma db push` again

### Port 3000 already in use
```bash
# Use different port
npm run dev -- -p 3001

# Or kill process using port 3000
# Windows:
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# Mac/Linux:
lsof -ti:3000 | xargs kill -9
```

---

## 🎯 Development Workflow

**Each time you work on the project:**

1. Navigate to folder:
   ```bash
   cd I:\ARC-RAIDERS_LFG
   ```

2. Start dev server:
   ```bash
   npm run dev
   ```

3. Open in browser:
   ```
   http://localhost:3000
   ```

4. Make changes to files
5. Changes auto-reload in browser
6. Stop server when done: `Ctrl+C`

---

## 📦 Common Commands

```bash
# Start development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Database management
npx prisma db push          # Sync schema with database
npx prisma generate         # Generate Prisma client
npx prisma studio           # Open database viewer
npx prisma migrate dev       # Create new migration

# Install packages
npm install package-name
```

---

## ✅ Checklist - You're Done When:

- [ ] Discord app created
- [ ] Client ID & Secret copied
- [ ] Project folder created
- [ ] Next.js initialized
- [ ] Files copied to correct locations
- [ ] `.env.local` created with all variables
- [ ] `npm install` completed
- [ ] `npx prisma db push` successful
- [ ] `npm run dev` runs without errors
- [ ] Can visit `http://localhost:3000`
- [ ] Can sign in with Discord
- [ ] User created in database
- [ ] Can sign out

---

## 🎓 What You've Built

A production-ready LFG platform with:
- ✅ Discord OAuth authentication
- ✅ SQLite database
- ✅ User profiles
- ✅ Type-safe API routes
- ✅ React components
- ✅ State management
- ✅ Dark gaming theme
- ✅ Mobile responsive

---

## 🚀 Next Steps

1. **Link EMBARK ID** - Add ARC Raiders game profile linking
2. **Create LFG Page** - Browse looking for group posts
3. **Add Friends** - Send and manage friend requests
4. **Deploy** - Push to production when ready

See **DISCORD_OAUTH_SETUP.md** for detailed OAuth info and customization options.

---

## 💬 Need Help?

- **Discord OAuth Issues?** → Check DISCORD_OAUTH_SETUP.md
- **Database Problems?** → Run `npx prisma studio` to debug
- **Port Issues?** → Try different port with `npm run dev -- -p 3001`
- **Still stuck?** → Check console for specific error messages

---

**Congratulations! You now have a working local development setup!** 🎉

**Start building features and have fun!** 🎮🚀
