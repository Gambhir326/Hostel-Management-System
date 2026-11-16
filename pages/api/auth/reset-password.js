/**
 * pages/api/auth/reset-password.js — Verify OTP & Reset Password
 * ----------------------------------------------------------------
 * Validates the 6-digit OTP code against MongoDB.
 * If valid and not expired:
 *   - Hashes new password with bcrypt (12 salt rounds)
 *   - Clears OTP code & expiry
 *   - Unlocks account (clears loginAttempts & lockUntil)
 */

import bcrypt from 'bcryptjs'
import connect from '../../../lib/mongodb'
import User from '../../../model/schema'
import { sanitizeInput } from '../../../lib/sanitize'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    await connect()

    const { identifier, otp, newPassword } = sanitizeInput(req.body)

    if (!identifier || !otp || !newPassword) {
      return res.status(400).json({ message: 'Identifier, OTP code, and new password are required.' })
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters long.' })
    }

    const cleanIdentifier = identifier.toString().trim()
    const cleanOtp = otp.toString().trim()

    // Find user
    const user = await User.findOne({
      $or: [
        { email: cleanIdentifier.toLowerCase() },
        { contact: cleanIdentifier }
      ]
    })

    if (!user) {
      return res.status(404).json({ message: 'User account not found.' })
    }

    // Check if OTP matches
    if (!user.otpCode || user.otpCode !== cleanOtp) {
      return res.status(400).json({ message: 'Invalid OTP code. Please check and try again.' })
    }

    // Check if OTP has expired
    if (!user.otpExpiry || new Date() > new Date(user.otpExpiry)) {
      return res.status(400).json({ message: 'OTP code has expired. Please request a new one.' })
    }

    // Hash the new password with bcrypt
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update user: set new password, clear OTP and unlock account
    user.password = hashedPassword
    user.otpCode = null
    user.otpExpiry = null
    user.loginAttempts = 0
    user.lockUntil = null
    user.isPhoneVerified = true // Verified phone number via OTP!
    await user.save()

    return res.status(200).json({
      message: 'Password reset successfully! You can now log in with your new password.'
    })

  } catch (err) {
    console.error('Reset password error:', err)
    return res.status(500).json({ message: 'Server error: ' + err.message })
  }
}
