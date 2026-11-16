/**
 * lib/loginFirewall.js — Login Security Middleware
 * --------------------------------------------------
 * Shared utility used by the NextAuth authorize callback and
 * any direct login API route.
 *
 * Functions:
 *   checkFirewall(email, ip) → throws if locked, returns record
 *   recordFailure(email, ip) → increments attempt count, locks after 5
 *   resetAttempts(email, ip) → clears attempts on successful login
 *
 * Rules:
 *   - Max 5 wrong password attempts per email+IP
 *   - After 5 failures: locked for 24 hours
 *   - Lockout message shows time remaining
 *   - On correct password: attempt counter is reset
 */

import LoginAttempt from '../model/loginAttemptSchema'

const MAX_ATTEMPTS = 5
const LOCK_DURATION_MS = 24 * 60 * 60 * 1000  // 24 hours

/**
 * Check if this email+IP is currently locked out.
 * Call this BEFORE comparing passwords.
 * @throws {Error} with a human-readable lockout message
 */
export async function checkFirewall(email, ip) {
  if (!email) return null
  const cleanEmail = email.toLowerCase().trim()
  const cleanIp = ip || '127.0.0.1'
  const record = await LoginAttempt.findOne({ email: cleanEmail, ip: cleanIp })
  if (!record) return null

  if (record.lockUntil && record.lockUntil > new Date()) {
    // Still locked — calculate remaining time
    const remaining = record.lockUntil - Date.now()
    const hours = Math.floor(remaining / (1000 * 60 * 60))
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
    throw new Error(
      `Account locked due to too many failed attempts. ` +
      `Try again in ${hours}h ${minutes}m.`
    )
  }

  return record
}

/**
 * Record a failed login attempt for this email+IP.
 * Locks the account after MAX_ATTEMPTS failures.
 */
export async function recordFailure(email, ip) {
  if (!email) return 0
  const cleanEmail = email.toLowerCase().trim()
  const cleanIp = ip || '127.0.0.1'
  const existing = await LoginAttempt.findOne({ email: cleanEmail, ip: cleanIp })

  if (existing) {
    existing.attempts += 1
    if (existing.attempts >= MAX_ATTEMPTS) {
      existing.lockUntil = new Date(Date.now() + LOCK_DURATION_MS)
    }
    await existing.save()
    return existing.attempts
  } else {
    await LoginAttempt.create({ email: cleanEmail, ip: cleanIp, attempts: 1 })
    return 1
  }
}

/**
 * Reset login attempts after a successful login.
 * Also clears any active lockout.
 */
export async function resetAttempts(email, ip) {
  if (!email) return
  const cleanEmail = email.toLowerCase().trim()
  const cleanIp = ip || '127.0.0.1'
  await LoginAttempt.deleteMany({ email: cleanEmail, ip: cleanIp })
}
