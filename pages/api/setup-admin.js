/**
 * pages/api/setup-admin.js — One-Time Root Admin Setup Endpoint
 * ----------------------------------------------------------------
 * Automatically bootstraps the root Master Admin account into MongoDB Atlas.
 * Safe: If a masterAdmin already exists, it refuses to overwrite.
 *
 * Usage:
 *   Visit /api/setup-admin in your browser.
 */

import bcrypt from 'bcryptjs'
import connect from '../../lib/mongodb'
import User from '../../model/schema'

export default async function handler(req, res) {
  try {
    await connect()

    // 1. Check if a masterAdmin already exists in the database
    const existingAdmin = await User.findOne({ role: 'masterAdmin' })
    if (existingAdmin) {
      return res.status(200).json({
        status: 'already_exists',
        message: 'Master Admin account is already created!',
        email: existingAdmin.email,
        role: existingAdmin.role,
        note: 'You can log in directly at /Login'
      })
    }

    // 2. Hash the root password using bcrypt
    const hashedPassword = await bcrypt.hash('Admin@1234', 12)

    // 3. Create or update admin@hostel.com with role: masterAdmin
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
      { upsert: true, new: true }
    )

    return res.status(201).json({
      status: 'created',
      message: '✅ Master Admin created successfully in MongoDB Atlas!',
      credentials: {
        email: admin.email,
        password: 'Admin@1234',
        role: admin.role,
      },
      nextStep: 'Go to /Login and sign in with these credentials.'
    })

  } catch (error) {
    console.error('Setup admin error:', error)
    return res.status(500).json({
      status: 'error',
      message: 'Database connection error: ' + error.message
    })
  }
}
