// src/app/api/users/profile/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        discordId: true,
        discordTag: true,
        discordAvatar: true,
        embarkId: true,
        embarkUsername: true,
        bio: true,
        timezone: true,
        platform: true,
        createdAt: true,
        updatedAt: true,
        gameProfile: {
          select: {
            level: true,
            rank: true,
            totalKills: true,
            totalDeaths: true,
            totalWins: true,
            totalMatches: true,
            totalExtracts: true,
            playstyle: true,
            favoriteWeapon: true,
            favoriteMap: true,
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('[PROFILE GET]', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { bio, timezone, platform } = body

    const updatedUser = await prisma.user.update({
      where: { id: (session.user as any).id },
      data: {
        ...(bio !== undefined && { bio }),
        ...(timezone !== undefined && { timezone }),
        ...(platform !== undefined && { platform }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        timezone: true,
        platform: true,
        updatedAt: true,
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('[PROFILE PATCH]', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
