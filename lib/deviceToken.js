/**
 * lib/deviceToken.js — Trusted Device Token Utilities
 * -----------------------------------------------------
 * Manages per-device persistent login tokens.
 *
 * Flow:
 *   1. On first successful login from a device:
 *      - generateDeviceToken() creates a random UUID token
 *      - Token is saved to user.deviceTokens[] in MongoDB
 *      - Token is stored in browser localStorage as 'hms-device-token'
 *
 *   2. On subsequent visits (before showing login form):
 *      - Browser sends stored token
 *      - validateDeviceToken() checks it against user.deviceTokens[]
 *      - If valid → auto-login (password not required)
 *      - If invalid → show login form
 *
 *   3. On logout:
 *      - revokeDeviceToken() removes token from user.deviceTokens[]
 *      - localStorage token is cleared
 *      - Next visit will require password again
 *
 * Security notes:
 *   - Tokens are random 128-bit UUIDs (crypto.randomUUID)
 *   - Each device has its own token (revoke one without affecting others)
 *   - Max 5 device tokens per user (oldest removed if exceeded)
 */

import crypto from 'crypto'

const MAX_TOKENS_PER_USER = 5

/**
 * Generates a new cryptographically random device token.
 * @returns {string} UUID-format token
 */
export function generateDeviceToken() {
  return crypto.randomUUID()
}

/**
 * Adds a device token to the user's deviceTokens array.
 * Removes oldest token if limit is exceeded.
 * @param {object} user - Mongoose User document
 * @param {string} token - Generated device token
 */
export async function registerDeviceToken(user, token) {
  if (!user.deviceTokens) user.deviceTokens = []

  // Remove oldest token if at max capacity
  if (user.deviceTokens.length >= MAX_TOKENS_PER_USER) {
    user.deviceTokens.shift()   // remove oldest (front of array)
  }

  user.deviceTokens.push(token)
  await user.save()
}

/**
 * Validates whether a given token belongs to the user.
 * @param {object} user - Mongoose User document
 * @param {string} token - Token from browser localStorage
 * @returns {boolean}
 */
export function validateDeviceToken(user, token) {
  if (!token || !user?.deviceTokens) return false
  return user.deviceTokens.includes(token)
}

/**
 * Removes a specific device token (called on logout).
 * @param {object} user - Mongoose User document
 * @param {string} token - Token to revoke
 */
export async function revokeDeviceToken(user, token) {
  if (!user.deviceTokens) return
  user.deviceTokens = user.deviceTokens.filter(t => t !== token)
  await user.save()
}
