/**
 * pages/api/admin/issues.js — All Issues (Warden/Admin only)
 * -----------------------------------------------------------
 * GET  /api/admin/issues — list all issues with student name populated
 * Protected: warden or masterAdmin only.
 */

import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import connect from '../../../lib/mongodb'
import Issues from '../../../model/issueSchema'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method Not Allowed' })

  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ message: 'Not authenticated' })
  if (!['warden', 'masterAdmin'].includes(session.user.role)) {
    return res.status(403).json({ message: 'Access denied' })
  }

  try {
    await connect()
    const issues = await Issues.find({})
      .populate('userId', 'name email hostelName roomNumber')  // join student info
      .sort({ createdAt: -1 })
    return res.status(200).json(issues)
  } catch (err) {
    return res.status(500).json({ message: 'Server error: ' + err.message })
  }
}
