'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const GAME_MODES = ['Raids', 'PvP', 'Co-op', 'Story', 'Any']
const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Elite', 'Any']
const TIMEZONES = ['UTC', 'EST', 'CST', 'MST', 'PST', 'GMT', 'CET', 'JST', 'AEST']

export default function CreateLFGPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    gameMode: 'Any',
    skillLevel: 'Any',
    playersNeeded: 2,
    timezone: 'UTC',
    language: 'English',
  })

  if (!isLoaded) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  if (!user) {
    router.push('/sign-in')
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { toast.error('Title is required'); return }
    if (!form.description.trim()) { toast.error('Description is required'); return }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/lfg/postings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error(await res.text())
      toast.success('LFG posting created!')
      router.push('/lfg')
    } catch (err: any) {
      toast.error(err.message || 'Failed to create posting')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Navigation />
      <div className="pt-20 min-h-screen bg-slate-950">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Link href="/lfg" className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors mb-4">
              <ArrowLeft className="w-4 h-4" /> Back to Browse
            </Link>
            <h1 className="text-4xl font-bold">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                Create LFG Posting
              </span>
            </h1>
            <p className="text-slate-400 mt-1">Find teammates for your next mission</p>
          </div>

          <form onSubmit={handleSubmit} className="card space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1">Title <span className="text-red-400">*</span></label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Looking for 2 for Raid - chill vibes"
                className="w-full px-3 py-2 bg-slate-900 border border-cyan-500/20 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description <span className="text-red-400">*</span></label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe what you're looking for, your playstyle, any requirements..."
                rows={4}
                className="w-full px-3 py-2 bg-slate-900 border border-cyan-500/20 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Game Mode</label>
                <select name="gameMode" value={form.gameMode} onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-900 border border-cyan-500/20 rounded-lg text-white focus:border-cyan-500/50">
                  {GAME_MODES.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Skill Level</label>
                <select name="skillLevel" value={form.skillLevel} onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-900 border border-cyan-500/20 rounded-lg text-white focus:border-cyan-500/50">
                  {SKILL_LEVELS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Players Needed</label>
                <input
                  type="number"
                  name="playersNeeded"
                  min={1} max={10}
                  value={form.playersNeeded}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-900 border border-cyan-500/20 rounded-lg text-white focus:border-cyan-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Timezone</label>
                <select name="timezone" value={form.timezone} onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-900 border border-cyan-500/20 rounded-lg text-white focus:border-cyan-500/50">
                  {TIMEZONES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Language</label>
              <input
                name="language"
                value={form.language}
                onChange={handleChange}
                placeholder="English"
                className="w-full px-3 py-2 bg-slate-900 border border-cyan-500/20 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500/50"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Posting'}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
