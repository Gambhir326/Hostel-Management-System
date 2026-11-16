/**
 * pages/api/admin/leave/[id].js — Approve or Reject Leave Request
 * -----------------------------------------------------------------
 * PATCH /api/admin/leave/[id]
 * Body: { status: 'approved' | 'rejected', remark: String }
 */

import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]'
import connect from '../../../../lib/mongodb'
import Leave from '../../../../model/leaveSchema'

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
    const { status, remark } = req.body

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value. Must be "approved" or "rejected".' })
    }

    const updated = await Leave.findByIdAndUpdate(
      id,
      {
        status,
        wardenId: session.user.id,
        wardenRemark: remark || '',
      },
      { new: true }
    )

    if (!updated) {
      return res.status(404).json({ message: 'Leave request not found' })
    }

    return res.status(200).json({ message: `Leave request ${status}`, leave: updated })
  } catch (err) {
    console.error('Update leave error:', err)
    return res.status(500).json({ message: 'Server error: ' + err.message })
  }
}
