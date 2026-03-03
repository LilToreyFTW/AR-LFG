// src/app/api/groups/[groupId]/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  _req: Request,
  { params }: { params: { groupId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { groupId } = params

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        leader: {
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
                bio: true,
                timezone: true,
                platform: true,
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
      }
    })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    return NextResponse.json(group)
  } catch (error) {
    console.error('[GROUP GET]', error)
    return NextResponse.json({ error: 'Failed to fetch group' }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { groupId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { groupId } = params
    const body = await req.json()
    const { action, userId } = body

    const currentUserId = (session.user as any).id

    // Get group and check permissions
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          where: { userId: currentUserId },
          select: { role: true, status: true }
        }
      }
    })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    const userMembership = group.members[0]
    const isLeader = userMembership?.role === 'Leader'
    const isCreator = group.leaderId === currentUserId

    if (action === 'join') {
      // Check if user is already a member
      if (userMembership) {
        return NextResponse.json({ error: 'Already a member of this group' }, { status: 400 })
      }

      // Check if group is full
      if (group.maxSize > 0) {
        const memberCount = await prisma.groupMember.count({
          where: { groupId, status: 'active' }
        })
        if (memberCount >= group.maxSize) {
          return NextResponse.json({ error: 'Group is full' }, { status: 400 })
        }
      }

      // Check if group is recruiting
      if (group.status !== 'recruiting') {
        return NextResponse.json({ error: 'Group is not currently recruiting' }, { status: 400 })
      }

      // Add user as member
      await prisma.groupMember.create({
        data: {
          groupId,
          userId: currentUserId,
          role: 'Member',
          status: 'active'
        }
      })

      // Update group status if full
      if (group.maxSize > 0) {
        const newMemberCount = await prisma.groupMember.count({
          where: { groupId, status: 'active' }
        })
        if (newMemberCount >= group.maxSize) {
          await prisma.group.update({
            where: { id: groupId },
            data: { status: 'full' }
          })
        }
      }

      return NextResponse.json({ message: 'Joined group successfully' })
    }

    if (action === 'leave') {
      if (!userMembership) {
        return NextResponse.json({ error: 'Not a member of this group' }, { status: 400 })
      }

      // Leader can't leave, must transfer leadership first
      if (userMembership.role === 'Leader') {
        return NextResponse.json({ error: 'Leader cannot leave group. Transfer leadership first.' }, { status: 400 })
      }

      await prisma.groupMember.delete({
        where: {
          groupId_userId: {
            groupId,
            userId: currentUserId
          }
        }
      })

      // Update group status back to recruiting if no longer full
      if (group.status === 'full' && group.maxSize > 0) {
        const memberCount = await prisma.groupMember.count({
          where: { groupId, status: 'active' }
        })
        if (memberCount < group.maxSize) {
          await prisma.group.update({
            where: { id: groupId },
            data: { status: 'recruiting' }
          })
        }
      }

      return NextResponse.json({ message: 'Left group successfully' })
    }

    if (action === 'promote' || action === 'demote' || action === 'kick') {
      if (!isLeader && !isCreator) {
        return NextResponse.json({ error: 'Only group leaders can manage members' }, { status: 403 })
      }

      if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
      }

      const targetMember = await prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId,
            userId
          }
        }
      })

      if (!targetMember) {
        return NextResponse.json({ error: 'User is not a member of this group' }, { status: 404 })
      }

      if (action === 'kick') {
        await prisma.groupMember.delete({
          where: {
            groupId_userId: {
              groupId,
              userId
            }
          }
        })
        return NextResponse.json({ message: 'Member removed from group' })
      }

      const newRole = action === 'promote' ? 'Co-Leader' : 'Member'
      await prisma.groupMember.update({
        where: {
          groupId_userId: {
            groupId,
            userId
          }
        },
        data: { role: newRole }
      })

      return NextResponse.json({ message: `Member ${action}d successfully` })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('[GROUP PATCH]', error)
    return NextResponse.json({ error: 'Failed to update group' }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { groupId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { groupId } = params
    const userId = (session.user as any).id

    // Get group and verify ownership
    const group = await prisma.group.findUnique({
      where: { id: groupId }
    })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    if (group.leaderId !== userId) {
      return NextResponse.json({ error: 'Only group leader can delete group' }, { status: 403 })
    }

    // Delete all group members first
    await prisma.groupMember.deleteMany({
      where: { groupId }
    })

    // Delete the group
    await prisma.group.delete({
      where: { id: groupId }
    })

    return NextResponse.json({ message: 'Group deleted successfully' })
  } catch (error) {
    console.error('[GROUP DELETE]', error)
    return NextResponse.json({ error: 'Failed to delete group' }, { status: 500 })
  }
}
