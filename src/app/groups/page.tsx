// src/app/groups/page.tsx
'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navigation from '@/components/Navigation'
import { Users, Plus, Search, Gamepad2, MapPin, Clock, Crown } from 'lucide-react'
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

interface GroupMember {
  id: string
  groupId: string
  userId: string
  role: string
  status: string
  joinedAt: string
  user: User
}

interface Group {
  id: string
  name: string
  description: string | null
  leaderId: string
  factionId: string | null
  gameMode: string
  skillLevel: string
  maxSize: number
  isSquad: boolean
  isPublic: boolean
  preferredMap: string
  timezone: string
  language: string
  platform: string
  status: string
  createdAt: string
  updatedAt: string
  leader?: User
  members: GroupMember[]
  faction?: {
    id: string
    name: string
    tag: string | null
    bannerColor: string
  }
}

export default function Groups() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    gameMode: 'Any',
    skillLevel: 'Any',
    platform: 'Any'
  })
  const [showCreateGroup, setShowCreateGroup] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/sign-in')
  }, [status, router])

  useEffect(() => {
    if (session) fetchGroups()
  }, [session, filters])

  const fetchGroups = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.gameMode !== 'Any') params.append('gameMode', filters.gameMode)
      if (filters.skillLevel !== 'Any') params.append('skillLevel', filters.skillLevel)
      if (filters.platform !== 'Any') params.append('platform', filters.platform)

      const response = await fetch(`/api/groups?${params}`)
      if (response.ok) {
        const data = await response.json()
        setGroups(data)
      }
    } catch (error) {
      console.error('Failed to fetch groups:', error)
    } finally {
      setLoading(false)
    }
  }

  const createGroup = async (groupData: any) => {
    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupData)
      })
      
      if (response.ok) {
        toast.success('Group created successfully!')
        setShowCreateGroup(false)
        fetchGroups()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create group')
      }
    } catch (error) {
      toast.error('Failed to create group')
    }
  }

  const joinGroup = async (groupId: string) => {
    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join' })
      })
      
      if (response.ok) {
        toast.success('Joined group successfully!')
        fetchGroups()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to join group')
      }
    } catch (error) {
      toast.error('Failed to join group')
    }
  }

  if (status === 'loading' || !session) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500" />
      </div>
    )
  }

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchQuery.toLowerCase())
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
                  Groups
                </span>
              </h1>
              <p className="text-slate-400">Find or create groups for coordinated gameplay</p>
            </div>
            <button
              onClick={() => setShowCreateGroup(true)}
              className="flex items-center gap-2 btn btn-primary"
            >
              <Plus className="w-4 h-4" /> Create Group
            </button>
          </div>

          <div className="mb-8 flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search groups..."
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
              <select
                value={filters.platform}
                onChange={e => setFilters(prev => ({ ...prev, platform: e.target.value }))}
                className="px-4 py-2 bg-slate-900 border border-cyan-500/20 rounded-lg text-white focus:border-cyan-500/50"
              >
                <option value="Any">Any Platform</option>
                <option value="Crossplay">Crossplay</option>
                <option value="PC">PC</option>
                <option value="PS5">PS5</option>
                <option value="XSX">Xbox Series X</option>
                <option value="XSS">Xbox Series S</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="card text-center py-12">
              <Users className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400 mb-2">
                {searchQuery || filters.gameMode !== 'Any' || filters.skillLevel !== 'Any' || filters.platform !== 'Any'
                  ? 'No groups match your filters'
                  : 'No groups found yet'}
              </p>
              <p className="text-sm text-slate-500 mb-4">
                {searchQuery || filters.gameMode !== 'Any' || filters.skillLevel !== 'Any' || filters.platform !== 'Any'
                  ? 'Try adjusting your search or filters'
                  : 'Be the first to create a group!'}
              </p>
              {!searchQuery && filters.gameMode === 'Any' && filters.skillLevel === 'Any' && filters.platform === 'Any' && (
                <button
                  onClick={() => setShowCreateGroup(true)}
                  className="btn btn-primary"
                >
                  Create First Group
                </button>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map(group => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onJoin={() => joinGroup(group.id)}
                />
              ))}
            </div>
          )}

          {showCreateGroup && (
            <CreateGroupModal
              onClose={() => setShowCreateGroup(false)}
              onCreate={createGroup}
            />
          )}
        </div>
      </div>
    </>
  )
}

function GroupCard({ group, onJoin }: { group: Group; onJoin: () => void }) {
  const memberCount = group.members.length
  const maxMembers = group.maxSize
  const isFull = maxMembers > 0 && memberCount >= maxMembers
  const spotsLeft = maxMembers > 0 ? maxMembers - memberCount : 'Unlimited'

  return (
    <div className="card hover:border-cyan-500/50 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold">
            {group.isSquad ? (
              <Users className="w-6 h-6" />
            ) : (
              <Gamepad2 className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold">{group.name}</h3>
            <span className="text-xs px-2 py-1 bg-slate-800 rounded text-slate-300">
              {group.isSquad ? 'Squad' : 'Community'}
            </span>
          </div>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          group.status === 'recruiting' 
            ? 'bg-green-500/20 text-green-400' 
            : group.status === 'full'
            ? 'bg-red-500/20 text-red-400'
            : 'bg-slate-700 text-slate-300'
        }`}>
          {group.status}
        </span>
      </div>

      <p className="text-slate-400 text-sm mb-4 line-clamp-2">{group.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-xs">
          {group.gameMode}
        </span>
        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
          {group.skillLevel}
        </span>
        <span className="px-2 py-1 bg-pink-500/20 text-pink-400 rounded text-xs">
          {group.platform}
        </span>
        {group.preferredMap !== 'Any' && (
          <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs">
            <MapPin className="w-3 h-3 inline mr-1" />
            {group.preferredMap}
          </span>
        )}
        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
          <Clock className="w-3 h-3 inline mr-1" />
          {group.timezone}
        </span>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {group.members.slice(0, 3).map((member) => (
              <div
                key={member.id}
                className="w-6 h-6 rounded-full border-2 border-slate-900 bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold"
              >
                {member.user.name?.[0] || member.user.discordTag?.[0] || '?'}
              </div>
            ))}
            {memberCount > 3 && (
              <div className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-white text-xs font-bold">
                +{memberCount - 3}
              </div>
            )}
          </div>
          <span className="text-sm text-slate-400">
            {memberCount}/{maxMembers === 0 ? '∞' : maxMembers} • {spotsLeft} spots left
          </span>
        </div>

        <button
          onClick={onJoin}
          disabled={isFull || group.status !== 'recruiting'}
          className="px-3 py-1 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium"
        >
          {isFull || group.status !== 'recruiting' ? 'Not Available' : 'Join Group'}
        </button>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Crown className="w-3 h-3" />
          Leader: {group.leader?.embarkUsername || group.leader?.name || 'Unknown'}
        </div>
        {group.faction && (
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: group.faction.bannerColor }}
            />
            {group.faction.name} {group.faction.tag && `(${group.faction.tag})`}
          </div>
        )}
      </div>
    </div>
  )
}

function CreateGroupModal({ onClose, onCreate }: { onClose: () => void; onCreate: (data: any) => void }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    gameMode: 'Any',
    skillLevel: 'Any',
    maxSize: 3,
    isSquad: true,
    preferredMap: 'Any',
    timezone: 'UTC',
    language: 'English',
    platform: 'Crossplay'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error('Group name is required')
      return
    }
    onCreate(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-900 rounded-xl p-6 max-w-md w-full mx-4 border border-cyan-500/20 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create Group</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <Plus className="w-5 h-5 rotate-45" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Group Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter group name"
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500/50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your group's goals and requirements..."
              rows={3}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Game Mode</label>
              <select
                value={formData.gameMode}
                onChange={e => setFormData(prev => ({ ...prev, gameMode: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-cyan-500/50"
              >
                <option value="Extraction">Extraction</option>
                <option value="Trio">Trio</option>
                <option value="Duo">Duo</option>
                <option value="Solo">Solo</option>
                <option value="Any">Any</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Skill Level</label>
              <select
                value={formData.skillLevel}
                onChange={e => setFormData(prev => ({ ...prev, skillLevel: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-cyan-500/50"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Veteran">Veteran</option>
                <option value="Any">Any</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Max Members</label>
              <input
                type="number"
                value={formData.maxSize}
                onChange={e => setFormData(prev => ({ ...prev, maxSize: parseInt(e.target.value) || 3 }))}
                min="1"
                max="10"
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-cyan-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Platform</label>
              <select
                value={formData.platform}
                onChange={e => setFormData(prev => ({ ...prev, platform: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-cyan-500/50"
              >
                <option value="Crossplay">Crossplay</option>
                <option value="PC">PC</option>
                <option value="PS5">PS5</option>
                <option value="XSX">Xbox Series X</option>
                <option value="XSS">Xbox Series S</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Preferred Map</label>
              <select
                value={formData.preferredMap}
                onChange={e => setFormData(prev => ({ ...prev, preferredMap: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-cyan-500/50"
              >
                <option value="Any">Any</option>
                <option value="Dam Battlegrounds">Dam Battlegrounds</option>
                <option value="Buried City">Buried City</option>
                <option value="Spaceport">Spaceport</option>
                <option value="Blue Gate">Blue Gate</option>
                <option value="Stella Montis">Stella Montis</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Timezone</label>
              <select
                value={formData.timezone}
                onChange={e => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-cyan-500/50"
              >
                <option value="UTC">UTC</option>
                <option value="EST">EST</option>
                <option value="PST">PST</option>
                <option value="CST">CST</option>
                <option value="GMT">GMT</option>
                <option value="CET">CET</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button type="submit" className="flex-1 btn btn-primary">
              <Users className="w-4 h-4" /> Create Group
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
