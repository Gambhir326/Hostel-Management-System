/**
 * pages/api/setup-admin.js — Master Admin Setup & Password Reset Endpoint
 * ------------------------------------------------------------------------
 * Guarantees that admin@hostel.com exists with the exact bcrypt hash
 * for password "Admin@1234", role: "masterAdmin", and unlocked status.
 */

import bcrypt from 'bcryptjs'
import connect from '../../lib/mongodb'
import User from '../../model/schema'

export default async function handler(req, res) {
  try {
    await connect()

    // 1. Hash the password "Admin@1234" with 12 salt rounds
    const hashedPassword = await bcrypt.hash('Admin@1234', 12)

    // 2. Upsert admin@hostel.com with the fresh bcrypt password
    const admin = await User.findOneAndUpdate(
      { email: 'admin@hostel.com' },
      {
        name: 'Master Admin',
        email: 'admin@hostel.com',
        password: hashedPassword,
        contact: '9999999999',
        role: 'masterAdmin',
        loginAttempts: 0,
        lockUntil: null,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    return res.status(200).json({
      status: 'success',
      message: '✅ Master Admin password has been set to Admin@1234!',
      credentials: {
        email: 'admin@hostel.com',
        password: 'Admin@1234',
        role: admin.role,
      },
      action: 'Refresh your Login tab and sign in now.'
    })

  } catch (error) {
    console.error('Setup admin error:', error)
    return res.status(500).json({
      status: 'error',
      message: 'Database error: ' + error.message
    })
  }
}
