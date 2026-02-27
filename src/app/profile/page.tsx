// src/app/profile/page.tsx
'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { Edit2, Save } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    bio: '',
    timezone: 'UTC',
    languages: 'English',
  })

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

  const handleSave = async () => {
    try {
      toast.success('Profile updated successfully!')
      setIsEditing(false)
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  return (
    <>
      <Navigation />
      <div className="pt-20 min-h-screen bg-slate-950">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                  My Profile
                </span>
              </h1>
              <p className="text-slate-400">Manage your account and gaming profile</p>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 btn btn-secondary"
            >
              {isEditing ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
              {isEditing ? 'Save' : 'Edit'}
            </button>
          </div>

          {/* Profile Card */}
          <div className="card mb-6">
            <div className="flex items-center gap-6 mb-6 pb-6 border-b border-slate-700">
              <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                {user.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={user.username || 'Profile'}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                ) : (
                  <div className="text-white text-2xl font-bold">
                    {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user.firstName} {user.lastName}</h2>
                <p className="text-slate-400">{user.primaryEmailAddress?.emailAddress}</p>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Bio</label>
                <textarea
                  disabled={!isEditing}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell other players about yourself..."
                  className="w-full px-3 py-2 bg-slate-900 border border-cyan-500/20 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500/50 disabled:opacity-50"
                  rows={4}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Timezone</label>
                  <select
                    disabled={!isEditing}
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-cyan-500/20 rounded-lg text-white focus:border-cyan-500/50 disabled:opacity-50"
                  >
                    <option>UTC</option>
                    <option>EST</option>
                    <option>CST</option>
                    <option>MST</option>
                    <option>PST</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Languages</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.languages}
                    onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                    placeholder="English, Spanish, etc."
                    className="w-full px-3 py-2 bg-slate-900 border border-cyan-500/20 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500/50 disabled:opacity-50"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={handleSave}
                    className="flex-1 btn btn-primary"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Account Settings */}
          <div className="card">
            <h3 className="text-xl font-bold mb-4">Account Settings</h3>
            <div className="space-y-2 text-sm">
              <p className="text-slate-400">Account type: <span className="text-cyan-400">Player</span></p>
              <p className="text-slate-400">Member since: <span className="text-cyan-400">{user.createdAt?.toLocaleDateString()}</span></p>
              <p className="text-slate-400">Last updated: <span className="text-cyan-400">Today</span></p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
