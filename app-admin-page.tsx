// src/app/admin/page.tsx
'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Settings, Users, Shield, BarChart3, LogOut, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { isOwner } from '@/lib/owner'

type Tab = 'overview' | 'users' | 'postings' | 'settings'

export default function AdminPanel() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [users, setUsers] = useState<any[]>([])
  const [postings, setPostings] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Check if user is owner
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (!isOwner(session?.user?.id)) {
      toast.error('❌ ACCESS DENIED - Owner access only')
      router.push('/')
      return
    }

    fetchDashboardData()
  }, [session, status])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [usersRes, postingsRes, statsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/postings'),
        fetch('/api/admin/stats'),
      ])

      if (usersRes.ok) setUsers(await usersRes.json())
      if (postingsRes.ok) setPostings(await postingsRes.json())
      if (statsRes.ok) setStats(await statsRes.json())
    } catch (error) {
      console.error('Failed to fetch admin data:', error)
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (!session?.user || !isOwner(session.user.id)) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="card max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-slate-400 mb-6">You do not have permission to access this page.</p>
          <button
            onClick={() => router.push('/')}
            className="btn btn-primary w-full"
          >
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-20 min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                  Admin Panel
                </span>
              </h1>
              <p className="text-slate-400">Owner Dashboard - Full Control</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-slate-400">Logged in as</p>
                <p className="font-bold text-cyan-400">{session.user.name}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 border-b border-cyan-500/20 pb-4">
          <TabButton
            icon={BarChart3}
            label="Overview"
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
          />
          <TabButton
            icon={Users}
            label="Users"
            active={activeTab === 'users'}
            onClick={() => setActiveTab('users')}
          />
          <TabButton
            icon={AlertCircle}
            label="Postings"
            active={activeTab === 'postings'}
            onClick={() => setActiveTab('postings')}
          />
          <TabButton
            icon={Settings}
            label="Settings"
            active={activeTab === 'settings'}
            onClick={() => setActiveTab('settings')}
          />
        </div>

        {/* Content */}
        {activeTab === 'overview' && <OverviewTab stats={stats} users={users} postings={postings} />}
        {activeTab === 'users' && <UsersTab users={users} onRefresh={fetchDashboardData} />}
        {activeTab === 'postings' && <PostingsTab postings={postings} onRefresh={fetchDashboardData} />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  )
}

// Tab Button Component
function TabButton({ icon: Icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
        active
          ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
          : 'text-slate-400 hover:text-slate-200 border border-slate-700'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  )
}

// Overview Tab
function OverviewTab({ stats, users, postings }: any) {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"
          value={stats?.totalUsers || 0}
          color="cyan"
        />
        <StatCard
          label="Active Postings"
          value={stats?.activePostings || 0}
          color="purple"
        />
        <StatCard
          label="Verified Players"
          value={stats?.verifiedPlayers || 0}
          color="pink"
        />
        <StatCard
          label="Site Health"
          value={stats?.healthScore ? `${stats.healthScore}%` : 'N/A'}
          color="green"
        />
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <ActivityItem
            action="New user registered"
            user="Discord User"
            time="2 minutes ago"
          />
          <ActivityItem
            action="LFG posting created"
            user="Player Name"
            time="5 minutes ago"
          />
          <ActivityItem
            action="User linked EMBARK ID"
            user="BL0WDART"
            time="10 minutes ago"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickActionBtn label="Send Site Notice" icon="📢" />
          <QuickActionBtn label="Feature Posting" icon="⭐" />
          <QuickActionBtn label="Ban User" icon="🚫" />
          <QuickActionBtn label="View Logs" icon="📋" />
        </div>
      </div>
    </div>
  )
}

// Users Tab
function UsersTab({ users, onRefresh }: any) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <button
          onClick={onRefresh}
          className="btn btn-secondary"
        >
          Refresh
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-cyan-500/20">
            <tr>
              <th className="text-left py-3 px-4">User</th>
              <th className="text-left py-3 px-4">Email</th>
              <th className="text-left py-3 px-4">Discord ID</th>
              <th className="text-left py-3 px-4">Role</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user: any) => (
                <tr key={user.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {user.image && (
                        <img
                          src={user.image}
                          alt={user.name}
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-400">{user.email}</td>
                  <td className="py-3 px-4 text-sm text-slate-400">{user.discordId}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      user.role === 'owner'
                        ? 'bg-purple-500/20 text-purple-400'
                        : user.role === 'admin'
                        ? 'bg-blue-500/20 text-blue-400'
                        : user.role === 'moderator'
                        ? 'bg-cyan-500/20 text-cyan-400'
                        : 'bg-slate-700 text-slate-300'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={user.isBanned ? 'text-red-400' : 'text-green-400'}>
                      {user.isBanned ? '🚫 Banned' : '✅ Active'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <button className="text-cyan-400 hover:text-cyan-300 mr-3">
                      Edit
                    </button>
                    {user.role !== 'owner' && (
                      <button className="text-red-400 hover:text-red-300">
                        Ban
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-6 text-center text-slate-400">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Postings Tab
function PostingsTab({ postings, onRefresh }: any) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">LFG Postings Management</h2>
        <button
          onClick={onRefresh}
          className="btn btn-secondary"
        >
          Refresh
        </button>
      </div>

      <div className="grid gap-4">
        {postings.length > 0 ? (
          postings.map((posting: any) => (
            <div key={posting.id} className="card">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold mb-2">{posting.title}</h3>
                  <p className="text-sm text-slate-400 mb-3">{posting.description}</p>
                  <div className="flex gap-4 text-sm">
                    <span>👤 {posting.creator?.name}</span>
                    <span>🎮 {posting.gameMode}</span>
                    <span>📊 {posting.participants?.length || 0}/{posting.playersNeeded}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded text-sm hover:bg-cyan-500/30">
                    Feature
                  </button>
                  <button className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-sm hover:bg-red-500/30">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="card text-center py-6">
            <p className="text-slate-400">No postings found</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Settings Tab
function SettingsTab() {
  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Site Settings</h2>
        
        <div className="space-y-4">
          <SettingInput
            label="Site Name"
            value="ARC Raiders LFG"
            description="The name displayed across the site"
          />
          <SettingInput
            label="Site Description"
            value="Looking for Group platform for ARC Raiders"
            description="Short description of the site"
            isTextarea
          />
          <SettingToggle
            label="Maintenance Mode"
            description="Disable access for non-admins"
            enabled={false}
          />
          <SettingToggle
            label="New User Registration"
            description="Allow new users to sign up"
            enabled={true}
          />
          <SettingToggle
            label="LFG Posting Creation"
            description="Allow users to create LFG postings"
            enabled={true}
          />
        </div>

        <button className="btn btn-primary mt-6 w-full">
          Save Changes
        </button>
      </div>

      {/* Danger Zone */}
      <div className="card border-2 border-red-500/30">
        <h3 className="text-xl font-bold text-red-400 mb-4">⚠️ Danger Zone</h3>
        <button className="btn btn-danger w-full">
          Reset All Data (WARNING: Cannot be undone)
        </button>
      </div>
    </div>
  )
}

// Helper Components
function StatCard({ label, value, color }: any) {
  const colorClass = color === 'cyan' ? 'from-cyan-500 to-cyan-600' :
                     color === 'purple' ? 'from-purple-500 to-purple-600' :
                     color === 'pink' ? 'from-pink-500 to-pink-600' :
                     'from-green-500 to-green-600'

  return (
    <div className="card">
      <p className="text-slate-400 text-sm mb-2">{label}</p>
      <p className={`text-3xl font-bold bg-gradient-to-r ${colorClass} bg-clip-text text-transparent`}>
        {value}
      </p>
    </div>
  )
}

function ActivityItem({ action, user, time }: any) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-800 last:border-0">
      <div>
        <p className="font-medium text-white">{action}</p>
        <p className="text-xs text-slate-400">{user}</p>
      </div>
      <p className="text-xs text-slate-500">{time}</p>
    </div>
  )
}

function QuickActionBtn({ label, icon }: any) {
  return (
    <button className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800 transition-all text-center">
      <div className="text-2xl mb-2">{icon}</div>
      <p className="text-xs font-medium text-slate-300">{label}</p>
    </button>
  )
}

function SettingInput({ label, value, description, isTextarea }: any) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <p className="text-xs text-slate-400 mb-2">{description}</p>
      {isTextarea ? (
        <textarea
          defaultValue={value}
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white focus:border-cyan-500"
          rows={4}
        />
      ) : (
        <input
          type="text"
          defaultValue={value}
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white focus:border-cyan-500"
        />
      )}
    </div>
  )
}

function SettingToggle({ label, description, enabled }: any) {
  const [isEnabled, setIsEnabled] = useState(enabled)

  return (
    <div className="flex justify-between items-center p-3 bg-slate-800/30 rounded border border-slate-700">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
      <button
        onClick={() => setIsEnabled(!isEnabled)}
        className={`w-12 h-6 rounded-full transition-all ${
          isEnabled
            ? 'bg-green-500'
            : 'bg-slate-700'
        }`}
      >
        <div
          className={`w-5 h-5 rounded-full bg-white transition-transform ${
            isEnabled ? 'translate-x-6' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  )
}
