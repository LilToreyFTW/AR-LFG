// src/lib/auth.ts — shared NextAuth config (import this everywhere)
import DiscordProvider from 'next-auth/providers/discord'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/db'
import type { NextAuthOptions } from 'next-auth'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    DiscordProvider({
      clientId:     process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { discordId: true, embarkId: true, embarkUsername: true },
        })
        ;(session.user as any).discordId      = dbUser?.discordId      ?? null
        ;(session.user as any).embarkId       = dbUser?.embarkId       ?? null
        ;(session.user as any).embarkUsername = dbUser?.embarkUsername ?? null
      }
      return session
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === 'discord' && profile) {
        const p = profile as any
        await prisma.user.update({
          where: { id: user.id },
          data: {
            discordId:     p.id,
            discordTag:    p.username,
            discordAvatar: p.avatar
              ? `https://cdn.discordapp.com/avatars/${p.id}/${p.avatar}.png`
              : null,
          },
        }).catch(() => {/* handled by adapter on first sign-in */})
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
