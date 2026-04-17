import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { getUserByEmail, createUser } from '@/lib/db/queries'
import { isSupabaseConfigured } from '@/lib/db/client'
import { loginSchema } from '@/lib/security/validators'

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
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data

        if (!isSupabaseConfigured()) {
          if (email === 'demo@lifeos.app' && password === 'Demo1234') {
            return { id: 'demo', email: 'demo@lifeos.app', name: 'Demo User' }
          }
          return null
        }

        const user = await getUserByEmail(email)
        if (!user || !user.password_hash) return null

        const valid = await bcrypt.compare(password, user.password_hash)
        if (!valid) return null

        return { id: user.id, email: user.email, name: user.name, image: user.image }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
      }
      if (account?.provider === 'google' && user?.email && isSupabaseConfigured()) {
        const existing = await getUserByEmail(user.email)
        if (!existing) {
          try {
            const created = await createUser({
              email: user.email,
              name: user.name ?? '',
              password_hash: '',
            })
            token.id = created.id
          } catch {
            token.id = user.id
          }
        } else {
          token.id = existing.id
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
})
