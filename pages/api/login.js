/**
 * pages/api/login.js — Fetch User by Email+Password API Route
 * -------------------------------------------------------------
 * Called by IssueDisplay.js to get the full user document from
 * MongoDB (name, hostelName, roomNumber, _id etc.) after login.
 *
 * Method: POST
 * Body:   { email, password }
 * Returns: { user: { _id, name, email, hostelName, roomNumber, ... } }
 */

import connect from '../../lib/mongodb'
import User from '../../model/schema'

export default async function handler(req, res) {

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' })
    }

    // Connect to MongoDB
    try {
        await connect()
    } catch (err) {
        return res.status(500).json({ message: 'DB connection failed' })
    }

    try {
        const { email, password } = req.body

        // Find user by email and password in MongoDB
        // ⚠️ Plain text password comparison — works for now
        const user = await User.findOne({ email, password })

        if (!user) {
            // User not found — credentials don't match any record
            return res.status(404).json({ message: 'User not found' })
        }

        // Return the user document as plain JSON
        // .toObject() converts the Mongoose document to a plain JS object
        return res.status(200).json({ user: user.toObject() })

    } catch (error) {
        console.error('Login API error:', error.message)
        return res.status(500).json({ message: 'Server error: ' + error.message })
    }
}