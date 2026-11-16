/**
 * pages/api/parent/child.js — Get Linked Child Data (Parent only)
 * ----------------------------------------------------------------
 * GET /api/parent/child
 * Returns the student document linked to the authenticated parent.
 */

import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import connect from '../../../lib/mongodb'
import User from '../../../model/schema'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method Not Allowed' })

  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ message: 'Not authenticated' })
  if (session.user.role !== 'parent') {
    return res.status(403).json({ message: 'Parent accounts only' })
  }

  try {
    await connect()

    // Fetch the parent's own record to get linkedStudentId
    const parent = await User.findById(session.user.id).select('linkedStudentId')
    if (!parent?.linkedStudentId) {
      return res.status(200).json({ child: null })
    }

    // Fetch the child (student) record — no password
    const child = await User.findById(parent.linkedStudentId)
      .select('-password -deviceTokens -otpCode -loginAttempts')

    return res.status(200).json({ child })
  } catch (err) {
    return res.status(500).json({ message: 'Server error: ' + err.message })
  }
}
