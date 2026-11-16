/**
 * model/leaveSchema.js — Student Leave Request Schema
 * -----------------------------------------------------
 * Students submit a leave request (going home).
 * Wardens see it in their dashboard and approve / reject.
 * Parents can see the leave status of their linked child.
 *
 * Status flow:
 *   pending → approved   (warden clicks Approve)
 *   pending → rejected   (warden clicks Reject)
 *
 * Fields:
 *   studentId    : ObjectId of the student requesting leave
 *   reason       : Why they want to go home
 *   destination  : Where they're going
 *   fromDate     : Leave start date
 *   toDate       : Leave end date (expected return)
 *   status       : 'pending' | 'approved' | 'rejected'
 *   wardenId     : ObjectId of the warden who acted on request
 *   wardenRemark : Optional note from warden (reason for rejection, etc.)
 */

import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const leaveSchema = new Schema({

  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  reason: {
    type: String,
    required: true,
    trim: true,
  },

  destination: {
    type: String,
    required: true,
    trim: true,
  },

  fromDate: {
    type: Date,
    required: true,
  },

  toDate: {
    type: Date,
    required: true,
  },

  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },

  // Set when warden acts on the request
  wardenId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },

  wardenRemark: {
    type: String,
    default: '',
  },

}, {
  timestamps: true,
})

export default mongoose.models.Leave ||
  mongoose.model('Leave', leaveSchema)
