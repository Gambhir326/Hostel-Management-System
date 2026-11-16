/**
 * pages/api/register.js — User Registration API
 * -----------------------------------------------
 * Handles account creation for all roles: student, parent.
 * (Warden accounts are created by masterAdmin via /api/admin/wardens)
 *
 * Security:
 *   ✅ Input sanitized (NoSQL injection protection)
 *   ✅ Password hashed with bcrypt before saving
 *   ✅ Duplicate email/rollNumber handled gracefully
 *   ✅ Parent linked to student via linkedStudentRollNumber
 *
 * Request body for student:
 *   { name, email, password, contact, hostelName, roomNumber, rollNumber, role:'student' }
 *
 * Request body for parent:
 *   { name, email, password, contact, linkedStudentRollNumber, role:'parent' }
 */

import bcrypt from 'bcryptjs'
import connect from '../../lib/mongodb'
import User from '../../model/schema'
import { sanitizeInput } from '../../lib/sanitize'

export default async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    await connect()
  } catch {
    return res.status(500).json({ message: 'Database connection failed' })
  }

  try {
    // ---- 1. Sanitize all inputs ---------------------------
    const body = sanitizeInput(req.body)
    const {
      name, email, password, contact,
      role = 'student',
      // Student-only fields
      rollNumber, hostelName, roomNumber,
      // Parent-only fields
      linkedStudentRollNumber,
    } = body

    // ---- 2. Basic validation ------------------------------
    if (!name || !email || !password || !contact) {
      return res.status(400).json({ message: 'Name, email, password, and contact are required.' })
    }

    // Students need hostel details
    if (role === 'student' && (!rollNumber || !hostelName || !roomNumber)) {
      return res.status(400).json({ message: 'Students must provide rollNumber, hostelName, and roomNumber.' })
    }

    // Parents need their child's roll number
    if (role === 'parent' && !linkedStudentRollNumber) {
      return res.status(400).json({ message: 'Parents must provide their child\'s registration number.' })
    }

    // Block self-registration as privileged roles
    if (role === 'warden' || role === 'masterAdmin') {
      return res.status(403).json({ message: 'This role cannot be self-registered.' })
    }

    // ---- 3. Check for existing email ---------------------
    const existingEmail = await User.findOne({ email: email.toLowerCase() })
    if (existingEmail) {
      return res.status(409).json({ message: 'An account with this email already exists.' })
    }

    // ---- 4. Check for existing roll number (students only)
    if (role === 'student' && rollNumber) {
      const existingRoll = await User.findOne({ rollNumber: Number(rollNumber) })
      if (existingRoll) {
        return res.status(409).json({ message: 'This roll number is already registered.' })
      }
    }

    // ---- 5. For parents: resolve linkedStudentId ----------
    let linkedStudentId = null
    if (role === 'parent' && linkedStudentRollNumber) {
      const student = await User.findOne({
        rollNumber: Number(linkedStudentRollNumber),
        role: 'student',
      })
      if (!student) {
        return res.status(404).json({
          message: `No student found with registration number ${linkedStudentRollNumber}. Please check and try again.`
        })
      }
      linkedStudentId = student._id
    }

    // ---- 6. Hash the password with bcrypt ----------------
    // Salt rounds = 12 — higher = more secure but slower
    const hashedPassword = await bcrypt.hash(password, 12)

    // ---- 7. Create the user document ---------------------
    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      contact: contact.toString().trim(),
      role,
      // Student fields
      ...(role === 'student' && {
        rollNumber: Number(rollNumber),
        hostelName: hostelName.trim(),
        roomNumber: roomNumber.trim(),
      }),
      // Parent fields
      ...(role === 'parent' && {
        linkedStudentRollNumber: Number(linkedStudentRollNumber),
        linkedStudentId,
      }),
    })

    return res.status(201).json({
      message: 'Account created successfully!',
      userId: newUser._id,
      role: newUser.role,
    })

  } catch (error) {
    console.error('Register error:', error.message)

    // MongoDB duplicate key error — give a human-readable message
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0] || 'field'
      const messages = {
        email:      'An account with this email already exists.',
        rollNumber: 'This roll number is already registered to another student.',
      }
      return res.status(409).json({
        message: messages[field] || `This ${field} is already in use.`
      })
    }

    return res.status(500).json({ message: 'Server error: ' + error.message })
  }
}
