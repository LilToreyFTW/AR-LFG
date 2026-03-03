// src/app/api/friends/[requestId]/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PATCH(
  req: Request,
  { params }: { params: { requestId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { requestId } = params
    const body = await req.json()
    const { action } = body // 'accept' or 'decline'

    if (!['accept', 'decline'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const userId = (session.user as any).id

    // Find the friend request
    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id: requestId },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } }
      }
    })

    if (!friendRequest) {
      return NextResponse.json({ error: 'Friend request not found' }, { status: 404 })
    }

    // Check if user is the receiver
    if (friendRequest.receiverId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (action === 'accept') {
      // Create friendship
      await prisma.$transaction([
        // Update request status
        prisma.friendRequest.update({
          where: { id: requestId },
          data: { status: 'accepted' }
        }),
        // Create friendship record
        prisma.friend.create({
          data: {
            userId: friendRequest.senderId,
            friendId: friendRequest.receiverId
          }
        }),
        // Create reverse friendship record
        prisma.friend.create({
          data: {
            userId: friendRequest.receiverId,
            friendId: friendRequest.senderId
          }
        })
      ])

      return NextResponse.json({ message: 'Friend request accepted' })
    } else {
      // Decline request
      await prisma.friendRequest.update({
        where: { id: requestId },
        data: { status: 'rejected' }
      })

      return NextResponse.json({ message: 'Friend request declined' })
    }
  } catch (error) {
    console.error('[FRIENDS PATCH]', error)
    return NextResponse.json({ error: 'Failed to update friend request' }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { requestId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { requestId } = params
    const userId = (session.user as any).id

    // Find and delete the friend request (only if sender)
    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id: requestId }
    })

    if (!friendRequest) {
      return NextResponse.json({ error: 'Friend request not found' }, { status: 404 })
    }

    if (friendRequest.senderId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.friendRequest.delete({
      where: { id: requestId }
    })

    return NextResponse.json({ message: 'Friend request cancelled' })
  } catch (error) {
    console.error('[FRIENDS DELETE]', error)
    return NextResponse.json({ error: 'Failed to cancel friend request' }, { status: 500 })
  }
}
