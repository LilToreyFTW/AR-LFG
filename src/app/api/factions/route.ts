// src/app/api/factions/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const allegiance = searchParams.get('allegiance')
    const playstyle = searchParams.get('playstyle')

    const factions = await prisma.faction.findMany({
      where: {
        isPublic: true,
        ...(allegiance && allegiance !== 'Any' ? { allegiance } : {}),
        ...(playstyle && playstyle !== 'Any' ? { playstyle } : {}),
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
            discordTag: true,
            embarkUsername: true,
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                discordTag: true,
                embarkUsername: true,
              }
            }
          }
        },
        _count: {
          select: { members: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    return NextResponse.json(factions)
  } catch (error) {
    console.error('[FACTIONS GET]', error)
    return NextResponse.json({ error: 'Failed to fetch factions' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, tag, description, allegiance, playstyle, bannerColor, maxMembers } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Faction name is required' }, { status: 400 })
    }

    const userId = (session.user as any).id

    // Check if faction name already exists
    const existingFaction = await prisma.faction.findUnique({
      where: { name: name.trim() }
    })

    if (existingFaction) {
      return NextResponse.json({ error: 'Faction name already exists' }, { status: 400 })
    }

    const faction = await prisma.faction.create({
      data: {
        name: name.trim(),
        tag: tag?.trim() || null,
        description: description?.trim() || null,
        allegiance: allegiance || 'Custom',
        playstyle: playstyle || 'Balanced',
        bannerColor: bannerColor || '#00d9ff',
        maxMembers: Number(maxMembers) || 0,
        creatorId: userId,
        isPublic: true,
        isPreset: false,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
            discordTag: true,
            embarkUsername: true,
          }
        }
      }
    })

    // Add creator as faction leader
    await prisma.factionMember.create({
      data: {
        factionId: faction.id,
        userId: userId,
        role: 'Leader',
        status: 'active'
      }
    })

    return NextResponse.json(faction)
  } catch (error) {
    console.error('[FACTIONS POST]', error)
    return NextResponse.json({ error: 'Failed to create faction' }, { status: 500 })
  }
}
