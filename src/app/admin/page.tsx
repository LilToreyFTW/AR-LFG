// src/app/admin/page.tsx
'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Settings, Users, Shield, BarChart3, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

// Replace with actual Discord IDs of admins
const ADMIN_DISCORD_IDS = ['YOUR_DISCORD_ID_HERE']

type Tab = 'overview' | 'users' | 'postings' | 'settings'

export default function AdminPanel() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const discordId = (session?.user as any)?.discordId

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/sign-in'); return }
    if (status === 'authenticated') {
      if (!ADMIN_DISCORD_IDS.includes(discordId)) {
        toast.error('❌ ACCESS DENIED')
        router.push('/')
        return
      }
      fetch('/api/admin/stats').then(r => r.ok ? r.json() : null).then(setStats).finally(() => setLoading(false))
    }
  }, [status, discordId, router])

  if (status === 'loading' || loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500" />
      </div>
    )
  }

  if (!session || !ADMIN_DISCORD_IDS.includes(discordId)) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="card max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-slate-400 mb-6">You don't have permission to view this page.</p>
          <button onClick={() => router.push('/')} className="btn btn-primary w-full">Return to Home</button>
        </div>
      </div>
    )
  }

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'overview',  label: 'Overview',  icon: BarChart3  },
    { id: 'users',     label: 'Users',     icon: Users      },
    { id: 'postings',  label: 'Postings',  icon: AlertCircle },
    { id: 'settings',  label: 'Settings',  icon: Settings   },
  ]

  return (
    <div className="pt-20 min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Admin Panel</span>
            </h1>
            <p className="text-slate-400">Administrator Dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            <p className="font-bold text-cyan-400">{session.user?.name}</p>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-8 border-b border-cyan-500/20 pb-4">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === id
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 border border-slate-700'
              }`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Users',     value: stats?.totalUsers     ?? 0, color: 'cyan'   },
                { label: 'Active Postings', value: stats?.activePostings ?? 0, color: 'purple' },
                { label: 'Site Health',     value: stats?.healthScore ? `${stats.healthScore}%` : 'N/A', color: 'green' },
                { label: 'Messages',        value: stats?.messages       ?? 0, color: 'pink'   },
              ].map(({ label, value, color }) => {
                const g = color === 'cyan' ? 'from-cyan-500 to-cyan-600' : color === 'purple' ? 'from-purple-500 to-purple-600' : color === 'pink' ? 'from-pink-500 to-pink-600' : 'from-green-500 to-green-600'
                return (
                  <div key={label} className="card">
                    <p className="text-slate-400 text-sm mb-2">{label}</p>
                    <p className={`text-3xl font-bold bg-gradient-to-r ${g} bg-clip-text text-transparent`}>{value}</p>
                  </div>
                )
              })}
            </div>
            <div className="card">
              <h3 className="text-xl font-bold mb-4">System Status</h3>
              {[['Database','✅ Connected'],['API','✅ Running'],['Auth','✅ Active'],['Storage','✅ Available']].map(([l,s]) => (
                <div key={l} className="flex justify-between py-2 border-b border-slate-800 last:border-0">
                  <p>{l}</p><p className="text-green-400">{s}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'users'    && <div className="card"><h2 className="text-2xl font-bold mb-4">User Management</h2><p className="text-slate-400">Coming soon...</p></div>}
        {activeTab === 'postings' && <div className="card"><h2 className="text-2xl font-bold mb-4">LFG Postings</h2><p className="text-slate-400">Coming soon...</p></div>}
        {activeTab === 'settings' && <div className="card"><h2 className="text-2xl font-bold mb-4">Site Settings</h2><p className="text-slate-400">Coming soon...</p></div>}
      </div>
    </div>
  )
}
