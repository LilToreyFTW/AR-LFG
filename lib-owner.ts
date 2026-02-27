// src/lib/owner.ts
/**
 * Owner Configuration for ARC Raiders LFG
 * This file contains owner/admin credentials
 */

export const OWNER_CONFIG = {
  // Your Discord ID (used for authentication)
  discordId: '1368087024401252393',
  
  // Your email
  email: 'gtagod2020torey@gmail.com',
  
  // Your EMBARK ID
  embarkId: 'BL0WDART#3014',
  embarkUsername: 'BL0WDART',
  
  // Website name
  siteName: 'ARC Raiders LFG',
  
  // Roles with permissions
  roles: {
    OWNER: 'owner',
    ADMIN: 'admin',
    MODERATOR: 'moderator',
    USER: 'user',
  },
} as const

/**
 * Check if user is the owner
 */
export function isOwner(userId: string | undefined): boolean {
  return userId === OWNER_CONFIG.discordId
}

/**
 * Check if user is admin (owner or admin role)
 */
export function isAdmin(role: string | null): boolean {
  return role === OWNER_CONFIG.roles.OWNER || role === OWNER_CONFIG.roles.ADMIN
}

/**
 * Check if user is moderator or higher
 */
export function isModerator(role: string | null): boolean {
  return (
    role === OWNER_CONFIG.roles.OWNER ||
    role === OWNER_CONFIG.roles.ADMIN ||
    role === OWNER_CONFIG.roles.MODERATOR
  )
}

export type UserRole = typeof OWNER_CONFIG.roles[keyof typeof OWNER_CONFIG.roles]
