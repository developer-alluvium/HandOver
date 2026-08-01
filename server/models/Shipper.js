import mongoose from "mongoose";

const shipperSchema = new mongoose.Schema(
  {
    SHIPPER_CD: { type: String, required: true, index: true },
    SHIPPER_NM: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

shipperSchema.index({ SHIPPER_CD: 1, SHIPPER_NM: 1 });

export default mongoose.model("Shipper", shipperSchema);
