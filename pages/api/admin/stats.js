/**
 * pages/api/admin/stats.js — System Stats (MasterAdmin only)
 * -----------------------------------------------------------
 * GET /api/admin/stats
 * Returns counts of students, parents, wardens, open issues.
 */

import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import connect from '../../../lib/mongodb'
import User from '../../../model/schema'
import Issues from '../../../model/issueSchema'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method Not Allowed' })

  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ message: 'Not authenticated' })
  if (session.user.role !== 'masterAdmin') {
    return res.status(403).json({ message: 'Master Admin only' })
  }

  try {
    await connect()
    const [students, parents, wardens, openIssues] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'parent' }),
      User.countDocuments({ role: 'warden' }),
      Issues.countDocuments({ status: 'pending' }),
    ])
    return res.status(200).json({ students, parents, wardens, openIssues })
  } catch (err) {
    return res.status(500).json({ message: 'Server error: ' + err.message })
  }
}
