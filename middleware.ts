// middleware.ts — NextAuth session middleware (no Clerk)
export { default } from 'next-auth/middleware'

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*', '/lfg/create/:path*', '/friends/:path*'],
}
