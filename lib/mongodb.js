/**
 * lib/mongodb.js — MongoDB Connection Utility
 * ---------------------------------------------
 * Manages a single cached Mongoose connection.
 * On first connection it also ensures the rollNumber index
 * has sparse:true so parent/warden accounts (which have no
 * rollNumber) can coexist without a unique-key conflict.
 */

import mongoose from 'mongoose'

const connection = {}

async function connect() {
  // Reuse existing connection if already open
  if (connection.isConnected) {
    return
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI)
    connection.isConnected = db.connections[0].readyState
    console.log('MongoDB: New connection established')

    // ---- FIX: Ensure rollNumber index has sparse:true ----------
    // The old schema created rollNumber_1 without sparse, which
    // means MongoDB rejects two documents both lacking rollNumber
    // (e.g. a parent + a warden).  We drop the old index and let
    // Mongoose recreate it correctly with { unique:1, sparse:1 }.
    try {
      const col = db.connection.collection('users')
      const indexes = await col.indexes()
      const rollIdx = indexes.find(i => i.key && i.key.rollNumber === 1)

      if (rollIdx && !rollIdx.sparse) {
        // Old non-sparse unique index found — drop it
        await col.dropIndex('rollNumber_1')
        console.log('MongoDB: Dropped old rollNumber index (was not sparse)')

        // Recreate with sparse so null/undefined values are excluded
        await col.createIndex(
          { rollNumber: 1 },
          { unique: true, sparse: true, name: 'rollNumber_1' }
        )
        console.log('MongoDB: Recreated rollNumber index with sparse:true')
      }
    } catch (idxErr) {
      // Non-fatal — log but don't crash the app
      console.warn('MongoDB: Index fix skipped —', idxErr.message)
    }

  } catch (error) {
    console.error('MongoDB connection error:', error.message)
    throw new Error('Could not connect to MongoDB: ' + error.message)
  }
}

export default connect
