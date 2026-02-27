# ARC Raiders LFG - Complete Setup Guide

## 📋 Project Overview

**ARC Raiders LFG** is a full-stack Looking For Group (LFG) platform built with Next.js, Clerk Authentication, and Prisma ORM. It allows gamers to:

- Sign up with OAuth (Clerk Keyless Mode)
- Link their EMBARK ID from ARC Raiders
- Create and browse LFG postings
- Find teammates matching their skill level
- Send and receive friend requests
- Join gaming squads

---

## 🏗️ Project Structure

```
arc-raiders-lfg/
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout with ClerkProvider
│   │   ├── page.tsx                   # Landing page
│   │   ├── globals.css                # Global styles
│   │   ├── sign-in/
│   │   │   └── [[...index]]/
│   │   │       └── page.tsx           # Clerk sign-in page
│   │   ├── sign-up/
│   │   │   └── [[...index]]/
│   │   │       └── page.tsx           # Clerk sign-up page
│   │   ├── dashboard/
│   │   │   └── page.tsx               # User dashboard
│   │   ├── lfg/
│   │   │   ├── page.tsx               # LFG browser page
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx           # LFG posting detail page
│   │   │   └── create/
│   │   │       └── page.tsx           # Create LFG posting
│   │   └── api/
│   │       ├── users/
│   │       │   ├── profile/
│   │       │   │   └── route.ts       # GET/PUT user profile
│   │       │   └── link-embark/
│   │       │       └── route.ts       # POST link Embark ID
│   │       └── lfg/
│   │           ├── postings/
│   │           │   └── route.ts       # GET/POST LFG postings
│   │           └── [id]/
│   │               └── route.ts       # GET LFG posting by ID
│   ├── components/
│   │   ├── Navigation.tsx             # Top navigation bar
│   │   ├── LinkEmbarkId.tsx           # Embark ID linking form
│   │   ├── LFGPostingCard.tsx         # LFG posting card component
│   │   ├── UserCard.tsx               # User profile card
│   │   └── FriendRequestList.tsx      # Friend requests list
│   ├── lib/
│   │   ├── db.ts                      # Prisma client
│   │   ├── store.ts                   # Zustand stores
│   │   ├── embark-api.ts              # Embark API integration
│   │   └── utils.ts                   # Utility functions
│   └── types/
│       └── index.ts                   # TypeScript type definitions
├── prisma/
│   ├── schema.prisma                  # Database schema
│   └── migrations/                    # Database migrations
├── public/
│   └── favicon.ico
├── .env.local.template                # Environment variables template
├── middleware.ts                      # Clerk middleware
├── next.config.js                     # Next.js config
├── tailwind.config.js                 # Tailwind CSS config
├── postcss.config.js                  # PostCSS config
├── package.json                       # Dependencies
├── tsconfig.json                      # TypeScript config
└── README.md
```

---

## 🚀 Installation Steps

### 1. **Create Project Directory**

```bash
mkdir -p I:\ARC-RAIDERS_LFG
cd I:\ARC-RAIDERS_LFG
```

### 2. **Initialize Next.js Project**

```bash
npx create-next-app@latest . --typescript --tailwind --app
```

Choose the following options:
- ESLint: Yes
- src/ directory: Yes
- App Router: Yes
- Customize import alias: Yes (use @/*)

### 3. **Install Dependencies**

```bash
npm install \
  @clerk/nextjs \
  @prisma/client \
  axios \
  zustand \
  react-hot-toast \
  lucide-react \
  clsx
```

### 4. **Install Dev Dependencies**

```bash
npm install -D \
  prisma \
  @types/node \
  typescript
```

### 5. **Copy Configuration Files**

Copy the provided files to your project:
- `middleware.ts` → project root
- `src/app/layout.tsx` → src/app/
- `src/app/globals.css` → src/app/
- `tailwind.config.js` → project root
- `postcss.config.js` → project root
- `tsconfig.json` → project root
- `next.config.js` → project root

### 6. **Set Up Database**

#### Option A: PostgreSQL (Recommended)

```bash
# Install PostgreSQL locally or use a cloud provider:
# - Supabase: https://supabase.com
# - Railway: https://railway.app
# - Heroku: https://heroku.com
# - PlanetScale: https://planetscale.com

# After creating database, update .env.local
DATABASE_URL="postgresql://user:password@localhost:5432/arc_raiders_lfg"

# Run migrations
npx prisma db push
```

#### Option B: SQLite (Development)

```bash
# Update .env.local
DATABASE_URL="file:./prisma/dev.db"

# Initialize database
npx prisma db push
```

### 7. **Set Up Clerk Authentication**

1. Go to https://dashboard.clerk.com
2. Create a new application
3. Copy your API keys
4. Fill in `.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key_here
CLERK_SECRET_KEY=your_secret_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/setup-profile
```

### 8. **Create Clerk Pages**

```bash
# Create sign-in page
mkdir -p src/app/sign-in/\[\[...index\]\]
touch src/app/sign-in/\[\[...index\]\]/page.tsx
```

```typescript
// src/app/sign-in/[[...index]]/page.tsx
import { SignIn } from "@clerk/nextjs";
import Navigation from "@/components/Navigation";

export default function SignInPage() {
  return (
    <>
      <Navigation />
      <div className="pt-32 flex justify-center">
        <SignIn />
      </div>
    </>
  );
}
```

```bash
# Create sign-up page
mkdir -p src/app/sign-up/\[\[...index\]\]
touch src/app/sign-up/\[\[...index\]\]/page.tsx
```

```typescript
// src/app/sign-up/[[...index]]/page.tsx
import { SignUp } from "@clerk/nextjs";
import Navigation from "@/components/Navigation";

export default function SignUpPage() {
  return (
    <>
      <Navigation />
      <div className="pt-32 flex justify-center">
        <SignUp />
      </div>
    </>
  );
}
```

### 9. **Configure Embark API** (Optional for testing)

Get your Embark API credentials and update `.env.local`:

```env
EMBARK_API_KEY=your_api_key_here
NEXT_PUBLIC_EMBARK_API_URL=https://api.embark.games/arc-raiders
```

### 10. **Create API Routes**

Create the following directories and files:

```bash
mkdir -p src/app/api/users/profile
mkdir -p src/app/api/users/link-embark
mkdir -p src/app/api/lfg/postings
mkdir -p src/app/api/lfg/[id]
mkdir -p src/app/api/friends/requests
```

Copy the provided API route files into these directories.

### 11. **Generate Prisma Client**

```bash
npx prisma generate
```

### 12. **Start Development Server**

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 🔐 Clerk Keyless Mode Setup

**Clerk Keyless Mode** allows you to start developing immediately without signing up:

1. Install dependencies as above
2. Add `@clerk/nextjs` without environment variables
3. Run `npm run dev`
4. Clerk automatically generates temporary keys
5. You'll see a "Configure your application" prompt
6. Click to claim and sign up when ready

---

## 🛠️ Creating Additional Pages

### Dashboard Page

```bash
mkdir -p src/app/dashboard
touch src/app/dashboard/page.tsx
```

```typescript
// src/app/dashboard/page.tsx
'use client'

import Navigation from '@/components/Navigation'
import { useUser } from '@clerk/nextjs'
import LinkEmbarkId from '@/components/LinkEmbarkId'

export default function Dashboard() {
  const { user, isLoaded } = useUser()

  if (!isLoaded) return <div>Loading...</div>

  return (
    <>
      <Navigation />
      <main className="pt-20 min-h-screen px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Welcome back, {user?.firstName}!</h1>
          
          {!user?.publicMetadata?.embarkId && (
            <LinkEmbarkId />
          )}
        </div>
      </main>
    </>
  )
}
```

### LFG Browser Page

```bash
mkdir -p src/app/lfg
touch src/app/lfg/page.tsx
```

```typescript
// src/app/lfg/page.tsx
'use client'

import Navigation from '@/components/Navigation'
import { useEffect, useState } from 'react'
import axios from 'axios'
import LFGPostingCard from '@/components/LFGPostingCard'

export default function LFGBrowser() {
  const [postings, setPostings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPostings()
  }, [])

  const fetchPostings = async () => {
    try {
      const response = await axios.get('/api/lfg/postings')
      setPostings(response.data.data)
    } catch (error) {
      console.error('Error fetching postings:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navigation />
      <main className="pt-20 min-h-screen px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Find a Group</h1>
          
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {postings.map((posting: any) => (
                <LFGPostingCard key={posting.id} posting={posting} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
```

---

## 🌐 Virtual Server Setup (Advanced)

### Using Ngrok for Local Tunneling

```bash
# Install Ngrok
choco install ngrok  # Windows with Chocolatey
brew install ngrok   # macOS

# Create ngrok account at https://ngrok.com

# Start tunnel
ngrok http 3000

# You'll get a public URL like: https://abc123.ngrok.io
```

### Using Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t arc-lfg .
docker run -p 3000:3000 arc-lfg
```

---

## 📝 Environment Variables

Create `.env.local`:

```env
# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/setup-profile

# Database
DATABASE_URL=

# API
NEXT_PUBLIC_API_URL=http://localhost:3000

# Embark API
EMBARK_API_KEY=
NEXT_PUBLIC_EMBARK_API_URL=https://api.embark.games/arc-raiders

# Server
NODE_ENV=development
```

---

## 🎨 Customization

### Change Colors

Edit `tailwind.config.js` and `src/app/globals.css` to match your branding.

### Add New Features

1. Update `prisma/schema.prisma`
2. Run `npx prisma migrate dev`
3. Create API routes
4. Create React components

### Integrate Real Embark API

Contact Embark Games for official API access and update `embark-api.ts`.

---

## 🚀 Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Deploy to Other Platforms

- **Railway:** `railway deploy`
- **Render:** Connect GitHub repo
- **Netlify:** `netlify deploy`
- **AWS Amplify:** Via AWS Console

---

## 📚 Next Steps

1. ✅ Complete the setup above
2. ✅ Test sign-up/sign-in
3. ✅ Link Embark ID (mock or real)
4. ✅ Create LFG postings
5. ✅ Browse and join groups
6. ✅ Send friend requests
7. ✅ Deploy to production

---

## 🆘 Troubleshooting

**Clerk not loading:**
- Check env variables
- Clear `.next/` folder
- Restart dev server

**Database errors:**
- Verify DATABASE_URL
- Run `npx prisma db push`
- Check database connection

**API errors:**
- Check CORS settings
- Verify Clerk middleware
- Check network tab

---

## 📞 Support

- Clerk Docs: https://clerk.com/docs
- Next.js Docs: https://nextjs.org/docs
- Prisma Docs: https://www.prisma.io/docs
- Tailwind CSS: https://tailwindcss.com/docs

Good luck! 🎮
