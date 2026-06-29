import mongoose from "mongoose";

const fpodSchema = new mongoose.Schema(
  {
    PORT_CODE: { type: String, index: true },
    PORT_NAME: { type: String, index: true },
  },
  { timestamps: true }
);

export default mongoose.model("Fpod", fpodSchema);
