/**
 * pages/api/admin/leave.js — Leave Requests (Warden/Admin)
 * GET  /api/admin/leave        — all leave requests
 * PATCH /api/admin/leave/[id]  — approve or reject
 */

import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import connect from '../../../lib/mongodb'
import Leave from '../../../model/leaveSchema'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ message: 'Not authenticated' })
  if (!['warden', 'masterAdmin'].includes(session.user.role)) {
    return res.status(403).json({ message: 'Access denied' })
  }

  await connect()

  if (req.method === 'GET') {
    const leaves = await Leave.find({})
      .populate('studentId', 'name rollNumber hostelName roomNumber')
      .sort({ createdAt: -1 })
    return res.status(200).json(leaves)
  }

  return res.status(405).json({ message: 'Method Not Allowed' })
}
