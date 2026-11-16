/**
 * pages/api/admin/students.js — Get All Students (Warden/Admin only)
 * -------------------------------------------------------------------
 * GET /api/admin/students
 * Returns all users with role === 'student'.
 * Protected: only warden or masterAdmin can call this.
 */

import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import connect from '../../../lib/mongodb'
import User from '../../../model/schema'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method Not Allowed' })

  // Check session and role
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ message: 'Not authenticated' })
  if (!['warden', 'masterAdmin'].includes(session.user.role)) {
    return res.status(403).json({ message: 'Access denied' })
  }

  try {
    await connect()
    // Return students without passwords
    const students = await User.find({ role: 'student' })
      .select('-password -deviceTokens -otpCode')
      .sort({ name: 1 })
    return res.status(200).json(students)
  } catch (err) {
    return res.status(500).json({ message: 'Server error: ' + err.message })
  }
}
