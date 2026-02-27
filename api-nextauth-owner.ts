// src/app/api/auth/[...nextauth]/route.ts (UPDATED)
import NextAuth, { type NextAuthOptions, type Session } from 'next-auth'
import DiscordProvider from 'next-auth/providers/discord'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/db'
import { OWNER_CONFIG } from '@/lib/owner'

declare module 'next-auth' {
  interface User {
    id: string
    role?: string
    isOwner?: boolean
    embarkId?: string | null
  }

  interface Session {
    user: {
      id: string
      email?: string | null
      name?: string | null
      image?: string | null
      role?: string
      isOwner?: boolean
      embarkId?: string | null
    }
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID || '',
      clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      // Check if this Discord ID is the owner
      if (account?.providerAccountId === OWNER_CONFIG.discordId) {
        // Update user in database to mark as owner
        await prisma.user.update({
          where: { id: user.id },
          data: {
            isOwner: true,
            isAdmin: true,
            role: 'owner',
          },
        })
      }

      return true
    },

    async session({ session, user }: { session: Session; user: any }) {
      if (session.user) {
        session.user.id = user.id
        session.user.role = user.role || 'user'
        session.user.isOwner = user.isOwner || false
        session.user.embarkId = user.embarkId

        // If Discord ID matches owner, ensure they have owner role
        if (user.discordId === OWNER_CONFIG.discordId) {
          session.user.isOwner = true
          session.user.role = 'owner'
        }
      }
      return session
    },

    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl + '/dashboard'
    },
  },

  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/setup-profile',
  },

  events: {
    async signIn({ user }) {
      // Log sign in
      console.log(`User signed in: ${user.email}`)

      // If owner, create admin log
      if (user.id && user.isOwner) {
        await prisma.adminLog.create({
          data: {
            userId: user.id,
            action: 'owner_signin',
            details: JSON.stringify({
              email: user.email,
              name: user.name,
              timestamp: new Date(),
            }),
          },
        }).catch(err => console.error('Failed to log admin signin:', err))
      }
    },

    async signOut() {
      console.log('User signed out')
    },
  },

  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },

  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }

// Export authOptions for use in other files
export const auth = async () => {
  return await (async () => {
    // This is a placeholder - in production you'd get the actual session
    return null
  })()
}
