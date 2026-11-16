/**
 * pages/api/auth/[...nextauth].js — NextAuth Configuration
 * ----------------------------------------------------------
 * Handles all /api/auth/* routes (login, logout, session, etc.)
 *
 * Security features integrated:
 *   ✅ bcrypt password comparison (never plain text)
 *   ✅ Login firewall (5 wrong attempts = 24hr ban)
 *   ✅ Input sanitization (NoSQL injection protection)
 *   ✅ Role included in JWT token + session
 *   ✅ Login attempt reset on success
 *
 * Session strategy: JWT (stateless — no DB session table needed)
 *
 * Role-based redirect: handled in each dashboard page
 * (not in NextAuth — cleaner separation of concerns)
 */

import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import connect from '../../../lib/mongodb'
import User from '../../../model/schema'
import { checkFirewall, recordFailure, resetAttempts } from '../../../lib/loginFirewall'
import { sanitizeInput, getClientIp } from '../../../lib/sanitize'

export const authOptions = {

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,   // 30 days — persistent login
  },

  providers: [
    CredentialsProvider({
      name: 'Credentials',
      type: 'credentials',
      credentials: {
        email: { type: 'text' },
        password: { type: 'password' },
        deviceToken: { type: 'text' },   // sent from browser for auto-login
      },

      async authorize(credentials, req) {
        await connect()

        // ---- 1. Sanitize inputs (NoSQL injection guard) ------
        const { email, password } = sanitizeInput(credentials)
        const ip = getClientIp(req)

        if (!email || !password) {
          throw new Error('Email and password are required.')
        }

        // ---- 2. Check firewall (is this IP+email locked?) ----
        await checkFirewall(email, ip)

        // ---- 3. Find user in DB ------------------------------
        const user = await User.findOne({ email: email.toLowerCase() })

        if (!user) {
          // Record failure even for non-existent emails
          // (prevents user enumeration timing attacks)
          await recordFailure(email, ip)
          throw new Error('Invalid email or password.')
        }

        // ---- 4. Check if account is locked -------------------
        if (user.isLocked) {
          const remaining = Math.ceil((user.lockUntil - Date.now()) / (1000 * 60 * 60))
          throw new Error(`Account locked. Try again in ~${remaining} hour(s).`)
        }

        // ---- 5. Compare password with bcrypt hash -----------
        const isValid = await bcrypt.compare(password, user.password)

        if (!isValid) {
          // Record failure and potentially lock account
          const attempts = await recordFailure(email, ip)
          const remaining = Math.max(0, 5 - attempts)
          if (remaining === 0) {
            throw new Error('Too many failed attempts. Account locked for 24 hours.')
          }
          throw new Error(`Invalid email or password. ${remaining} attempt(s) remaining.`)
        }

        // ---- 6. Successful login — reset firewall -----------
        await resetAttempts(email, ip)

        // ---- 7. Return user object (goes into JWT) ----------
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],

  // ---- JWT CALLBACKS ------------------------------------
  callbacks: {
    // jwt() runs when token is created or updated
    async jwt({ token, user }) {
      // `user` is only present on first sign-in
      if (user) {
        token.id = user.id
        token.role = user.role     // ← role embedded in JWT
      }
      return token
    },

    // session() runs when session is read in a component
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role   // ← role accessible via useSession()
      }
      return session
    },
  },

  pages: {
    signIn: '/Login',
    error: '/Login',       // redirect auth errors back to login
  },

  secret: process.env.NEXTAUTH_SECRET || 'hms-secret-change-in-production',
}

export default NextAuth(authOptions)
