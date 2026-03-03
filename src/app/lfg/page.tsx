// src/app/lfg/page.tsx
'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navigation from '@/components/Navigation'
import Link from 'next/link'
import { Search, Plus } from 'lucide-react'

interface LFGPosting {
  id: string
  title: string
  description: string
  gameMode: string
  skillLevel: string
  playersNeeded: number
  preferredMap: string
  timezone: string
  language: string
  status: string
  createdAt: string
  expiresAt: string
  creator: {
    id: string
    name: string
    image: string
    embarkUsername: string
    discordTag: string
  }
  participants: { userId: string }[]
}

export default function LFGBrowser() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [postings, setPostings] = useState<LFGPosting[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    gameMode: 'Any',
    skillLevel: 'Any'
  })

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/sign-in')
  }, [status, router])

  useEffect(() => {
    fetchPostings()
  }, [filters])

  const fetchPostings = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.gameMode !== 'Any') params.append('gameMode', filters.gameMode)
      if (filters.skillLevel !== 'Any') params.append('skillLevel', filters.skillLevel)
      
      const response = await fetch(`/api/lfg/postings?${params}`)
      if (response.ok) {
        const data = await response.json()
        setPostings(data)
      }
    } catch (error) {
      console.error('Failed to fetch postings:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPostings = postings.filter(posting =>
    posting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    posting.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    posting.gameMode.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                  Find Your Squad
                </span>
              </h1>
              <p className="text-slate-400">Browse active LFG postings and find teammates</p>
            </div>
            <Link href="/lfg/create" className="flex items-center gap-2 btn btn-primary">
              <Plus className="w-4 h-4" /> Create Posting
            </Link>
          </div>

          <div className="mb-8 flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title, description, or game mode..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-cyan-500/20 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500/50"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filters.gameMode}
                onChange={e => setFilters(prev => ({ ...prev, gameMode: e.target.value }))}
                className="px-4 py-2 bg-slate-900 border border-cyan-500/20 rounded-lg text-white focus:border-cyan-500/50"
              >
                <option value="Any">Any Mode</option>
                <option value="Extraction">Extraction</option>
                <option value="Trio">Trio</option>
                <option value="Duo">Duo</option>
                <option value="Solo">Solo</option>
              </select>
              <select
                value={filters.skillLevel}
                onChange={e => setFilters(prev => ({ ...prev, skillLevel: e.target.value }))}
                className="px-4 py-2 bg-slate-900 border border-cyan-500/20 rounded-lg text-white focus:border-cyan-500/50"
              >
                <option value="Any">Any Skill</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Veteran">Veteran</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
            </div>
          ) : filteredPostings.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-slate-400 mb-4">
                {searchQuery || filters.gameMode !== 'Any' || filters.skillLevel !== 'Any'
                  ? 'No LFG postings match your filters'
                  : 'No LFG postings found yet'}
              </p>
              <Link href="/lfg/create" className="inline-block btn btn-primary">
                Create the First One!
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredPostings.map(posting => (
                <PostingCard key={posting.id} posting={posting} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function PostingCard({ posting }: { posting: LFGPosting }) {
  const createdTime = new Date(posting.createdAt).toLocaleDateString()
  const spotsLeft = posting.playersNeeded - posting.participants.length
  
  return (
    <div className="card hover:border-cyan-500/50 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-2">{posting.title}</h3>
          <p className="text-slate-400 mb-3 line-clamp-2">{posting.description}</p>
          
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-sm">
              {posting.gameMode}
            </span>
            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-sm">
              {posting.skillLevel}
            </span>
            {posting.preferredMap !== 'Any' && (
              <span className="px-2 py-1 bg-pink-500/20 text-pink-400 rounded text-sm">
                {posting.preferredMap}
              </span>
            )}
            <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-sm">
              {posting.timezone}
            </span>
          </div>
        </div>
        
        <div className="text-right ml-4">
          <div className="text-sm text-slate-400 mb-1">{createdTime}</div>
          <div className={`text-sm font-bold ${spotsLeft > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Full'}
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-3 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
            {posting.creator.name?.[0] || posting.creator.discordTag?.[0] || '?'}
          </div>
          <div>
            <div className="font-medium">
              {posting.creator.embarkUsername || posting.creator.name || posting.creator.discordTag}
            </div>
            <div className="text-xs text-slate-400">
              {posting.participants.length} joined
            </div>
          </div>
        </div>
        
        <button className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed" disabled={spotsLeft === 0}>
          {spotsLeft > 0 ? 'Join Group' : 'Group Full'}
        </button>
      </div>
    </div>
  )
}
