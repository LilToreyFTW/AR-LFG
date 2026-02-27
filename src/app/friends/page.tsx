// src/app/friends/page.tsx
'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navigation from '@/components/Navigation'
import { Users, UserPlus } from 'lucide-react'

export default function Friends() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tab, setTab] = useState<'friends' | 'requests'>('friends')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/sign-in')
  }, [status, router])

  if (status === 'loading' || !session) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500" />
      </div>
    )
  }

  return (
    <>
      <Navigation />
      <div className="pt-20 min-h-screen bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                Friends
              </span>
            </h1>
            <p className="text-slate-400">Manage your friends and friend requests</p>
          </div>

          <div className="flex gap-4 mb-8 border-b border-cyan-500/20 pb-4">
            {(['friends', 'requests'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all capitalize ${
                  tab === t
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 border border-slate-700'
                }`}>
                {t === 'friends' ? <Users className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                {t === 'friends' ? 'My Friends' : 'Requests'}
              </button>
            ))}
          </div>

          <div className="card text-center py-12">
            {tab === 'friends' ? (
              <>
                <Users className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400 mb-2">You don't have any friends yet</p>
                <p className="text-sm text-slate-500">Add friends and start teaming up!</p>
              </>
            ) : (
              <>
                <UserPlus className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400 mb-2">No pending friend requests</p>
                <p className="text-sm text-slate-500">When you get requests, they'll appear here</p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
