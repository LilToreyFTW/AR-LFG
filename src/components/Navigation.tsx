// src/components/Navigation.tsx
'use client'

import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Users, Swords, Heart, LogOut, LogIn, UserPlus, Shield, Gamepad2, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Navigation() {
  const { data: session, status } = useSession()
  const loading = status === 'loading'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Users },
    { href: '/lfg', label: 'Find Group', icon: Heart },
    { href: '/factions', label: 'Factions', icon: Shield },
    { href: '/groups', label: 'Groups', icon: Gamepad2 },
    { href: '/friends', label: 'Friends', icon: UserPlus },
  ]

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

          {/* Desktop Navigation */}
          {session && (
            <div className="hidden lg:flex items-center gap-6">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-slate-300 hover:text-cyan-400 transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <Icon className="w-4 h-4" /> {label}
                </Link>
              ))}
            </div>
          )}

          {/* Auth & Mobile Menu */}
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
                
                {/* Desktop Sign Out */}
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="hidden lg:flex items-center gap-1 text-slate-400 hover:text-red-400 transition-colors text-sm"
                >
                  <LogOut className="w-4 h-4" />
                </button>

                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden text-slate-400 hover:text-white transition-colors"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn('discord')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium text-sm transition-all hover:shadow-lg hover:shadow-indigo-500/50"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Sign in with Discord</span>
                <span className="sm:hidden">Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {session && mobileMenuOpen && (
          <div className="lg:hidden border-t border-cyan-500/20 py-4">
            <div className="flex flex-col gap-2">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-slate-300 hover:text-cyan-400 transition-colors flex items-center gap-3 py-2 px-4 rounded-lg hover:bg-slate-800/50"
                >
                  <Icon className="w-5 h-5" /> {label}
                </Link>
              ))}
              <button
                onClick={() => {
                  signOut({ callbackUrl: '/' })
                  setMobileMenuOpen(false)
                }}
                className="flex items-center gap-3 py-2 px-4 rounded-lg hover:bg-slate-800/50 text-red-400 transition-colors"
              >
                <LogOut className="w-5 h-5" /> Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
