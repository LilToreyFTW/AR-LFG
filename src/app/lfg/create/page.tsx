// src/app/lfg/create/page.tsx
'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navigation from '@/components/Navigation'
import toast from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const GAME_MODES = ['Extraction', 'Trio', 'Duo', 'Solo', 'Any']
const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Veteran', 'Any']
const TIMEZONES = ['UTC', 'EST', 'CST', 'MST', 'PST', 'GMT', 'CET', 'JST', 'AEST']
const MAPS = ['Dam Battlegrounds', 'Buried City', 'Spaceport', 'Blue Gate', 'Stella Montis', 'Any']

export default function CreateLFGPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '',
    gameMode: 'Extraction', skillLevel: 'Any',
    playersNeeded: 2, timezone: 'UTC',
    language: 'English', preferredMap: 'Any',
  })

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim())       { toast.error('Title is required');       return }
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
            <Field label="Title" required>
              <input name="title" value={form.title} onChange={handleChange}
                placeholder="e.g. Looking for 2 for Extraction run — chill vibes"
                className="input" />
            </Field>

            <Field label="Description" required>
              <textarea name="description" value={form.description} onChange={handleChange}
                placeholder="Describe your playstyle, requirements, voice chat preference..."
                rows={4} className="input" />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Game Mode">
                <select name="gameMode" value={form.gameMode} onChange={handleChange} className="input">
                  {GAME_MODES.map(m => <option key={m}>{m}</option>)}
                </select>
              </Field>
              <Field label="Skill Level">
                <select name="skillLevel" value={form.skillLevel} onChange={handleChange} className="input">
                  {SKILL_LEVELS.map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Players Needed">
                <input type="number" name="playersNeeded" min={1} max={10}
                  value={form.playersNeeded} onChange={handleChange} className="input" />
              </Field>
              <Field label="Preferred Map">
                <select name="preferredMap" value={form.preferredMap} onChange={handleChange} className="input">
                  {MAPS.map(m => <option key={m}>{m}</option>)}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Timezone">
                <select name="timezone" value={form.timezone} onChange={handleChange} className="input">
                  {TIMEZONES.map(t => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Language">
                <input name="language" value={form.language} onChange={handleChange}
                  placeholder="English" className="input" />
              </Field>
            </div>

            <button type="submit" disabled={isSubmitting}
              className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? 'Creating...' : 'Create Posting'}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  )
}
