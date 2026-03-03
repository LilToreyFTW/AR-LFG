// src/app/friends/page.tsx
'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navigation from '@/components/Navigation'
import { Users, UserPlus, Search, X, Check, Clock, Send } from 'lucide-react'
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

interface FriendRequest {
  id: string
  senderId: string
  receiverId: string
  status: string
  message: string | null
  createdAt: string
  sender?: User
  receiver?: User
}

export default function Friends() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tab, setTab] = useState<'friends' | 'requests'>('friends')
  const [friends, setFriends] = useState<User[]>([])
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([])
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddFriend, setShowAddFriend] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/sign-in')
  }, [status, router])

  useEffect(() => {
    if (session) fetchFriends()
  }, [session])

  const fetchFriends = async () => {
    try {
      const response = await fetch('/api/friends')
      if (response.ok) {
        const data = await response.json()
        setFriends(data.friends || [])
        setReceivedRequests(data.receivedRequests || [])
        setSentRequests(data.sentRequests || [])
      }
    } catch (error) {
      console.error('Failed to fetch friends:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendFriendRequest = async (receiverId: string, message?: string) => {
    try {
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId, message })
      })
      
      if (response.ok) {
        toast.success('Friend request sent!')
        fetchFriends()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to send request')
      }
    } catch (error) {
      toast.error('Failed to send friend request')
    }
  }

  const handleFriendRequest = async (requestId: string, action: 'accept' | 'decline') => {
    try {
      const response = await fetch(`/api/friends/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })
      
      if (response.ok) {
        toast.success(`Friend request ${action}ed!`)
        fetchFriends()
      } else {
        toast.error('Failed to update request')
      }
    } catch (error) {
      toast.error('Failed to update request')
    }
  }

  const cancelRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/friends/${requestId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        toast.success('Friend request cancelled')
        fetchFriends()
      } else {
        toast.error('Failed to cancel request')
      }
    } catch (error) {
      toast.error('Failed to cancel request')
    }
  }

  if (status === 'loading' || !session) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500" />
      </div>
    )
  }

  const filteredFriends = friends.filter(friend =>
    friend.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.discordTag?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.embarkUsername?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      <Navigation />
      <div className="pt-20 min-h-screen bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                  Friends
                </span>
              </h1>
              <p className="text-slate-400">Manage your friends and friend requests</p>
            </div>
            <button
              onClick={() => setShowAddFriend(true)}
              className="flex items-center gap-2 btn btn-primary"
            >
              <UserPlus className="w-4 h-4" /> Add Friend
            </button>
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
                {t === 'friends' ? `My Friends (${friends.length})` : `Requests (${receivedRequests.length})`}
              </button>
            ))}
          </div>

          {tab === 'friends' && (
            <div>
              <div className="mb-6 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search friends..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-cyan-500/20 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500/50"
                />
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
                </div>
              ) : filteredFriends.length === 0 ? (
                <div className="card text-center py-12">
                  <Users className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400 mb-2">
                    {searchQuery ? 'No friends match your search' : 'You don\'t have any friends yet'}
                  </p>
                  <p className="text-sm text-slate-500">
                    {searchQuery ? 'Try a different search term' : 'Add friends and start teaming up!'}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredFriends.map(friend => (
                    <FriendCard key={friend.id} friend={friend} />
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'requests' && (
            <div>
              <h3 className="text-xl font-bold mb-4">Received Requests ({receivedRequests.length})</h3>
              {receivedRequests.length === 0 ? (
                <div className="card text-center py-8 mb-6">
                  <UserPlus className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-slate-400">No pending friend requests</p>
                </div>
              ) : (
                <div className="grid gap-4 mb-8">
                  {receivedRequests.map(request => (
                    <FriendRequestCard
                      key={request.id}
                      request={request}
                      type="received"
                      onAccept={() => handleFriendRequest(request.id, 'accept')}
                      onDecline={() => handleFriendRequest(request.id, 'decline')}
                    />
                  ))}
                </div>
              )}

              <h3 className="text-xl font-bold mb-4">Sent Requests ({sentRequests.length})</h3>
              {sentRequests.length === 0 ? (
                <div className="card text-center py-8">
                  <Clock className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-slate-400">No sent friend requests</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {sentRequests.map(request => (
                    <FriendRequestCard
                      key={request.id}
                      request={request}
                      type="sent"
                      onCancel={() => cancelRequest(request.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {showAddFriend && (
            <AddFriendModal
              onClose={() => setShowAddFriend(false)}
              onSend={sendFriendRequest}
            />
          )}
        </div>
      </div>
    </>
  )
}

function FriendCard({ friend }: { friend: User }) {
  return (
    <div className="card flex items-center justify-between">
      <div className="flex items-center gap-4">
        {friend.image ? (
          <img src={friend.image} alt={friend.name || ''} className="w-12 h-12 rounded-full" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold">
            {friend.name?.[0] || friend.discordTag?.[0] || '?'}
          </div>
        )}
        <div>
          <h3 className="font-medium">
            {friend.embarkUsername || friend.name || friend.discordTag}
          </h3>
          <p className="text-sm text-slate-400">
            {friend.bio || 'No bio available'}
          </p>
          <div className="flex gap-2 mt-1">
            {friend.timezone && (
              <span className="text-xs px-2 py-1 bg-slate-800 rounded">{friend.timezone}</span>
            )}
            {friend.platform && (
              <span className="text-xs px-2 py-1 bg-slate-800 rounded">{friend.platform}</span>
            )}
          </div>
        </div>
      </div>
      <button className="px-4 py-2 border border-cyan-500/50 rounded-lg hover:bg-cyan-500/10 transition-all text-sm">
        View Profile
      </button>
    </div>
  )
}

function FriendRequestCard({
  request,
  type,
  onAccept,
  onDecline,
  onCancel
}: {
  request: FriendRequest
  type: 'received' | 'sent'
  onAccept?: () => void
  onDecline?: () => void
  onCancel?: () => void
}) {
  const user = type === 'received' ? request.sender : request.receiver
  const createdTime = new Date(request.createdAt).toLocaleDateString()

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {user?.image ? (
            <img src={user.image} alt={user.name || ''} className="w-10 h-10 rounded-full" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.[0] || user?.discordTag?.[0] || '?'}
            </div>
          )}
          <div>
            <h3 className="font-medium">
              {user?.embarkUsername || user?.name || user?.discordTag}
            </h3>
            {request.message && (
              <p className="text-sm text-slate-400 mt-1">"{request.message}"</p>
            )}
            <p className="text-xs text-slate-500 mt-1">{createdTime}</p>
          </div>
        </div>

        <div className="flex gap-2">
          {type === 'received' ? (
            <>
              <button
                onClick={onAccept}
                className="flex items-center gap-1 px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm transition-colors"
              >
                <Check className="w-3 h-3" /> Accept
              </button>
              <button
                onClick={onDecline}
                className="flex items-center gap-1 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors"
              >
                <X className="w-3 h-3" /> Decline
              </button>
            </>
          ) : (
            <button
              onClick={onCancel}
              className="flex items-center gap-1 px-3 py-1 border border-slate-600 hover:bg-slate-800 text-slate-300 rounded text-sm transition-colors"
            >
              <X className="w-3 h-3" /> Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function AddFriendModal({ onClose, onSend }: { onClose: () => void; onSend: (id: string, message?: string) => void }) {
  const [query, setQuery] = useState('')
  const [message, setMessage] = useState('')

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-900 rounded-xl p-6 max-w-md w-full mx-4 border border-cyan-500/20">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Add Friend</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Search by Discord tag or username..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500/50"
            />
          </div>

          <div>
            <textarea
              placeholder="Optional message..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500/50"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onSend('demo-user-id', message)}
              className="flex-1 btn btn-primary"
            >
              <Send className="w-4 h-4" /> Send Request
            </button>
            <button onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
