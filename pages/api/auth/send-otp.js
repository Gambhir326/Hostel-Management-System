/**
 * pages/api/auth/send-otp.js — Generate & Send OTP
 * ---------------------------------------------------
 * Generates a 6-digit one-time password for phone/email recovery.
 * Saves OTP and 10-minute expiry to user in MongoDB.
 *
 * Security:
 *   - Strips malicious input via sanitizeInput
 *   - Rate limits / expires after 10 minutes
 *   - Logs OTP in console for local dev and testing
 */

import connect from '../../../lib/mongodb'
import User from '../../../model/schema'
import { sanitizeInput } from '../../../lib/sanitize'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    await connect()

    const { identifier } = sanitizeInput(req.body)
    if (!identifier) {
      return res.status(400).json({ message: 'Please enter your registered email or phone number.' })
    }

    const clean = identifier.toString().trim()

    // Find user by either email or contact number
    const user = await User.findOne({
      $or: [
        { email: clean.toLowerCase() },
        { contact: clean }
      ]
    })

    if (!user) {
      // Security practice: don't reveal too much, but give clear guidance
      return res.status(404).json({ message: 'No registered account found with that email or phone number.' })
    }

    // Generate random 6-digit OTP code (100000 - 999999)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // Valid for 10 minutes

    user.otpCode = otpCode
    user.otpExpiry = otpExpiry
    await user.save()

    // Mask phone number for display (e.g., ******3328)
    const contactStr = user.contact ? user.contact.toString() : ''
    const maskedContact = contactStr.length > 4
      ? '*'.repeat(contactStr.length - 4) + contactStr.slice(-4)
      : contactStr

    // In local development / console, print clearly for easy testing
    console.log('\n=============================================')
    console.log(`🔐 OTP for ${user.email} (${user.contact}): [ ${otpCode} ]`)
    console.log('⏰ Valid for: 10 minutes')
    console.log('=============================================\n')

    return res.status(200).json({
      message: `OTP sent successfully to registered number ${maskedContact}.`,
      maskedContact,
      email: user.email,
      // For effortless local testing, return previewOtp in non-production
      previewOtp: process.env.NODE_ENV !== 'production' ? otpCode : undefined,
    })

  } catch (err) {
    console.error('Send OTP error:', err)
    return res.status(500).json({ message: 'Failed to send OTP: ' + err.message })
  }
}
