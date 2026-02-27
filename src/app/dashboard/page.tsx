// src/app/dashboard/page.tsx
'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import Link from 'next/link'
import { Users, BarChart3, Heart, Settings } from 'lucide-react'

export default function Dashboard() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

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
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                Welcome, {user.firstName}!
              </span>
            </h1>
            <p className="text-slate-400">Manage your profile, groups, and connections</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={<Users className="w-6 h-6" />}
              title="My Groups"
              value="0"
              color="cyan"
            />
            <StatCard
              icon={<Heart className="w-6 h-6" />}
              title="Friends"
              value="0"
              color="purple"
            />
            <StatCard
              icon={<BarChart3 className="w-6 h-6" />}
              title="Profile Level"
              value="1"
              color="pink"
            />
            <StatCard
              icon={<Settings className="w-6 h-6" />}
              title="Achievements"
              value="0"
              color="green"
            />
          </div>

          {/* Main Content */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* My Postings */}
            <div className="md:col-span-2">
              <div className="card">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">My LFG Postings</h2>
                  <Link
                    href="/lfg/create"
                    className="btn btn-primary text-sm"
                  >
                    Create New
                  </Link>
                </div>
                <p className="text-slate-400">You haven't created any groups yet.</p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="card">
              <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  href="/lfg"
                  className="block p-3 rounded-lg border border-cyan-500/20 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all"
                >
                  <p className="font-medium">Browse Groups</p>
                  <p className="text-xs text-slate-400">Find teams to join</p>
                </Link>
                <Link
                  href="/profile"
                  className="block p-3 rounded-lg border border-cyan-500/20 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all"
                >
                  <p className="font-medium">Edit Profile</p>
                  <p className="text-xs text-slate-400">Update your information</p>
                </Link>
                <Link
                  href="/friends"
                  className="block p-3 rounded-lg border border-cyan-500/20 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all"
                >
                  <p className="font-medium">Friend Requests</p>
                  <p className="text-xs text-slate-400">Manage connections</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function StatCard({ icon, title, value, color }: any) {
  const colorClass = color === 'cyan' ? 'from-cyan-500 to-cyan-600' :
                     color === 'purple' ? 'from-purple-500 to-purple-600' :
                     color === 'pink' ? 'from-pink-500 to-pink-600' :
                     'from-green-500 to-green-600'

  return (
    <div className="card">
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorClass} flex items-center justify-center text-white mb-3`}>
        {icon}
      </div>
      <p className="text-slate-400 text-sm">{title}</p>
      <p className={`text-3xl font-bold bg-gradient-to-r ${colorClass} bg-clip-text text-transparent`}>
        {value}
      </p>
    </div>
  )
}
