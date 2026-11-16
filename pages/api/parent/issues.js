/**
 * pages/api/parent/issues.js — Get Child's Issues (Parent only)
 * --------------------------------------------------------------
 * GET /api/parent/issues?childId=<id>
 * Returns all issues for the linked student.
 */

import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import connect from '../../../lib/mongodb'
import Issues from '../../../model/issueSchema'
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

    // Verify childId belongs to this parent's linked student
    const parent = await User.findById(session.user.id).select('linkedStudentId')
    if (!parent?.linkedStudentId) {
      return res.status(200).json([])
    }

    const issues = await Issues.find({ userId: parent.linkedStudentId })
      .sort({ createdAt: -1 })

    return res.status(200).json(issues)
  } catch (err) {
    return res.status(500).json({ message: 'Server error: ' + err.message })
  }
}
