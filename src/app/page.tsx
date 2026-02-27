// src/app/page.tsx
'use client'

import Navigation from '@/components/Navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Users, Zap, Shield, Swords } from 'lucide-react'

export default function Home() {
  const { data: session } = useSession()

  return (
    <>
      <Navigation />
      <main className="min-h-screen pt-20">

        {/* Hero */}
        <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex justify-center mb-8">
              <div className="p-4 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl shadow-xl shadow-cyan-500/30">
                <Swords className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Find Your Squad
              </span>
            </h1>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
              The ultimate Looking For Group platform for ARC Raiders.
              Connect with players, join factions, and dominate together.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {session ? (
                <>
                  <Link href="/lfg"
                    className="px-8 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold transition-all hover:shadow-lg hover:shadow-cyan-500/50">
                    Browse Groups
                  </Link>
                  <Link href="/dashboard"
                    className="px-8 py-3 rounded-lg border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 font-bold transition-all">
                    My Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/sign-in"
                    className="px-8 py-3 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold transition-all hover:shadow-lg hover:shadow-indigo-500/50">
                    Sign in with Discord
                  </Link>
                  <Link href="/sign-in"
                    className="px-8 py-3 rounded-lg border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 font-bold transition-all">
                    Learn More
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/30">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-16">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                Why Choose ARC LFG?
              </span>
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Users,  color: 'from-cyan-500 to-cyan-600',   title: 'Smart Matchmaking',  desc: 'Find players at your skill level. Our matching system ensures balanced, competitive, and fun games.' },
                { icon: Zap,    color: 'from-purple-500 to-purple-600', title: 'Real-Time Groups',   desc: 'Join active groups instantly. See live postings, player stats, and community ratings in real-time.' },
                { icon: Shield, color: 'from-pink-500 to-pink-600',    title: 'Factions & Guilds',  desc: 'Join Bungulators, FMF, Jungle, Civilians, Merchants — or create your own faction and recruit members.' },
              ].map(({ icon: Icon, color, title, desc }) => (
                <div key={title} className="card text-center">
                  <div className="mb-4 flex justify-center">
                    <div className={`p-3 bg-gradient-to-br ${color} rounded-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{title}</h3>
                  <p className="text-slate-400">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to Find Your Team?</h2>
            <p className="text-xl text-slate-300 mb-8">
              Join ARC Raiders players using our platform to find teammates, join factions, and track their Embark progress.
            </p>
            {!session && (
              <Link href="/sign-in"
                className="inline-block px-8 py-3 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold transition-all hover:shadow-lg hover:shadow-indigo-500/50">
                Sign in with Discord — It's Free
              </Link>
            )}
            {session && (
              <Link href="/lfg"
                className="inline-block px-8 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold transition-all hover:shadow-lg hover:shadow-cyan-500/50">
                Start Browsing Groups
              </Link>
            )}
          </div>
        </section>
      </main>
    </>
  )
}
