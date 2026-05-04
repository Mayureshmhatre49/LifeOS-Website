import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { getUserByEmail, createUser } from '@/lib/db/queries'
import { isSupabaseConfigured } from '@/lib/db/client'
import { loginSchema } from '@/lib/security/validators'
import { checkLockout, recordFailure, clearLockout } from '@/lib/security/account-lockout'
import { writeAuditLog, recordLoginAttempt, writeSecurityEvent } from '@/lib/security/audit-log'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data

        // Safe header extraction — Headers.get() may not exist in all runtimes
        let ip = 'unknown'
        let ua = ''
        try {
          const h = (req as unknown as Request)?.headers
          if (h && typeof h.get === 'function') {
            ip = h.get('x-forwarded-for') ?? h.get('x-real-ip') ?? 'unknown'
            ua = h.get('user-agent') ?? ''
          }
        } catch { /* ignore */ }

        // ── Account lockout check ──────────────────────────────────────────────
        const lockout = checkLockout(email)
        if (lockout.locked) {
          const mins = Math.ceil(lockout.remainingMs / 60000)
          recordLoginAttempt({ email, ip_address: ip, success: false, failure_reason: 'account_locked', user_agent: ua })
          writeSecurityEvent({
            type: 'brute_force',
            severity: 'warning',
            details: { email, lockoutRemainingMs: lockout.remainingMs },
            ip_address: ip,
          })
          // Return error via Error object so NextAuth surfaces it to the UI
          throw new Error(`Account locked. Try again in ${mins} minute${mins !== 1 ? 's' : ''}.`)
        }

        // ── Demo account (only when DEMO_MODE=true in env) ───────────────────
        if (process.env.DEMO_MODE === 'true' &&
            email === 'demo@lifeos.app' && password === 'Demo1234!') {
          clearLockout(email)
          return { id: 'demo', email: 'demo@lifeos.app', name: 'Demo User', email_verified: true }
        }

        // ── No database — reject non-demo logins ──────────────────────────────
        if (!isSupabaseConfigured()) {
          recordFailure(email)
          return null
        }

        // ── Real auth ──────────────────────────────────────────────────────────
        const user = await getUserByEmail(email)

        if (!user || !user.password_hash) {
          const status = recordFailure(email)
          recordLoginAttempt({ email, ip_address: ip, success: false, failure_reason: 'user_not_found', user_agent: ua })
          if (status.locked) {
            writeAuditLog({ action: 'user.account_locked', ip_address: ip, metadata: { email }, severity: 'warning' })
          }
          return null
        }

        const valid = await bcrypt.compare(password, user.password_hash)

        if (!valid) {
          const status = recordFailure(email)
          recordLoginAttempt({ email, ip_address: ip, success: false, failure_reason: 'wrong_password', user_agent: ua })
          if (status.locked) {
            writeAuditLog({
              action: 'user.account_locked',
              user_id: user.id,
              ip_address: ip,
              metadata: { email, reason: 'max_failures_reached' },
              severity: 'warning',
            })
            writeSecurityEvent({
              type: 'brute_force',
              severity: 'warning',
              details: { email, userId: user.id },
              ip_address: ip,
              user_id: user.id,
            })
          }
          return null
        }

        // ── Success ────────────────────────────────────────────────────────────
        clearLockout(email)
        recordLoginAttempt({ email, ip_address: ip, success: true, user_agent: ua })
        writeAuditLog({
          action: 'user.login',
          user_id: user.id,
          ip_address: ip,
          metadata: { provider: 'credentials' },
        })

        return { id: user.id, email: user.email, name: user.name, image: user.image, email_verified: user.email_verified ?? false }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.email_verified = user.email_verified ?? false
      }
      if (account?.provider === 'google' && user?.email && isSupabaseConfigured()) {
        token.email_verified = true // Google already verified the email
        const existing = await getUserByEmail(user.email)
        if (!existing) {
          try {
            const created = await createUser({
              email: user.email,
              name: user.name ?? '',
              password_hash: '',
            })
            token.id = created.id
            writeAuditLog({ action: 'user.signup', user_id: created.id, metadata: { provider: 'google' } })
          } catch {
            token.id = user.id
          }
        } else {
          token.id = existing.id
          writeAuditLog({ action: 'user.login', user_id: existing.id, metadata: { provider: 'google' } })
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
        session.user.email_verified = (token.email_verified as boolean) ?? false
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60,   // refresh session every 24h
  },
  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies: process.env.NODE_ENV === 'production',
})
