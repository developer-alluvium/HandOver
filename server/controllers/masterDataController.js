// server/controllers/masterDataController.js
import ShippingLineModel from "../models/ShippingLineModel.js";

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

        const shippingLines = await ShippingLineModel.find(query).sort({ label: 1 });
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

