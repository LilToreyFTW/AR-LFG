// src/app/api/factions/[factionId]/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  _req: Request,
  { params }: { params: { factionId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { factionId } = params

    const faction = await prisma.faction.findUnique({
      where: { id: factionId },
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
                bio: true,
                timezone: true,
                platform: true,
              }
            }
          }
        },
        groups: {
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
            }
          }
        }
      }
    })

    if (!faction) {
      return NextResponse.json({ error: 'Faction not found' }, { status: 404 })
    }

    return NextResponse.json(faction)
  } catch (error) {
    console.error('[FACTION GET]', error)
    return NextResponse.json({ error: 'Failed to fetch faction' }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { factionId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { factionId } = params
    const body = await req.json()
    const { action, userId } = body

    const currentUserId = (session.user as any).id

    // Get faction and check permissions
    const faction = await prisma.faction.findUnique({
      where: { id: factionId },
      include: {
        members: {
          where: { userId: currentUserId },
          select: { role: true, status: true }
        }
      }
    })

    if (!faction) {
      return NextResponse.json({ error: 'Faction not found' }, { status: 404 })
    }

    const userMembership = faction.members[0]
    const isLeader = userMembership?.role === 'Leader'
    const isCreator = faction.creatorId === currentUserId

    if (action === 'join') {
      // Check if user is already a member
      if (userMembership) {
        return NextResponse.json({ error: 'Already a member of this faction' }, { status: 400 })
      }

      // Check if faction is full
      if (faction.maxMembers > 0) {
        const memberCount = await prisma.factionMember.count({
          where: { factionId, status: 'active' }
        })
        if (memberCount >= faction.maxMembers) {
          return NextResponse.json({ error: 'Faction is full' }, { status: 400 })
        }
      }

      // Add user as member
      await prisma.factionMember.create({
        data: {
          factionId,
          userId: currentUserId,
          role: 'Member',
          status: 'active'
        }
      })

      return NextResponse.json({ message: 'Joined faction successfully' })
    }

    if (action === 'leave') {
      if (!userMembership) {
        return NextResponse.json({ error: 'Not a member of this faction' }, { status: 400 })
      }

      // Leader can't leave, must transfer leadership first
      if (userMembership.role === 'Leader') {
        return NextResponse.json({ error: 'Leader cannot leave faction. Transfer leadership first.' }, { status: 400 })
      }

      await prisma.factionMember.delete({
        where: {
          factionId_userId: {
            factionId,
            userId: currentUserId
          }
        }
      })

      return NextResponse.json({ message: 'Left faction successfully' })
    }

    if (action === 'promote' || action === 'demote' || action === 'kick') {
      if (!isLeader && !isCreator) {
        return NextResponse.json({ error: 'Only faction leaders can manage members' }, { status: 403 })
      }

      if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
      }

      const targetMember = await prisma.factionMember.findUnique({
        where: {
          factionId_userId: {
            factionId,
            userId
          }
        }
      })

      if (!targetMember) {
        return NextResponse.json({ error: 'User is not a member of this faction' }, { status: 404 })
      }

      if (action === 'kick') {
        await prisma.factionMember.delete({
          where: {
            factionId_userId: {
              factionId,
              userId
            }
          }
        })
        return NextResponse.json({ message: 'Member removed from faction' })
      }

      const newRole = action === 'promote' ? 'Officer' : 'Member'
      await prisma.factionMember.update({
        where: {
          factionId_userId: {
            factionId,
            userId
          }
        },
        data: { role: newRole }
      })

      return NextResponse.json({ message: `Member ${action}d successfully` })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('[FACTION PATCH]', error)
    return NextResponse.json({ error: 'Failed to update faction' }, { status: 500 })
  }
}
