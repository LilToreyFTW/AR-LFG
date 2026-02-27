// src/components/Navigation.tsx
'use client'

import Link from 'next/link'
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { Users, Swords, Heart } from 'lucide-react'

export default function Navigation() {
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
            <SignedIn>
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
            </SignedIn>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-4 py-2 text-sm font-medium text-slate-100 hover:text-cyan-400 transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-medium text-sm transition-all hover:shadow-lg hover:shadow-cyan-500/50">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: 'w-10 h-10 rounded-lg border border-cyan-500/50 hover:border-cyan-500 transition-colors',
                  },
                }}
              />
            </SignedIn>
          </div>
        </div>
      </div>
    </nav>
  )
}