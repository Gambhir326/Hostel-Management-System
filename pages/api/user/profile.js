/**
 * pages/api/user/profile.js — Authenticated User Profile API
 * -----------------------------------------------------------
 * Fetches the logged-in user's profile from MongoDB based on
 * the active NextAuth session or verified email.
 *
 * Never returns sensitive fields like password or OTP tokens.
 */

import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import connect from '../../../lib/mongodb'
import User from '../../../model/schema'

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    await connect()

    // 1. Check active NextAuth session
    const session = await getServerSession(req, res, authOptions)
    const email = session?.user?.email || req.body?.email || req.query?.email

    if (!email) {
      return res.status(401).json({ message: 'Not authenticated or missing email' })
    }

    // 2. Fetch user without sensitive security fields
    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('-password -deviceTokens -otpCode -otpExpiry -loginAttempts')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    return res.status(200).json({ user: user.toObject() })

  } catch (error) {
    console.error('Profile fetch error:', error.message)
    return res.status(500).json({ message: 'Server error: ' + error.message })
  }
}
