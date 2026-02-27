// src/app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest) {
  try {
    // Mock stats for now
    const stats = {
      totalUsers: 42,
      activePostings: 12,
      healthScore: 98,
      messages: 156,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

