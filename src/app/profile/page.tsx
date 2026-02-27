// src/app/profile/page.tsx
'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navigation from '@/components/Navigation'
import { Edit2, Save, Shield, Gamepad2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Profile() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({ bio: '', timezone: 'UTC', language: 'English', embarkId: '' })

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/sign-in')
  }, [status, router])

  if (status === 'loading' || !session) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500" />
      </div>
    )
  }

  const user = session.user as any

  const handleSave = async () => {
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      toast.success('Profile updated!')
      setIsEditing(false)
    } catch {
      toast.error('Failed to update profile')
    }
  }

  const handleLinkEmbark = async () => {
    if (!form.embarkId.trim()) { toast.error('Enter your Embark ID first'); return }
    try {
      const res = await fetch('/api/users/link-embark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embarkId: form.embarkId }),
      })
      if (!res.ok) throw new Error()
      toast.success('Embark ID linked! ✅')
    } catch {
      toast.error('Failed to link Embark ID')
    }
  }

  return (
    <>
      <Navigation />
      <div className="pt-20 min-h-screen bg-slate-950">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                  My Profile
                </span>
              </h1>
              <p className="text-slate-400">Manage your account and gaming profile</p>
            </div>
            <button onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className="flex items-center gap-2 btn btn-secondary">
              {isEditing ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
              {isEditing ? 'Save' : 'Edit'}
            </button>
          </div>

          {/* Profile card */}
          <div className="card mb-6">
            <div className="flex items-center gap-6 mb-6 pb-6 border-b border-slate-700">
              {user?.image ? (
                <img src={user.image} alt="avatar" className="w-20 h-20 rounded-lg border-2 border-cyan-500/50 object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white">
                  {user?.name?.charAt(0) ?? '?'}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold">{user?.name}</h2>
                <p className="text-slate-400 text-sm flex items-center gap-1 mt-1">
                  <Shield className="w-3.5 h-3.5 text-[#5865F2]" /> Signed in via Discord
                </p>
                {user?.embarkUsername && (
                  <p className="text-cyan-400 text-sm flex items-center gap-1 mt-1">
                    <Gamepad2 className="w-3.5 h-3.5" /> {user.embarkUsername}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Bio</label>
                <textarea disabled={!isEditing} value={form.bio}
                  onChange={e => setForm({ ...form, bio: e.target.value })}
                  placeholder="Tell other players about yourself..."
                  className="input w-full disabled:opacity-50" rows={3} />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Timezone</label>
                  <select disabled={!isEditing} value={form.timezone}
                    onChange={e => setForm({ ...form, timezone: e.target.value })}
                    className="input w-full disabled:opacity-50">
                    {['UTC','EST','CST','MST','PST','GMT','CET','JST','AEST'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Language</label>
                  <input disabled={!isEditing} value={form.language}
                    onChange={e => setForm({ ...form, language: e.target.value })}
                    placeholder="English" className="input w-full disabled:opacity-50" />
                </div>
              </div>
              {isEditing && (
                <button onClick={() => setIsEditing(false)} className="w-full btn btn-secondary">Cancel</button>
              )}
            </div>
          </div>

          {/* Link Embark ID */}
          <div className="card">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-cyan-400" /> Link Your Embark ID
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              Connect your ARC Raiders in-game account to enable faction features, matchmaking, and stat tracking.
            </p>
            <div className="flex gap-3">
              <input value={form.embarkId}
                onChange={e => setForm({ ...form, embarkId: e.target.value })}
                placeholder="Your Embark ID (e.g. RAIDER-XXXX)"
                className="input flex-1" />
              <button onClick={handleLinkEmbark} className="btn btn-primary whitespace-nowrap">
                Link ID
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
