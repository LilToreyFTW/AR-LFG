// src/app/factions/page.tsx
'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navigation from '@/components/Navigation'
import { Shield, Plus, Crown, Search } from 'lucide-react'
import toast from 'react-hot-toast'

interface User {
  id: string
  name: string | null
  image: string | null
  discordTag: string | null
  embarkUsername: string | null
  bio: string | null
  timezone: string | null
  platform: string | null
}

interface FactionMember {
  id: string
  factionId: string
  userId: string
  role: string
  status: string
  joinedAt: string
  user: User
}

interface Faction {
  id: string
  name: string
  tag: string | null
  description: string | null
  allegiance: string
  playstyle: string
  creatorId: string | null
  bannerColor: string
  iconUrl: string | null
  maxMembers: number
  isPublic: boolean
  isPreset: boolean
  createdAt: string
  updatedAt: string
  creator?: User
  members: FactionMember[]
  _count: { members: number }
}

export default function Factions() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [factions, setFactions] = useState<Faction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    allegiance: 'Any',
    playstyle: 'Any'
  })
  const [showCreateFaction, setShowCreateFaction] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/sign-in')
  }, [status, router])

  useEffect(() => {
    if (session) fetchFactions()
  }, [session, filters])

  const fetchFactions = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.allegiance !== 'Any') params.append('allegiance', filters.allegiance)
      if (filters.playstyle !== 'Any') params.append('playstyle', filters.playstyle)

      const response = await fetch(`/api/factions?${params}`)
      if (response.ok) {
        const data = await response.json()
        setFactions(data)
      }
    } catch (error) {
      console.error('Failed to fetch factions:', error)
    } finally {
      setLoading(false)
    }
  }

  const createFaction = async (factionData: any) => {
    try {
      const response = await fetch('/api/factions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(factionData)
      })
      
      if (response.ok) {
        toast.success('Faction created successfully!')
        setShowCreateFaction(false)
        fetchFactions()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create faction')
      }
    } catch (error) {
      toast.error('Failed to create faction')
    }
  }

  const joinFaction = async (factionId: string) => {
    try {
      const response = await fetch(`/api/factions/${factionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join' })
      })
      
      if (response.ok) {
        toast.success('Joined faction successfully!')
        fetchFactions()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to join faction')
      }
    } catch (error) {
      toast.error('Failed to join faction')
    }
  }

  if (status === 'loading' || !session) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500" />
      </div>
    )
  }

  const filteredFactions = factions.filter(faction =>
    faction.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faction.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faction.tag?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      <Navigation />
      <div className="pt-20 min-h-screen bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                  Factions
                </span>
              </h1>
              <p className="text-slate-400">Join or create factions for organized gameplay</p>
            </div>
            <button
              onClick={() => setShowCreateFaction(true)}
              className="flex items-center gap-2 btn btn-primary"
            >
              <Plus className="w-4 h-4" /> Create Faction
            </button>
          </div>

          <div className="mb-8 flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search factions..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-cyan-500/20 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500/50"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filters.allegiance}
                onChange={e => setFilters(prev => ({ ...prev, allegiance: e.target.value }))}
                className="px-4 py-2 bg-slate-900 border border-cyan-500/20 rounded-lg text-white focus:border-cyan-500/50"
              >
                <option value="Any">Any Allegiance</option>
                <option value="Aggressive">Aggressive</option>
                <option value="Neutral">Neutral</option>
                <option value="Pacifist">Pacifist</option>
                <option value="Custom">Custom</option>
              </select>
              <select
                value={filters.playstyle}
                onChange={e => setFilters(prev => ({ ...prev, playstyle: e.target.value }))}
                className="px-4 py-2 bg-slate-900 border border-cyan-500/20 rounded-lg text-white focus:border-cyan-500/50"
              >
                <option value="Any">Any Playstyle</option>
                <option value="PvP">PvP</option>
                <option value="PvE">PvE</option>
                <option value="Balanced">Balanced</option>
                <option value="Support">Support</option>
                <option value="Bounty Hunter">Bounty Hunter</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
            </div>
          ) : filteredFactions.length === 0 ? (
            <div className="card text-center py-12">
              <Shield className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400 mb-2">
                {searchQuery || filters.allegiance !== 'Any' || filters.playstyle !== 'Any'
                  ? 'No factions match your filters'
                  : 'No factions found yet'}
              </p>
              <p className="text-sm text-slate-500 mb-4">
                {searchQuery || filters.allegiance !== 'Any' || filters.playstyle !== 'Any'
                  ? 'Try adjusting your search or filters'
                  : 'Be the first to create a faction!'}
              </p>
              {!searchQuery && filters.allegiance === 'Any' && filters.playstyle === 'Any' && (
                <button
                  onClick={() => setShowCreateFaction(true)}
                  className="btn btn-primary"
                >
                  Create First Faction
                </button>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredFactions.map(faction => (
                <FactionCard
                  key={faction.id}
                  faction={faction}
                  onJoin={() => joinFaction(faction.id)}
                />
              ))}
            </div>
          )}

          {showCreateFaction && (
            <CreateFactionModal
              onClose={() => setShowCreateFaction(false)}
              onCreate={createFaction}
            />
          )}
        </div>
      </div>
    </>
  )
}

function FactionCard({ faction, onJoin }: { faction: Faction; onJoin: () => void }) {
  const memberCount = faction._count.members
  const maxMembers = faction.maxMembers
  const isFull = maxMembers > 0 && memberCount >= maxMembers

  return (
    <div className="card hover:border-cyan-500/50 transition-all">
      <div className="flex items-start gap-4 mb-4">
        <div
          className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-xl"
          style={{ backgroundColor: faction.bannerColor }}
        >
          {faction.tag ? `[${faction.tag}]` : faction.name.slice(0, 3).toUpperCase()}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-1">{faction.name}</h3>
          {faction.tag && (
            <span className="inline-block px-2 py-1 bg-slate-800 rounded text-sm text-slate-300 mb-2">
              {faction.tag}
            </span>
          )}
          <p className="text-slate-400 text-sm line-clamp-2">{faction.description}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-sm">
          {faction.allegiance}
        </span>
        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-sm">
          {faction.playstyle}
        </span>
        <span className="px-2 py-1 bg-pink-500/20 text-pink-400 rounded text-sm">
          {memberCount}/{maxMembers === 0 ? '∞' : maxMembers} members
        </span>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {faction.members.slice(0, 3).map((member) => (
              <div
                key={member.id}
                className="w-8 h-8 rounded-full border-2 border-slate-900 bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold"
              >
                {member.user.name?.[0] || member.user.discordTag?.[0] || '?'}
              </div>
            ))}
            {memberCount > 3 && (
              <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-white text-xs font-bold">
                +{memberCount - 3}
              </div>
            )}
          </div>
          <span className="text-sm text-slate-400">
            Created by {faction.creator?.embarkUsername || faction.creator?.name || 'Unknown'}
          </span>
        </div>

        <button
          onClick={onJoin}
          disabled={isFull}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium"
        >
          {isFull ? 'Full' : 'Join Faction'}
        </button>
      </div>
    </div>
  )
}

function CreateFactionModal({ onClose, onCreate }: { onClose: () => void; onCreate: (data: any) => void }) {
  const [formData, setFormData] = useState({
    name: '',
    tag: '',
    description: '',
    allegiance: 'Custom',
    playstyle: 'Balanced',
    bannerColor: '#00d9ff',
    maxMembers: 0
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error('Faction name is required')
      return
    }
    onCreate(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-900 rounded-xl p-6 max-w-md w-full mx-4 border border-cyan-500/20 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create Faction</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <Plus className="w-5 h-5 rotate-45" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Faction Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter faction name"
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500/50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tag (Optional)</label>
            <input
              type="text"
              value={formData.tag}
              onChange={e => setFormData(prev => ({ ...prev, tag: e.target.value }))}
              placeholder="e.g., [FMF]"
              maxLength={8}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your faction's goals and playstyle..."
              rows={3}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Allegiance</label>
              <select
                value={formData.allegiance}
                onChange={e => setFormData(prev => ({ ...prev, allegiance: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-cyan-500/50"
              >
                <option value="Aggressive">Aggressive</option>
                <option value="Neutral">Neutral</option>
                <option value="Pacifist">Pacifist</option>
                <option value="Custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Playstyle</label>
              <select
                value={formData.playstyle}
                onChange={e => setFormData(prev => ({ ...prev, playstyle: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-cyan-500/50"
              >
                <option value="PvP">PvP</option>
                <option value="PvE">PvE</option>
                <option value="Balanced">Balanced</option>
                <option value="Support">Support</option>
                <option value="Bounty Hunter">Bounty Hunter</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Banner Color</label>
              <input
                type="color"
                value={formData.bannerColor}
                onChange={e => setFormData(prev => ({ ...prev, bannerColor: e.target.value }))}
                className="w-full h-10 bg-slate-800 border border-slate-700 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Max Members (0 = unlimited)</label>
              <input
                type="number"
                value={formData.maxMembers}
                onChange={e => setFormData(prev => ({ ...prev, maxMembers: parseInt(e.target.value) || 0 }))}
                min="0"
                max="100"
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-cyan-500/50"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button type="submit" className="flex-1 btn btn-primary">
              <Crown className="w-4 h-4" /> Create Faction
            </button>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
