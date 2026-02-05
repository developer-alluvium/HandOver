// server/src/models/ApiLog.js
import mongoose from 'mongoose';

const apiLogSchema = new mongoose.Schema({
  moduleName: {
    type: String,
    required: true,
    enum: ['VGM_SUBMISSION', 'VGM_STATUS', 'AUTHORIZATION']
  },
  request: {
    url: { type: String, required: true },
    method: { type: String, default: 'POST' },
    headers: { type: Object, default: {} },
    body: { type: Object, default: {} },
    timestamp: { type: Date, default: Date.now }
  },
  response: {
    statusCode: { type: Number },
    data: { type: Object, default: {} },
    headers: { type: Object, default: {} },
    timeTaken: { type: Number }, // in milliseconds
    timestamp: { type: Date }
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'pending', 'saved'],
    default: 'pending'
  },
  remarks: { type: String },
  retryCount: { type: Number, default: 0 },
  originalLogId: { type: mongoose.Schema.Types.ObjectId, ref: 'ApiLog' } // For edit/update tracking
}, {
  timestamps: true,
  collection: 'apilogs' // Explicitly set collection name
});

// Use singular model name and let Mongoose pluralize it
export default mongoose.model('ApiLog', apiLogSchema);