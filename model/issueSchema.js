/**
 * model/issueSchema.js — Issue (Complaint) MongoDB Schema
 * ---------------------------------------------------------
 * Defines the shape of an issue/complaint document in MongoDB.
 * Each issue belongs to a student (referenced by userId).
 *
 * Fields:
 *   - userId     : Reference to the User who submitted the issue
 *   - title      : Short title of the complaint
 *   - description: Full details of the complaint
 *   - priority   : 'low' | 'medium' | 'high'
 *   - status     : 'pending' | 'resolved' (default: 'pending')
 *   - date       : Auto-set to when the issue was created
 */

import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const issueSchema = new Schema({
    // Links this issue to the student who created it
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'low',
    },
    status: {
        type: String,
        enum: ['pending', 'resolved'],
        default: 'pending',
    },
    date: {
        type: Date,
        default: Date.now, // automatically set when issue is created
    }
})

// Prevent model re-registration during Next.js hot reload
module.exports = mongoose.models.Issues || mongoose.model('Issues', issueSchema)