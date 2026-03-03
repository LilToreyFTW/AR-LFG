// src/app/api/users/link-embark/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { embarkId } = body

    if (!embarkId?.trim()) {
      return NextResponse.json({ error: 'Embark ID is required' }, { status: 400 })
    }

    // Check if Embark ID is already taken by another user
    const existingUser = await prisma.user.findUnique({
      where: { embarkId: embarkId.trim() },
      select: { id: true, name: true }
    })

    if (existingUser && existingUser.id !== (session.user as any).id) {
      return NextResponse.json({ error: 'Embark ID is already linked to another account' }, { status: 409 })
    }

    // Update user's Embark ID
    const updatedUser = await prisma.user.update({
      where: { id: (session.user as any).id },
      data: { 
        embarkId: embarkId.trim(),
        // Note: embarkUsername would be updated via separate API or game integration
      },
      select: {
        id: true,
        name: true,
        embarkId: true,
        embarkUsername: true,
        updatedAt: true,
      }
    })

    return NextResponse.json({ 
      message: 'Embark ID linked successfully',
      user: updatedUser 
    })
  } catch (error) {
    console.error('[LINK_EMBARK]', error)
    return NextResponse.json({ error: 'Failed to link Embark ID' }, { status: 500 })
  }
}
