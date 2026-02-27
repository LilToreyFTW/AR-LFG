# Quick Reference Card & Architecture

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT (Browser)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Sign Up/In  │  │  Browse LFG  │  │  My Profile  │          │
│  │   (Clerk)    │  │   (Browse)   │  │  (Dashboard) │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                          ▼                                       │
│                   React Components                               │
│                   (Next.js App Router)                           │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP/HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NEXT.JS SERVER                                │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              Clerk Middleware                           │    │
│  │         (Protects authenticated routes)               │    │
│  └────────────────────────────────────────────────────────┘    │
│                         ▼                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  API Routes  │  │   Pages      │  │ Components   │         │
│  │              │  │              │  │              │         │
│  │ /api/users   │  │ /lfg         │  │ Navigation   │         │
│  │ /api/lfg     │  │ /dashboard   │  │ Cards        │         │
│  │ /api/friends │  │ /profile     │  │ Forms        │         │
│  └──────┬───────┘  └──────────────┘  └──────────────┘         │
│         │                                                       │
│         └─────────────────┬──────────────────────────           │
│                           ▼                                     │
│                   Prisma ORM Client                             │
│                  (Type-safe queries)                            │
└────────────────┬──────────────────────────────────────────────┘
                 │ Database Connection
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ User Table   │  │ GameProfile  │  │ LFGPosting   │         │
│  │              │  │              │  │              │         │
│  │ - id         │  │ - userId     │  │ - creatorId  │         │
│  │ - email      │  │ - embarkId   │  │ - title      │         │
│  │ - embarkId   │  │ - level      │  │ - gameMode   │         │
│  │ - username   │  │ - rank       │  │ - status     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │FriendRequest │  │    Friend    │  │  GameInvite  │         │
│  │              │  │              │  │              │         │
│  │ - senderId   │  │ - userId     │  │ - inviterId  │         │
│  │ - receiverId │  │ - friendId   │  │ - inviteeId  │         │
│  │ - status     │  │ - createdAt  │  │ - gameMode   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
│              PostgreSQL Database                                │
│            (or SQLite for development)                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📡 API Endpoints Reference

### User Management
```
GET    /api/users/profile              → Get current user profile
PUT    /api/users/profile              → Update user profile
POST   /api/users/link-embark          → Link EMBARK ID
GET    /api/users/[id]                 → Get user by ID
```

### LFG Postings
```
GET    /api/lfg/postings               → List all active postings
POST   /api/lfg/postings               → Create new posting
GET    /api/lfg/postings/[id]          → Get specific posting
POST   /api/lfg/postings/[id]/join     → Join a group
POST   /api/lfg/postings/[id]/leave    → Leave a group
PUT    /api/lfg/postings/[id]          → Update posting
DELETE /api/lfg/postings/[id]          → Close posting
```

### Friend System
```
GET    /api/friends/requests           → Get friend requests
POST   /api/friends/requests           → Send friend request
PUT    /api/friends/requests/[id]      → Accept/reject request
GET    /api/friends/list               → Get friends list
DELETE /api/friends/[id]               → Remove friend
```

### Game Invites
```
GET    /api/game-invites               → Get invites
POST   /api/game-invites               → Send game invite
PUT    /api/game-invites/[id]          → Accept/decline invite
```

### Notifications
```
GET    /api/notifications              → Get notifications
PUT    /api/notifications/[id]         → Mark as read
```

---

## 🔑 Environment Variables

```env
# Core
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/setup-profile

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/arc_lfg
# OR for SQLite:
# DATABASE_URL=file:./prisma/dev.db

# Embark/ARC Raiders API
EMBARK_API_KEY=your_embark_api_key
NEXT_PUBLIC_EMBARK_API_URL=https://api.embark.games/arc-raiders

# Virtual Server (optional)
VIRTUAL_SERVER_IP=192.168.1.100
SERVER_PORT=3000
```

---

## 🔄 User Journey Flow

```
1. Landing Page
   ↓
2. Sign Up (Clerk OAuth)
   ↓
3. Profile Created
   ↓
4. Link EMBARK ID (Optional but recommended)
   ├─→ Validates against Embark API
   ├─→ Fetches player stats
   └─→ Creates GameProfile
   ↓
5. Dashboard
   ├─→ View profile
   ├─→ Browse LFG postings
   ├─→ Friend requests
   └─→ Game invites
   ↓
6. Browse LFG Groups
   ├─→ Filter by game mode, skill level
   ├─→ View creator stats
   └─→ Join matching groups
   ↓
7. Create LFG Posting
   ├─→ Set game mode, skill level
   ├─→ Specify needed players
   └─→ Wait for joins
   ↓
8. Manage Team
   ├─→ See participants
   ├─→ Send game invites
   └─→ Build friends list
```

---

## 💾 Database Relationships

```
User (1) ──→ (1) GameProfile
User (1) ──→ (M) LFGPosting [creator]
User (1) ──→ (M) LFGParticipant
User (1) ──→ (M) FriendRequest [sender]
User (1) ──→ (M) FriendRequest [receiver]
User (1) ──→ (M) Friend [user]
User (1) ──→ (M) Friend [friend]
User (1) ──→ (M) GameInvite [inviter]
User (1) ──→ (M) GameInvite [invitee]

LFGPosting (1) ──→ (M) LFGParticipant
LFGPosting (1) ──→ (1) User [creator]

FriendRequest (M) ──→ (1) User [sender]
FriendRequest (M) ──→ (1) User [receiver]

Friend (M) ──→ (1) User [user]
Friend (M) ──→ (1) User [friend]

GameInvite (M) ──→ (1) User [inviter]
GameInvite (M) ──→ (1) User [invitee]
```

---

## 🎯 Common Code Snippets

### Fetch Current User
```typescript
import { useUser } from '@clerk/nextjs'

export function MyComponent() {
  const { user, isLoaded } = useUser()
  
  if (!isLoaded) return <div>Loading...</div>
  if (!user) return <div>Not signed in</div>
  
  return <div>Welcome, {user.firstName}!</div>
}
```

### Make API Request
```typescript
import axios from 'axios'

// GET request
const { data } = await axios.get('/api/users/profile')

// POST request
const { data } = await axios.post('/api/lfg/postings', {
  title: 'Looking for competitive squad',
  gameMode: 'Team Death Match',
  playersNeeded: 3,
})

// Handle errors
try {
  await axios.post('/api/friends/requests', { receiverId })
} catch (error) {
  console.error(error.response.data.error)
}
```

### Use Zustand Store
```typescript
import { useAuthStore, useLFGStore } from '@/lib/store'

export function MyComponent() {
  const user = useAuthStore((state) => state.user)
  const postings = useLFGStore((state) => state.postings)
  
  return (
    <div>
      <h1>{user?.username}</h1>
      {postings.map(p => <div key={p.id}>{p.title}</div>)}
    </div>
  )
}
```

### Query Database with Prisma
```typescript
import { prisma } from '@/lib/db'

// Create
const user = await prisma.user.create({
  data: { clerkId, email, username }
})

// Read
const user = await prisma.user.findUnique({
  where: { clerkId },
  include: { gameProfile: true, friends: true }
})

// Update
const user = await prisma.user.update({
  where: { id },
  data: { bio: 'New bio' }
})

// Delete
await prisma.user.delete({ where: { id } })
```

---

## 📊 Performance Tips

| Tip | Benefit |
|-----|---------|
| Enable caching | Reduce API calls by 80% |
| Paginate results | Faster initial load |
| Index DB columns | 10x faster queries |
| Optimize images | 50% smaller bundle |
| Use CDN | Global fast delivery |
| Database pooling | Handle more concurrent users |

---

## 🔒 Security Checklist

- [ ] Clerk middleware protecting routes
- [ ] Environment variables not in code
- [ ] CORS configured correctly
- [ ] API validates user ownership
- [ ] SQL injection prevention (Prisma)
- [ ] XSS protection (React)
- [ ] Rate limiting on API
- [ ] HTTPS only in production
- [ ] Database backups scheduled
- [ ] Secrets rotated regularly

---

## 📱 Responsive Breakpoints

```css
/* Tailwind default breakpoints */
sm: 640px    /* Small phones */
md: 768px    /* Tablets */
lg: 1024px   /* Desktops */
xl: 1280px   /* Wide screens */
2xl: 1536px  /* Extra wide */
```

Use in components:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* 1 col on mobile, 2 on tablet, 3 on desktop */}
</div>
```

---

## ⚡ Performance Metrics Target

| Metric | Target | Tool |
|--------|--------|------|
| Largest Contentful Paint | < 2.5s | Lighthouse |
| First Input Delay | < 100ms | Lighthouse |
| Cumulative Layout Shift | < 0.1 | Lighthouse |
| Page Load Time | < 3s | GTmetrix |
| Time to Interactive | < 4s | Lighthouse |

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] No console errors
- [ ] Environment variables set
- [ ] Database migrated
- [ ] Images optimized
- [ ] Build succeeds: `npm run build`

### Deployment
- [ ] Choose platform (Vercel, Docker, Heroku)
- [ ] Set environment variables
- [ ] Run database migrations
- [ ] Test in staging
- [ ] Monitor logs

### Post-Deployment
- [ ] Test all features
- [ ] Check analytics
- [ ] Monitor error logs
- [ ] Set up backups
- [ ] Configure domain/SSL
- [ ] Enable caching
- [ ] Set up monitoring

---

## 📞 Quick Links

| Resource | URL |
|----------|-----|
| **Next.js Docs** | https://nextjs.org/docs |
| **Clerk Docs** | https://clerk.com/docs |
| **Prisma Docs** | https://prisma.io/docs |
| **Tailwind CSS** | https://tailwindcss.com |
| **TypeScript** | https://www.typescriptlang.org/docs |
| **GitHub** | https://github.com |
| **Vercel** | https://vercel.com |
| **Railway** | https://railway.app |
| **Supabase** | https://supabase.com |

---

## 🎓 Learning Path

1. **Day 1:** Install & setup (1-2 hours)
2. **Day 2:** Understand architecture (2-3 hours)
3. **Day 3:** Add features (4-6 hours)
4. **Day 4:** Styling & polish (3-4 hours)
5. **Day 5:** Testing & deployment (3-4 hours)

---

## 🎉 Success Checklist

✅ Project created
✅ Dependencies installed
✅ Database set up
✅ Authentication working
✅ Can sign up/sign in
✅ Can link EMBARK ID
✅ Can create LFG posting
✅ Can browse postings
✅ Can send friend requests
✅ Deployed to production
✅ Domain configured
✅ Shared with friends!

---

**You've got this!** 🚀
