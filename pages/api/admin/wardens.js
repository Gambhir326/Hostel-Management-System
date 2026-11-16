/**
 * pages/api/admin/wardens.js — Warden Management (MasterAdmin only)
 * ------------------------------------------------------------------
 * GET    /api/admin/wardens      — list all wardens
 * POST   /api/admin/wardens      — create a new warden account
 * DELETE /api/admin/wardens?id=… — delete/revoke warden account
 *
 * Only masterAdmin can call this endpoint.
 */

import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import connect from '../../../lib/mongodb'
import User from '../../../model/schema'
import bcrypt from 'bcryptjs'
import { sanitizeInput } from '../../../lib/sanitize'

export default async function handler(req, res) {

  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ message: 'Not authenticated' })
  if (session.user.role !== 'masterAdmin') {
    return res.status(403).json({ message: 'Only Master Admin can manage wardens' })
  }

  await connect()

  // ---- GET: List all wardens -------------------------
  if (req.method === 'GET') {
    const wardens = await User.find({ role: 'warden' })
      .select('-password -deviceTokens -otpCode')
      .sort({ name: 1 })
    return res.status(200).json(wardens)
  }

  // ---- POST: Create a new warden ---------------------
  if (req.method === 'POST') {
    const { name, email, password, contact, managedHostel } = sanitizeInput(req.body)

    if (!name || !email || !password || !contact) {
      return res.status(400).json({ message: 'name, email, password, and contact are required' })
    }

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) return res.status(409).json({ message: 'Email already in use' })

    const hashed = await bcrypt.hash(password, 12)
    const warden = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      contact: contact.toString(),
      role: 'warden',
      managedHostel,
    })

    return res.status(201).json({
      message: 'Warden created successfully',
      wardenId: warden._id,
    })
  }

  // ---- DELETE: Remove / Suspend a warden -------------
  if (req.method === 'DELETE') {
    const { id } = req.query || req.body
    if (!id) return res.status(400).json({ message: 'Missing warden id' })

    const deleted = await User.findOneAndDelete({ _id: id, role: 'warden' })
    if (!deleted) return res.status(404).json({ message: 'Warden not found or not a warden account' })

    return res.status(200).json({ message: 'Warden account deleted successfully' })
  }

  return res.status(405).json({ message: 'Method Not Allowed' })
}
