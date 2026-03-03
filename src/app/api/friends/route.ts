// src/app/api/friends/route.ts
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

    const userId = (session.user as any).id

    // Get friends list
    const friends = await prisma.friend.findMany({
      where: { userId },
      include: {
        friend: {
          select: {
            id: true,
            name: true,
            image: true,
            discordTag: true,
            embarkUsername: true,
            bio: true,
            timezone: true,
            platform: true,
          }
        }
      }
    })

    // Get friend requests
    const sentRequests = await prisma.friendRequest.findMany({
      where: { senderId: userId },
      include: {
        receiver: {
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

    const receivedRequests = await prisma.friendRequest.findMany({
      where: { receiverId: userId, status: 'pending' },
      include: {
        sender: {
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

    return NextResponse.json({
      friends: friends.map(f => f.friend),
      sentRequests: sentRequests.map(r => ({ ...r, sender: r.receiver })),
      receivedRequests: receivedRequests.map(r => ({ ...r, sender: r.sender }))
    })
  } catch (error) {
    console.error('[FRIENDS GET]', error)
    return NextResponse.json({ error: 'Failed to fetch friends' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { receiverId, message } = body

    if (!receiverId) {
      return NextResponse.json({ error: 'Receiver ID is required' }, { status: 400 })
    }

    const senderId = (session.user as any).id

    // Check if already friends or request exists
    const existingFriend = await prisma.friend.findFirst({
      where: {
        OR: [
          { userId: senderId, friendId: receiverId },
          { userId: receiverId, friendId: senderId }
        ]
      }
    })

    if (existingFriend) {
      return NextResponse.json({ error: 'Already friends' }, { status: 400 })
    }

    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId }
        ]
      }
    })

    if (existingRequest) {
      return NextResponse.json({ error: 'Friend request already sent' }, { status: 400 })
    }

    // Create friend request
    const friendRequest = await prisma.friendRequest.create({
      data: {
        senderId,
        receiverId,
        message: message || '',
        status: 'pending'
      },
      include: {
        sender: {
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

    return NextResponse.json(friendRequest)
  } catch (error) {
    console.error('[FRIENDS POST]', error)
    return NextResponse.json({ error: 'Failed to send friend request' }, { status: 500 })
  }
}
