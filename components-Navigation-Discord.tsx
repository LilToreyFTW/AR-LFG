// src/components/Navigation.tsx
'use client'

import Link from 'next/link'
import { signIn, signOut, useSession } from 'next-auth/react'
import { Users, Swords, Heart, LogOut } from 'lucide-react'
import Image from 'next/image'

export default function Navigation() {
  const { data: session, status } = useSession()
  const isLoading = status === 'loading'

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

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {session?.user && (
              <>
                <Link
                  href="/dashboard"
                  className="text-slate-300 hover:text-cyan-400 transition-colors flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  href="/lfg"
                  className="text-slate-300 hover:text-cyan-400 transition-colors flex items-center gap-2"
                >
                  <Heart className="w-4 h-4" />
                  Find Group
                </Link>
              </>
            )}
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-4">
            {isLoading ? (
              <div className="px-4 py-2 text-sm text-slate-400">Loading...</div>
            ) : session?.user ? (
              <div className="flex items-center gap-4">
                {/* User Avatar & Name */}
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800/50 border border-cyan-500/20">
                  {session.user.image && (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      width={32}
                      height={32}
                      className="rounded-full w-8 h-8"
                    />
                  )}
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-white">
                      {session.user.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {session.user.email}
                    </p>
                  </div>
                </div>

                {/* Sign Out Button */}
                <button
                  onClick={() => signOut({ redirect: true, callbackUrl: '/' })}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-colors text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn('discord', { callbackUrl: '/dashboard' })}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-medium text-sm transition-all hover:shadow-lg hover:shadow-cyan-500/50"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.211.375-.444.864-.607 1.25a18.27 18.27 0 00-5.487 0c-.163-.386-.395-.875-.607-1.25a.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.873-1.295 1.226-1.994a.076.076 0 00-.042-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.294.075.075 0 01.078-.01c3.928 1.793 8.18 1.793 12.062 0a.075.075 0 01.079.009c.12.098.246.198.373.295a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.076.076 0 00-.041.107c.36.699.77 1.364 1.225 1.994a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-4.506.055-8.986-.5-13.585a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-.965-2.157-2.156 0-1.193.93-2.157 2.157-2.157 1.226 0 2.157.964 2.157 2.157 0 1.19-.93 2.155-2.157 2.155zm7.975 0c-1.183 0-2.157-.965-2.157-2.156 0-1.193.93-2.157 2.157-2.157 1.226 0 2.157.964 2.157 2.157 0 1.19-.931 2.155-2.157 2.155z" />
                </svg>
                Sign in with Discord
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
