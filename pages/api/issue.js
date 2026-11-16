/**
 * pages/api/issue.js — Issues API Route
 * ----------------------------------------
 * Handles GET (fetch issues) and POST (create issue) for the issues collection.
 *
 * GET  /api/issue?userId=<id>  → returns all issues for that student
 * POST /api/issue              → creates a new issue for a student
 *   Body: { userId, title, description, priority }
 */

import connect from '../../lib/mongodb'
import Issues from '../../model/issueSchema'

export default async function handler(req, res) {

    // Connect to MongoDB first
    try {
        await connect()
    } catch (err) {
        return res.status(500).json({ message: 'DB connection failed' })
    }

    // ---- GET: Fetch all issues for a specific student --------
    if (req.method === 'GET') {
        try {
            const { userId } = req.query

            if (!userId) {
                return res.status(400).json({ message: 'userId query param is required' })
            }

            // Find all issues where userId matches, sorted newest first
            const issues = await Issues.find({ userId }).sort({ date: -1 })
            return res.status(200).json(issues)

        } catch (error) {
            console.error('GET /api/issue error:', error.message)
            return res.status(500).json({ message: 'Server error: ' + error.message })
        }
    }

    // ---- POST: Create a new issue ----------------------------
    if (req.method === 'POST') {
        try {
            const { userId, title, description, priority } = req.body

            // Validate required fields
            if (!userId || !title || !description) {
                return res.status(400).json({ message: 'userId, title, and description are required' })
            }

            // Create the new issue document in MongoDB
            const issue = await Issues.create({
                userId,
                title,
                description,
                priority: priority || 'low',
                status: 'pending',
            })

            return res.status(201).json({ message: 'Issue created successfully', issue })

        } catch (error) {
            console.error('POST /api/issue error:', error.message)
            return res.status(500).json({ message: 'Server error: ' + error.message })
        }
    }

    // ---- Any other method ------------------------------------
    return res.status(405).json({ message: 'Method Not Allowed' })
}
