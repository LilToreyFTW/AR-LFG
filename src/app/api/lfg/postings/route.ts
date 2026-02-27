// src/app/api/lfg/postings/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const gameMode  = searchParams.get('gameMode')
    const skillLevel = searchParams.get('skillLevel')

    const postings = await prisma.lFGPosting.findMany({
      where: {
        status: 'active',
        ...(gameMode   && gameMode   !== 'Any' ? { gameMode }   : {}),
        ...(skillLevel && skillLevel !== 'Any' ? { skillLevel } : {}),
      },
      include: {
        creator:      { select: { id: true, name: true, image: true, embarkUsername: true, discordTag: true } },
        participants: { select: { userId: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json(postings)
  } catch (err) {
    console.error('[LFG GET]', err)
    return NextResponse.json({ error: 'Failed to fetch postings' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!(session?.user as any)?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { title, description, gameMode, skillLevel, playersNeeded, timezone, language, preferredMap } = body

    if (!title?.trim() || !description?.trim()) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 })
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    const posting = await prisma.lFGPosting.create({
      data: {
        creatorId:    (session.user as any).id,
        title,
        description,
        gameMode:     gameMode     || 'Extraction',
        skillLevel:   skillLevel   || 'Any',
        playersNeeded: Number(playersNeeded) || 2,
        timezone:     timezone     || 'UTC',
        language:     language     || 'English',
        preferredMap: preferredMap || 'Any',
        expiresAt,
      },
    })

    return NextResponse.json(posting, { status: 201 })
  } catch (err) {
    console.error('[LFG POST]', err)
    return NextResponse.json({ error: 'Failed to create posting' }, { status: 500 })
  }
}



