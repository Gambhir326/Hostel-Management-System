/**
 * lib/sanitize.js — Input Sanitization Utility
 * ----------------------------------------------
 * Protects MongoDB from NoSQL injection attacks.
 *
 * MongoDB injection works by passing objects like:
 *   { email: { "$gt": "" } }  → matches ALL records
 *
 * This utility:
 *   1. Strips keys starting with $ or containing . (operator injection)
 *   2. Trims all string values
 *   3. Recursively sanitizes nested objects
 *
 * Usage:
 *   import { sanitizeInput } from '../../lib/sanitize'
 *   const clean = sanitizeInput(req.body)
 */

/**
 * Recursively removes dangerous keys from an object.
 * @param {any} value - The value to sanitize
 * @returns {any} - Cleaned value
 */
export function sanitizeInput(value) {
  if (value === null || value === undefined) return value

  // Sanitize arrays
  if (Array.isArray(value)) {
    return value.map(sanitizeInput)
  }

  // Sanitize objects
  if (typeof value === 'object') {
    const clean = {}
    for (const key of Object.keys(value)) {
      // Block MongoDB operator keys: $gt, $ne, $where, etc.
      if (key.startsWith('$')) continue
      // Block dot notation which can be used to traverse nested docs
      if (key.includes('.')) continue
      clean[key] = sanitizeInput(value[key])
    }
    return clean
  }

  // Trim strings
  if (typeof value === 'string') {
    return value.trim()
  }

  return value
}

/**
 * Returns the client IP from a Next.js API request.
 * Checks x-forwarded-for header first (for proxies/Vercel),
 * then falls back to the direct socket IP.
 * @param {import('next').NextApiRequest} req
 * @returns {string}
 */
export function getClientIp(req) {
  if (!req) return '127.0.0.1'
  const forwarded = req.headers ? req.headers['x-forwarded-for'] : null
  if (forwarded) {
    return (typeof forwarded === 'string' ? forwarded.split(',')[0] : forwarded[0]).trim()
  }
  return req.socket?.remoteAddress || '127.0.0.1'
}
