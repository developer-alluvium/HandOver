// server/models/ShippingLine.js
import mongoose from "mongoose";

const shippingLineSchema = new mongoose.Schema(
    {
        label: { type: String, required: true },
        lable: { type: String },
        value: { type: String, required: true, unique: true },
    },
    { timestamps: true }
);

export default mongoose.model("ShippingLineModel", shippingLineSchema);
