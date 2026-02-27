// src/app/api/admin/users/route.ts
import { auth } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db'
import { isOwner } from '@/lib/owner'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id || !isOwner(session.user.id)) {
      return NextResponse.json(
        { error: 'Unauthorized - Owner access only' },
        { status: 403 }
      )
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        discordId: true,
        embarkId: true,
        role: true,
        isOwner: true,
        isAdmin: true,
        isBanned: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Admin users error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ---

// src/app/api/admin/postings/route.ts
import { auth } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db'
import { isOwner } from '@/lib/owner'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id || !isOwner(session.user.id)) {
      return NextResponse.json(
        { error: 'Unauthorized - Owner access only' },
        { status: 403 }
      )
    }

    const postings = await prisma.lFGPosting.findMany({
      include: {
        creator: {
          select: { id: true, name: true, image: true },
        },
        participants: {
          select: { id: true, userId: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(postings)
  } catch (error) {
    console.error('Admin postings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ---

// src/app/api/admin/stats/route.ts
import { auth } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db'
import { isOwner } from '@/lib/owner'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id || !isOwner(session.user.id)) {
      return NextResponse.json(
        { error: 'Unauthorized - Owner access only' },
        { status: 403 }
      )
    }

    const [totalUsers, activePostings, verifiedPlayers, bannedUsers] = await Promise.all([
      prisma.user.count(),
      prisma.lFGPosting.count({ where: { status: 'active' } }),
      prisma.user.count({ where: { embarkId: { not: null } } }),
      prisma.user.count({ where: { isBanned: true } }),
    ])

    const stats = {
      totalUsers,
      activePostings,
      verifiedPlayers,
      bannedUsers,
      healthScore: calculateHealth(totalUsers, activePostings),
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function calculateHealth(users: number, postings: number): number {
  // Simple health calculation
  const userHealth = Math.min(users / 100, 100) // 100+ users = 100 points
  const postingHealth = Math.min(postings / 50, 100) // 50+ postings = 100 points
  return Math.round((userHealth + postingHealth) / 2)
}

// ---

// src/app/api/admin/ban-user/route.ts
import { auth } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db'
import { isOwner } from '@/lib/owner'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id || !isOwner(session.user.id)) {
      return NextResponse.json(
        { error: 'Unauthorized - Owner access only' },
        { status: 403 }
      )
    }

    const { userId, reason } = await req.json()

    // Can't ban yourself or owner
    if (isOwner(userId)) {
      return NextResponse.json(
        { error: 'Cannot ban the owner' },
        { status: 400 }
      )
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: true,
        banReason: reason,
        bannedAt: new Date(),
      },
    })

    // Log the action
    await prisma.modAction.create({
      data: {
        moderatorId: session.user.id,
        targetUserId: userId,
        action: 'ban',
        reason,
      },
    })

    return NextResponse.json({ success: true, user })
  } catch (error: any) {
    console.error('Ban user error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// ---

// src/app/api/admin/feature-posting/route.ts
import { auth } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db'
import { isOwner } from '@/lib/owner'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id || !isOwner(session.user.id)) {
      return NextResponse.json(
        { error: 'Unauthorized - Owner access only' },
        { status: 403 }
      )
    }

    const { postingId, featured } = await req.json()

    const posting = await prisma.lFGPosting.update({
      where: { id: postingId },
      data: { isFeatured: featured },
    })

    return NextResponse.json({ success: true, posting })
  } catch (error: any) {
    console.error('Feature posting error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
