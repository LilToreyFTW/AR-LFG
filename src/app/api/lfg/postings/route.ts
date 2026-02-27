import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/db'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const gameMode = searchParams.get('gameMode')
    const skillLevel = searchParams.get('skillLevel')

    const postings = await prisma.lFGPosting.findMany({
      where: {
        status: 'active',
        ...(gameMode && gameMode !== 'Any' ? { gameMode } : {}),
        ...(skillLevel && skillLevel !== 'Any' ? { skillLevel } : {}),
      },
      include: {
        creator: { select: { id: true, name: true, image: true, embarkUsername: true } },
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
    const { userId: clerkId } = await auth()
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Find or create user record
    let user = await prisma.user.findFirst({ where: { discordId: clerkId } })
    if (!user) {
      user = await prisma.user.create({
        data: { discordId: clerkId },
      })
    }

    const body = await req.json()
    const { title, description, gameMode, skillLevel, playersNeeded, timezone, language } = body

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 })
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h

    const posting = await prisma.lFGPosting.create({
      data: {
        creatorId: user.id,
        title,
        description,
        gameMode: gameMode || 'Any',
        skillLevel: skillLevel || 'Any',
        playersNeeded: Number(playersNeeded) || 2,
        timezone: timezone || 'UTC',
        language: language || 'English',
        expiresAt,
      },
    })

    return NextResponse.json(posting, { status: 201 })
  } catch (err) {
    console.error('[LFG POST]', err)
    return NextResponse.json({ error: 'Failed to create posting' }, { status: 500 })
  }
}
