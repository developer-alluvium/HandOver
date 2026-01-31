// server/models/Form13.js
import mongoose from 'mongoose';

// Use a completely flexible schema that saves EXACTLY what is sent
const form13Schema = new mongoose.Schema(
  {
    // Store the entire payload as-is using Mixed type
    // This allows any structure without validation
  },
  {
    timestamps: true,
    strict: false,  // Allow any fields not in schema
    minimize: false // Don't remove empty objects
  }
);

// Add a pre-save middleware to ensure all data is preserved
form13Schema.pre('save', function (next) {
  // Mark all paths as modified to ensure they are saved
  this.markModified('cntrList');
  this.markModified('attList');
  this.markModified('containers');
  this.markModified('attachments');
  next();
});

export default mongoose.model("Form13", form13Schema);