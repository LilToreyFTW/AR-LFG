// src/components/Navigation.tsx
'use client'

import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Users, Swords, Heart, LogOut, LogIn } from 'lucide-react'
import Image from 'next/image'

export default function Navigation() {
  const { data: session, status } = useSession()
  const loading = status === 'loading'

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-slate-950 to-transparent border-b border-cyan-500/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg group-hover:shadow-lg group-hover:shadow-cyan-500/50 transition-all">
              <Swords className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              ARC LFG
            </span>
          </Link>

          {/* Nav links — only when signed in */}
          {session && (
            <div className="hidden md:flex items-center gap-8">
              <Link href="/dashboard" className="text-slate-300 hover:text-cyan-400 transition-colors flex items-center gap-2">
                <Users className="w-4 h-4" /> Dashboard
              </Link>
              <Link href="/lfg" className="text-slate-300 hover:text-cyan-400 transition-colors flex items-center gap-2">
                <Heart className="w-4 h-4" /> Find Group
              </Link>
            </div>
          )}

          {/* Auth */}
          <div className="flex items-center gap-4">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-slate-700 animate-pulse" />
            ) : session ? (
              <div className="flex items-center gap-3">
                {session.user?.image ? (
                  <Link href="/profile">
                    <img
                      src={session.user.image}
                      alt={session.user.name ?? 'Avatar'}
                      width={36} height={36}
                      className="rounded-lg border border-cyan-500/50 hover:border-cyan-400 transition-colors cursor-pointer"
                    />
                  </Link>
                ) : (
                  <Link href="/profile"
                    className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm border border-cyan-500/50 hover:border-cyan-400 transition-colors">
                    {session.user?.name?.charAt(0) ?? '?'}
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex items-center gap-1 text-slate-400 hover:text-red-400 transition-colors text-sm"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn('discord')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium text-sm transition-all hover:shadow-lg hover:shadow-indigo-500/50"
              >
                <LogIn className="w-4 h-4" />
                Sign in with Discord
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
