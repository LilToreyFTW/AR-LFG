// src/app/lfg/page.tsx
'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import Link from 'next/link'
import { Search, Filter, Plus } from 'lucide-react'
import { useState } from 'react'

export default function LFGBrowser() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                  Find Your Squad
                </span>
              </h1>
              <p className="text-slate-400">Browse active LFG postings and find teammates</p>
            </div>
            <Link
              href="/lfg/create"
              className="flex items-center gap-2 btn btn-primary"
            >
              <Plus className="w-4 h-4" />
              Create Posting
            </Link>
          </div>

          {/* Search and Filter */}
          <div className="mb-8 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by title, game mode, or timezone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-cyan-500/20 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500/50"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-cyan-500/20 rounded-lg hover:border-cyan-500/50 transition-all">
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>

          {/* Postings Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Empty State */}
            <div className="md:col-span-2 lg:col-span-3">
              <div className="card text-center py-12">
                <p className="text-slate-400 mb-4">No LFG postings found yet</p>
                <Link
                  href="/lfg/create"
                  className="inline-block btn btn-primary"
                >
                  Create the First One!
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
