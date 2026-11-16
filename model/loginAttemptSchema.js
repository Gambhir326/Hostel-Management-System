/**
 * model/loginAttemptSchema.js — Login Firewall Tracker
 * ------------------------------------------------------
 * Tracks failed login attempts per email+IP address.
 * When attempts >= 5, lockUntil is set to now + 24 hours.
 *
 * This is separate from the User schema so it also protects
 * against attempts on non-existent emails (brute force).
 *
 * Usage: checked in pages/api/auth/[...nextauth].js and
 *        pages/api/login.js before password comparison.
 */

import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const loginAttemptSchema = new Schema({

  // The email being targeted
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },

  // IP address of the requester (from req.headers or req.socket)
  ip: {
    type: String,
    required: true,
  },

  // Number of failed attempts since last reset
  attempts: {
    type: Number,
    default: 1,
  },

  // When the lockout expires (null = not locked)
  lockUntil: {
    type: Date,
    default: null,
  },

  // Auto-delete this record after 48 hours (MongoDB TTL index)
  // So old records don't pile up
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 48,  // 48 hours in seconds
  },
})

// Compound index for fast lookup
loginAttemptSchema.index({ email: 1, ip: 1 })

export default mongoose.models.LoginAttempt ||
  mongoose.model('LoginAttempt', loginAttemptSchema)
