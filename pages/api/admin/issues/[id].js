/**
 * pages/api/admin/issues/[id].js — Update a Single Issue (Warden/Admin)
 * -----------------------------------------------------------------------
 * PATCH /api/admin/issues/[id]
 * Body: { status: 'resolved' | 'pending' }
 */

import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]'
import connect from '../../../../lib/mongodb'
import Issues from '../../../../model/issueSchema'

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ message: 'Not authenticated' })
  if (!['warden', 'masterAdmin'].includes(session.user.role)) {
    return res.status(403).json({ message: 'Access denied' })
  }

  try {
    await connect()
    const { id } = req.query
    const { status } = req.body

    if (!['pending', 'resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value. Must be "pending" or "resolved".' })
    }

    const updated = await Issues.findByIdAndUpdate(id, { status }, { new: true })
    if (!updated) {
      return res.status(404).json({ message: 'Issue not found' })
    }

    return res.status(200).json({ message: 'Issue status updated', issue: updated })
  } catch (err) {
    console.error('Update issue error:', err)
    return res.status(500).json({ message: 'Server error: ' + err.message })
  }
}
