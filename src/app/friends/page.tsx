// src/app/friends/page.tsx
'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { Users, UserPlus } from 'lucide-react'
import { useState } from 'react'

export default function Friends() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [tab, setTab] = useState<'friends' | 'requests'>('friends')

  if (!isLoaded) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push('/sign-in')
    return null
  }

  return (
    <>
      <Navigation />
      <div className="pt-20 min-h-screen bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                Friends
              </span>
            </h1>
            <p className="text-slate-400">Manage your friends and friend requests</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-cyan-500/20 pb-4">
            <button
              onClick={() => setTab('friends')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                tab === 'friends'
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 border border-slate-700'
              }`}
            >
              <Users className="w-4 h-4" />
              My Friends
            </button>
            <button
              onClick={() => setTab('requests')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                tab === 'requests'
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 border border-slate-700'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Requests
            </button>
          </div>

          {/* Content */}
          {tab === 'friends' && (
            <div className="card text-center py-12">
              <Users className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">You don't have any friends yet</p>
              <p className="text-sm text-slate-500">Add friends and start teaming up!</p>
            </div>
          )}

          {tab === 'requests' && (
            <div className="card text-center py-12">
              <UserPlus className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">No pending friend requests</p>
              <p className="text-sm text-slate-500">When you get friend requests, they'll appear here</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
