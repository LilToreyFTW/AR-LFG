// src/app/api/groups/route.ts
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
    const gameMode = searchParams.get('gameMode')
    const skillLevel = searchParams.get('skillLevel')
    const platform = searchParams.get('platform')

    const groups = await prisma.group.findMany({
      where: {
        isPublic: true,
        status: 'recruiting',
        ...(gameMode && gameMode !== 'Any' ? { gameMode } : {}),
        ...(skillLevel && skillLevel !== 'Any' ? { skillLevel } : {}),
        ...(platform && platform !== 'Any' ? { platform } : {}),
      },
      include: {
        leader: {
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
        faction: {
          select: {
            id: true,
            name: true,
            tag: true,
            bannerColor: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    return NextResponse.json(groups)
  } catch (error) {
    console.error('[GROUPS GET]', error)
    return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { 
      name, 
      description, 
      gameMode, 
      skillLevel, 
      maxSize, 
      isSquad, 
      preferredMap, 
      timezone, 
      language, 
      platform,
      factionId 
    } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Group name is required' }, { status: 400 })
    }

    const userId = (session.user as any).id

    const group = await prisma.group.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        leaderId: userId,
        factionId: factionId || null,
        gameMode: gameMode || 'Any',
        skillLevel: skillLevel || 'Any',
        maxSize: Number(maxSize) || 3,
        isSquad: isSquad !== false,
        isPublic: true,
        preferredMap: preferredMap || 'Any',
        timezone: timezone || 'UTC',
        language: language || 'English',
        platform: platform || 'Crossplay',
        status: 'recruiting'
      },
      include: {
        leader: {
          select: {
            id: true,
            name: true,
            image: true,
            discordTag: true,
            embarkUsername: true,
          }
        },
        faction: {
          select: {
            id: true,
            name: true,
            tag: true,
            bannerColor: true,
          }
        }
      }
    })

    // Add leader as group member
    await prisma.groupMember.create({
      data: {
        groupId: group.id,
        userId: userId,
        role: 'Leader',
        status: 'active'
      }
    })

    return NextResponse.json(group)
  } catch (error) {
    console.error('[GROUPS POST]', error)
    return NextResponse.json({ error: 'Failed to create group' }, { status: 500 })
  }
}
