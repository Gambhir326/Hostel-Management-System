/**
 * model/schema.js — Main User Schema (All 4 Roles)
 * --------------------------------------------------
 * Role Hierarchy:
 *   masterAdmin > warden > student / parent
 *
 * Security fields:
 *   - password      : bcrypt hashed string (never plain text)
 *   - loginAttempts : counts failed login tries (max 5 → locked)
 *   - lockUntil     : timestamp when the lockout expires (24 hours)
 *   - deviceTokens  : array of trusted device fingerprint tokens
 *   - isPhoneVerified : OTP verification flag for phone number
 *
 * Parent-specific fields:
 *   - linkedStudentRollNumber : entered during signup
 *   - linkedStudentId         : resolved from rollNumber after signup
 */

import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const userSchema = new Schema({

  // ---- IDENTITY ----------------------------------------
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  contact: {
    type: String,       // stored as string to preserve leading zeros
    required: true,
  },
  password: {
    type: String,
    required: true,     // always stored as bcrypt hash — NEVER plain text
  },

  // ---- ROLE --------------------------------------------
  // masterAdmin : root authority — created manually in DB
  // warden      : created by masterAdmin from MasterDashboard
  // student     : self-registered via /Signup
  // parent      : self-registered via /Signup (links to student)
  role: {
    type: String,
    enum: ['masterAdmin', 'warden', 'student', 'parent'],
    default: 'student',
  },

  // ---- STUDENT-SPECIFIC --------------------------------
  rollNumber: {
    type: Number,
    unique: true,
    sparse: true,       // allows null for non-student roles
  },
  hostelName: {
    type: String,
    trim: true,
  },
  roomNumber: {
    type: String,
    trim: true,
  },

  // ---- WARDEN-SPECIFIC ---------------------------------
  // Which hostel this warden manages
  managedHostel: {
    type: String,
    trim: true,
  },

  // ---- PARENT-SPECIFIC ---------------------------------
  // Parent enters child's roll number at signup; linkedStudentId is auto-resolved
  linkedStudentRollNumber: {
    type: Number,
    sparse: true,
  },
  linkedStudentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    sparse: true,
  },

  // ---- SECURITY: LOGIN FIREWALL ------------------------
  // After 5 wrong password attempts → lockUntil = now + 24hrs
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: {
    type: Date,
    default: null,      // null means no active lockout
  },

  // ---- SECURITY: DEVICE TOKENS -------------------------
  // Each trusted device gets a UUID token stored here.
  // On re-visit, token is compared — if match, skip password.
  // On logout, token is removed → password required again.
  deviceTokens: {
    type: [String],
    default: [],
  },

  // ---- SECURITY: PHONE OTP VERIFICATION ----------------
  isPhoneVerified: {
    type: Boolean,
    default: false,
  },
  otpCode: {
    type: String,
    default: null,      // temporary OTP (cleared after verification)
  },
  otpExpiry: {
    type: Date,
    default: null,
  },

}, {
  timestamps: true,     // adds createdAt and updatedAt automatically
})

// ---- HELPER: Is account currently locked? --------------
// Returns true if lockUntil is set and in the future
userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now())
})

export default mongoose.models.User || mongoose.model('User', userSchema)
