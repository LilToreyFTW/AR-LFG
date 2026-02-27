// src/app/layout.tsx
import type { Metadata } from "next"
import { SessionProvider } from "next-auth/react"
import { Toaster } from "react-hot-toast"
import Navigation from "@/components/Navigation"
import "./globals.css"

export const metadata: Metadata = {
  title: "ARC Raiders LFG - Find Your Squad",
  description: "Looking for Group platform for ARC Raiders. Find teammates, create squads, and dominate together.",
  keywords: ["ARC Raiders", "LFG", "Looking For Group", "Gaming", "Multiplayer"],
  authors: [{ name: "ARC Raiders Community" }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-slate-950 text-slate-100">
        <SessionProvider>
          <Navigation />
          {children}
          <Toaster position="top-right" />
        </SessionProvider>
      </body>
    </html>
  )
}
