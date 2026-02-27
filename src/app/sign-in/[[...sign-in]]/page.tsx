// src/app/sign-in/[[...sign-in]]/page.tsx
'use client'

import { signIn } from 'next-auth/react'
import { Swords } from 'lucide-react'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="card max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl shadow-lg shadow-cyan-500/30">
            <Swords className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
          ARC Raiders LFG
        </h1>
        <p className="text-slate-400 mb-8">Sign in to find your squad and join the fight</p>

        <button
          onClick={() => signIn('discord', { callbackUrl: '/dashboard' })}
          className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold text-lg transition-all hover:shadow-lg hover:shadow-indigo-500/50"
        >
          <svg width="24" height="24" viewBox="0 0 71 55" fill="currentColor">
            <path d="M60.1 4.9A58.5 58.5 0 0 0 45.4.8a.22.22 0 0 0-.23.11 40.8 40.8 0 0 0-1.8 3.7 54 54 0 0 0-16.2 0 37.3 37.3 0 0 0-1.83-3.7.23.23 0 0 0-.23-.11A58.3 58.3 0 0 0 10.9 4.9a.2.2 0 0 0-.1.08C1.6 18.1-.96 31 .3 43.7a.24.24 0 0 0 .09.17 58.8 58.8 0 0 0 17.7 8.9.23.23 0 0 0 .25-.08 42 42 0 0 0 3.61-5.87.22.22 0 0 0-.12-.31 38.7 38.7 0 0 1-5.53-2.63.23.23 0 0 1-.02-.38c.37-.28.74-.57 1.1-.86a.22.22 0 0 1 .23-.03c11.6 5.3 24.1 5.3 35.5 0a.22.22 0 0 1 .23.03c.35.29.73.58 1.1.86a.23.23 0 0 1-.02.38 36.4 36.4 0 0 1-5.54 2.63.22.22 0 0 0-.12.31 47.1 47.1 0 0 0 3.6 5.87.22.22 0 0 0 .25.08 58.6 58.6 0 0 0 17.7-8.9.23.23 0 0 0 .1-.16c1.48-15.3-2.48-28.6-10.5-40.4a.18.18 0 0 0-.09-.09ZM23.7 36.5c-3.49 0-6.37-3.21-6.37-7.15s2.83-7.15 6.37-7.15c3.57 0 6.42 3.24 6.37 7.15 0 3.94-2.83 7.15-6.37 7.15Zm23.6 0c-3.49 0-6.37-3.21-6.37-7.15s2.83-7.15 6.37-7.15c3.57 0 6.42 3.24 6.37 7.15 0 3.94-2.8 7.15-6.37 7.15Z"/>
          </svg>
          Continue with Discord
        </button>

        <p className="text-xs text-slate-500 mt-6">
          By signing in you agree to our Terms of Service. Your Discord ID is used only to identify your account.
        </p>
      </div>
    </div>
  )
}
