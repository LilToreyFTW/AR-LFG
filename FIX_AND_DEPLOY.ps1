# ============================================================
# ARC Raiders LFG — Fix Build & Redeploy
# Run this in PowerShell from I:\ARC-RAIDERS_LFG
# ============================================================

$root = "I:\ARC-RAIDERS_LFG"
Set-Location $root

Write-Host "Step 1: Removing Clerk, fixing package.json..." -ForegroundColor Cyan
Copy-Item "$root\package-fixed.json" "$root\package.json" -Force
Copy-Item "$root\prisma-schema-fixed.prisma" "$root\prisma\schema.prisma" -Force

Write-Host "Step 2: Creating missing directories..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "$root\src\app\api\auth\[...nextauth]" | Out-Null
New-Item -ItemType Directory -Force -Path "$root\src\app\api\users\profile" | Out-Null
New-Item -ItemType Directory -Force -Path "$root\src\app\api\lfg\postings" | Out-Null
New-Item -ItemType Directory -Force -Path "$root\src\app\sign-in" | Out-Null
New-Item -ItemType Directory -Force -Path "$root\src\types" | Out-Null

Write-Host "Step 3: Writing all fixed source files..." -ForegroundColor Cyan

# ── middleware.ts ──────────────────────────────────────────
@'
export { default } from "next-auth/middleware";
export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/lfg/create/:path*", "/friends/:path*", "/admin/:path*"],
};
'@ | Set-Content "$root\middleware.ts" -Encoding UTF8

# ── src/lib/db.ts ──────────────────────────────────────────
@'
import { PrismaClient } from "@prisma/client";
const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const db =
  globalForPrisma.prisma ||
  new PrismaClient({ log: process.env.NODE_ENV === "development" ? ["query","error","warn"] : ["error"] });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
'@ | Set-Content "$root\src\lib\db.ts" -Encoding UTF8

# ── src/types/next-auth.d.ts ───────────────────────────────
@'
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      discordId?: string | null;
      discordTag?: string | null;
      embarkId?: string | null;
      embarkUsername?: string | null;
      bio?: string | null;
      platform?: string | null;
      timezone?: string | null;
    } & DefaultSession["user"];
  }
  interface User extends DefaultUser {
    discordId?: string | null;
    discordTag?: string | null;
    discordAvatar?: string | null;
    embarkId?: string | null;
    embarkUsername?: string | null;
  }
}
'@ | Set-Content "$root\src\types\next-auth.d.ts" -Encoding UTF8

# ── src/app/layout.tsx ─────────────────────────────────────
@'
"use client";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import Navigation from "@/components/Navigation";
import { Toaster } from "react-hot-toast";
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white min-h-screen">
        <SessionProvider>
          <Navigation />
          <main className="pt-16">{children}</main>
          <Toaster position="top-right" toastOptions={{ style: { background: "#1e293b", color: "#fff", border: "1px solid #334155" } }} />
        </SessionProvider>
      </body>
    </html>
  );
}
'@ | Set-Content "$root\src\app\layout.tsx" -Encoding UTF8

# ── src/app/page.tsx ───────────────────────────────────────
@'
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Sword, Users, Shield, Zap } from "lucide-react";
export default async function HomePage() {
  const session = await getServerSession();
  if (session) redirect("/dashboard");
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24">
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm">
          <Zap size={14} /> ARC Raiders Community Platform
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
          <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Find Your Squad.</span>
          <br /><span className="text-white">Raid Together.</span>
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mb-10">
          Connect your Discord account, link your Embark ID, join factions, and find the perfect group for your next ARC Raiders extraction run.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/api/auth/signin" className="px-8 py-4 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold text-lg transition">
            Login with Discord
          </Link>
          <Link href="/lfg" className="px-8 py-4 rounded-xl border border-slate-600 hover:border-cyan-500/50 text-slate-300 hover:text-white font-bold text-lg transition">
            Browse Groups
          </Link>
        </div>
      </section>
      <footer className="border-t border-slate-800 py-6 text-center text-slate-500 text-sm">
        ARC Raiders LFG — Community Platform · Not affiliated with Embark Studios
      </footer>
    </div>
  );
}
'@ | Set-Content "$root\src\app\page.tsx" -Encoding UTF8

# ── src/app/sign-in/page.tsx ───────────────────────────────
@'
import Link from "next/link";
export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md bg-slate-900 rounded-2xl border border-slate-700 p-8 text-center">
        <h1 className="text-2xl font-black text-white mb-2">Sign In</h1>
        <p className="text-slate-400 text-sm mb-8">Use your Discord account to sign in and link your Embark ID.</p>
        <Link href="/api/auth/signin/discord"
          className="flex items-center justify-center gap-3 w-full px-6 py-3 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold transition">
          Continue with Discord
        </Link>
        <p className="mt-6 text-xs text-slate-500">Your Discord ID is used to securely store your Embark ID.</p>
      </div>
    </div>
  );
}
'@ | Set-Content "$root\src\app\sign-in\page.tsx" -Encoding UTF8

# ── src/app/api/auth/[...nextauth]/route.ts ────────────────
@'
import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { db } from "@/lib/db";
const handler = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.id,
          name: profile.username,
          email: profile.email,
          image: profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : null,
          discordId: profile.id,
          discordTag: profile.username,
          discordAvatar: profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : null,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: { discordId:true, discordTag:true, embarkId:true, embarkUsername:true, platform:true, bio:true },
        });
        if (dbUser) Object.assign(session.user, dbUser);
      }
      return session;
    },
  },
  pages: { signIn: "/sign-in", error: "/sign-in" },
  session: { strategy: "database" },
});
export { handler as GET, handler as POST };
'@ | Set-Content "$root\src\app\api\auth\[...nextauth]\route.ts" -Encoding UTF8

# ── src/app/api/users/profile/route.ts ────────────────────
@'
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
export async function PATCH(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { embarkId, embarkUsername, bio, platform, timezone } = await req.json();
  if (embarkId) {
    const existing = await db.user.findUnique({ where: { embarkId } });
    if (existing && existing.id !== userId)
      return NextResponse.json({ error: "That Embark ID is already linked to another account" }, { status: 409 });
  }
  await db.user.update({ where: { id: userId }, data: { embarkId: embarkId||null, embarkUsername: embarkUsername||null, bio, platform, timezone } });
  return NextResponse.json({ ok: true });
}
export async function GET() {
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await db.user.findUnique({ where: { id: (session.user as any).id }, include: { gameProfile: true } });
  return NextResponse.json(user);
}
'@ | Set-Content "$root\src\app\api\users\profile\route.ts" -Encoding UTF8

# ── src/app/api/lfg/postings/route.ts ─────────────────────
@'
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { title, description, gameMode, skillLevel, playersNeeded, preferredMap, timezone, language, platform } = await req.json();
  if (!title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });
  const posting = await db.lFGPosting.create({
    data: {
      creatorId: (session.user as any).id,
      title: title.trim(), description: description?.trim()||null,
      gameMode: gameMode||"Extraction", skillLevel: skillLevel||"Any",
      playersNeeded: playersNeeded||2, preferredMap: preferredMap||"Any",
      timezone: timezone||"UTC", language: language||"English", platform: platform||"Crossplay",
      expiresAt: new Date(Date.now() + 24*60*60*1000),
    },
  });
  return NextResponse.json(posting, { status: 201 });
}
export async function GET() {
  const postings = await db.lFGPosting.findMany({
    where: { status: "active" },
    include: { creator: { select: { name:true, image:true, embarkUsername:true } }, participants: { where: { status:"joined" } } },
    orderBy: { createdAt: "desc" }, take: 50,
  });
  return NextResponse.json(postings);
}
'@ | Set-Content "$root\src\app\api\lfg\postings\route.ts" -Encoding UTF8

Write-Host "Step 4: Cleaning and reinstalling dependencies..." -ForegroundColor Cyan
Remove-Item "$root\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "$root\package-lock.json" -Force -ErrorAction SilentlyContinue
Remove-Item "$root\prisma\dev.db" -Force -ErrorAction SilentlyContinue
npm cache clean --force
npm install

Write-Host "Step 5: Generating Prisma client and pushing schema..." -ForegroundColor Cyan
npx prisma generate
npx prisma db push

Write-Host "Step 6: Testing build locally..." -ForegroundColor Cyan
npm run build

Write-Host ""
Write-Host "Step 7: Committing and pushing to GitHub..." -ForegroundColor Cyan
git add .
git commit -m "Fix: replace Clerk with NextAuth Discord OAuth, add factions/groups/trader rep"
git push origin main

Write-Host ""
Write-Host "Step 8: Deploying to Vercel..." -ForegroundColor Cyan
vercel --prod

Write-Host ""
Write-Host "DONE! Check your Vercel dashboard." -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT — Add these env vars in Vercel dashboard -> Settings -> Environment Variables:" -ForegroundColor Yellow
Write-Host "  DISCORD_CLIENT_ID       = (from Discord Dev Portal)" -ForegroundColor White
Write-Host "  DISCORD_CLIENT_SECRET   = (from Discord Dev Portal)" -ForegroundColor White
Write-Host "  NEXTAUTH_SECRET         = (run: openssl rand -base64 32)" -ForegroundColor White
Write-Host "  NEXTAUTH_URL            = https://your-app.vercel.app" -ForegroundColor White
Write-Host "  DATABASE_URL            = (your PlanetScale/Supabase connection string)" -ForegroundColor White
Write-Host ""
Write-Host "Also add this redirect in Discord Dev Portal -> OAuth2:" -ForegroundColor Yellow
Write-Host "  https://arc-raiders-fwvu56l5d-coresremotehelpers-projects.vercel.app/api/auth/callback/discord" -ForegroundColor White