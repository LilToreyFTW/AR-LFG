// src/app/page.tsx
import Navigation from '@/components/Navigation'
import { SignedIn, SignedOut } from '@clerk/nextjs'
import Link from 'next/link'
import { Users, Zap, Shield } from 'lucide-react'

export default function Home() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Find Your Squad
                </span>
              </h1>
              <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                The ultimate Looking For Group (LFG) platform for ARC Raiders.
                Connect with players, form squads, and dominate together.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <SignedOut>
                  <Link
                    href="/sign-up"
                    className="px-8 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold transition-all hover:shadow-lg hover:shadow-cyan-500/50"
                  >
                    Get Started
                  </Link>
                  <Link
                    href="/sign-in"
                    className="px-8 py-3 rounded-lg border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 font-bold transition-all"
                  >
                    Sign In
                  </Link>
                </SignedOut>

                <SignedIn>
                  <Link
                    href="/lfg"
                    className="px-8 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold transition-all hover:shadow-lg hover:shadow-cyan-500/50"
                  >
                    Browse Groups
                  </Link>
                  <Link
                    href="/dashboard"
                    className="px-8 py-3 rounded-lg border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 font-bold transition-all"
                  >
                    My Dashboard
                  </Link>
                </SignedIn>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/30">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-16">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                Why Choose ARC LFG?
              </span>
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="card text-center">
                <div className="mb-4 flex justify-center">
                  <div className="p-3 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">Smart Matchmaking</h3>
                <p className="text-slate-400">
                  Find players at your skill level. Our intelligent matching system
                  ensures balanced, competitive, and fun games.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="card text-center">
                <div className="mb-4 flex justify-center">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">Real-Time Groups</h3>
                <p className="text-slate-400">
                  Join active groups instantly. See live postings, player stats, and
                  community ratings in real-time.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="card text-center">
                <div className="mb-4 flex justify-center">
                  <div className="p-3 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">Build Your Rep</h3>
                <p className="text-slate-400">
                  Create a verified player profile linked to your ARC Raiders account.
                  Build your gaming reputation with every match.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Find Your Team?
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              Join thousands of ARC Raiders players already using our platform to
              find teammates and improve their game.
            </p>

            <SignedOut>
              <Link
                href="/sign-up"
                className="inline-block px-8 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold transition-all hover:shadow-lg hover:shadow-cyan-500/50"
              >
                Create Free Account
              </Link>
            </SignedOut>

            <SignedIn>
              <Link
                href="/lfg"
                className="inline-block px-8 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold transition-all hover:shadow-lg hover:shadow-cyan-500/50"
              >
                Start Browsing Groups
              </Link>
            </SignedIn>
          </div>
        </section>
      </main>
    </>
  )
}
