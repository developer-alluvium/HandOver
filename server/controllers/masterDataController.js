// server/controllers/masterDataController.js
import ShippingLine from "../models/ShippingLine.js";

export const getShippingLines = async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};

        if (search) {
            query = {
                $or: [
                    { label: { $regex: search, $options: "i" } },
                    { value: { $regex: search, $options: "i" } },
                ],
            };
        }

        const shippingLines = await ShippingLine.find(query).sort({ label: 1 });
        res.json({
            success: true,
            data: shippingLines,
        });
    } catch (error) {
        console.error("Get Shipping Lines Error:", error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

export const createShippingLine = async (req, res) => {
    try {
        const { label, value } = req.body;
        const shippingLine = new ShippingLine({ label, value });
        await shippingLine.save();
        res.json({
            success: true,
            data: shippingLine,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

// For initial seeding if needed
export const seedShippingLines = async (req, res) => {
    try {
        const { shippingLines } = req.body;
        if (!Array.isArray(shippingLines)) {
            return res.status(400).json({ success: false, error: "Invalid data format" });
        }

        // Use upsert to avoid duplicates
        const operations = shippingLines.map(line => ({
            updateOne: {
                filter: { value: line.value },
                update: { label: line.label },
                upsert: true
            }
        }));

        await ShippingLine.bulkWrite(operations);

        res.json({ success: true, message: "Shipping lines seeded successfully" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}
