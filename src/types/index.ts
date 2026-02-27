// src/types/index.ts
export interface User {
  id: string
  clerkId: string
  email: string
  username?: string
  name?: string
  image?: string
  bio?: string
  createdAt: Date
  updatedAt: Date
}

export interface LFGPosting {
  id: string
  title: string
  description: string
  creatorId: string
  gameMode: string
  skillLevel: string
  playersNeeded: number
  currentPlayers: number
  timezone: string
  language: string
  status: 'active' | 'completed' | 'cancelled'
  createdAt: Date
  updatedAt: Date
  expiresAt: Date
}

export interface FriendRequest {
  id: string
  senderId: string
  receiverId: string
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: Date
  updatedAt: Date
}

export interface Friend {
  id: string
  userId: string
  friendId: string
  createdAt: Date
}
