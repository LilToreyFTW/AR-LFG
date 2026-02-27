// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import DiscordProvider from 'next-auth/providers/discord'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/db'
import type { NextAuthOptions } from 'next-auth'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        // Attach discordId and embarkId to every session
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { discordId: true, embarkId: true, embarkUsername: true },
        })
        ;(session.user as any).discordId     = dbUser?.discordId     ?? null
        ;(session.user as any).embarkId      = dbUser?.embarkId      ?? null
        ;(session.user as any).embarkUsername = dbUser?.embarkUsername ?? null
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Save Discord-specific fields on first sign-in
      if (account?.provider === 'discord' && profile) {
        const discordProfile = profile as any
        await prisma.user.update({
          where: { id: user.id },
          data: {
            discordId:     discordProfile.id,
            discordTag:    discordProfile.username,
            discordAvatar: discordProfile.avatar
              ? `https://cdn.discordapp.com/avatars/${discordProfile.id}/${discordProfile.avatar}.png`
              : null,
          },
        }).catch(() => {/* user row may not exist yet on very first sign-in — adapter handles it */})
      }
      return true
    },
  },
  pages: {
    signIn:  '/sign-in',
    signOut: '/',
    error:   '/sign-in',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
export const auth = () => handler
