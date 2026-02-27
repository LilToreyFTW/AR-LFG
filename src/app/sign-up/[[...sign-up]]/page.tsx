// src/app/sign-up/[[...sign-up]]/page.tsx
// Redirect sign-up to sign-in (Discord OAuth handles both)
import { redirect } from 'next/navigation'

export default function SignUpPage() {
  redirect('/sign-in')
}
