/**
 * model/noticeSchema.js — Warden Notice / Announcement Schema
 * -------------------------------------------------------------
 * Wardens post notices that appear on Student and Parent dashboards.
 * Target can be a specific hostel name or 'all' for every hostel.
 *
 * Fields:
 *   title       : Short heading of the notice
 *   content     : Full body text
 *   hostelTarget: Hostel name this notice targets ('all' = every hostel)
 *   postedBy    : ObjectId of the Warden who posted it
 *   fileUrl     : Optional uploaded document URL (future feature)
 *   isPinned    : Pinned notices appear at the top
 */

import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const noticeSchema = new Schema({

  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120,
  },

  content: {
    type: String,
    required: true,
    trim: true,
  },

  // 'all' targets every hostel; otherwise a specific hostel name
  hostelTarget: {
    type: String,
    required: true,
    default: 'all',
  },

  // The warden who posted this notice
  postedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // Optional file attachment (PDF, image URL)
  fileUrl: {
    type: String,
    default: null,
  },

  // Pinned notices shown at top of the board
  isPinned: {
    type: Boolean,
    default: false,
  },

}, {
  timestamps: true,   // createdAt, updatedAt
})

export default mongoose.models.Notice ||
  mongoose.model('Notice', noticeSchema)
