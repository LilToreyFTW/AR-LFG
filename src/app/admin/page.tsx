// src/app/admin/page.tsx
'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Settings, Users, Shield, BarChart3, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

type Tab = 'overview' | 'users' | 'postings' | 'settings'

// Admin IDs (replace with actual admin Clerk IDs)
const ADMIN_IDS = [
  'user_admin_id_here', // Add your Clerk user ID
]

export default function AdminPanel() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Check if user is admin
  useEffect(() => {
    if (!isLoaded) return

    if (!user) {
      router.push('/sign-in')
      return
    }

    const isAdmin = ADMIN_IDS.includes(user.id)
    if (!isAdmin) {
      toast.error('❌ ACCESS DENIED - Admin access only')
      router.push('/')
      return
    }

    fetchDashboardData()
  }, [user, isLoaded, router])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/stats')
      if (res.ok) {
        setStats(await res.json())
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error)
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (!user || !ADMIN_IDS.includes(user.id)) {
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
              <p className="text-slate-400">Administrator Dashboard</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-slate-400">Logged in as</p>
                <p className="font-bold text-cyan-400">{user.firstName} {user.lastName}</p>
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
        {activeTab === 'overview' && <OverviewTab stats={stats} />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'postings' && <PostingsTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  )
}

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

function OverviewTab({ stats }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={stats?.totalUsers || 0} color="cyan" />
        <StatCard label="Active Postings" value={stats?.activePostings || 0} color="purple" />
        <StatCard label="Site Health" value={stats?.healthScore ? `${stats.healthScore}%` : 'N/A'} color="green" />
        <StatCard label="Messages" value={stats?.messages || 0} color="pink" />
      </div>

      <div className="card">
        <h3 className="text-xl font-bold mb-4">System Status</h3>
        <div className="space-y-2 text-sm">
          <StatusItem label="Database" status="✅ Connected" />
          <StatusItem label="API" status="✅ Running" />
          <StatusItem label="Authentication" status="✅ Active" />
          <StatusItem label="Storage" status="✅ Available" />
        </div>
      </div>
    </div>
  )
}

function UsersTab() {
  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-4">User Management</h2>
      <p className="text-slate-400">User management features coming soon...</p>
    </div>
  )
}

function PostingsTab() {
  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-4">LFG Postings</h2>
      <p className="text-slate-400">Postings management features coming soon...</p>
    </div>
  )
}

function SettingsTab() {
  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Site Settings</h2>
        <p className="text-slate-400">Settings management coming soon...</p>
      </div>
    </div>
  )
}

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

function StatusItem({ label, status }: any) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-800 last:border-0">
      <p className="font-medium">{label}</p>
      <p className="text-green-400">{status}</p>
    </div>
  )
}
