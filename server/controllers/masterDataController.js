// server/controllers/masterDataController.js
import { SHIPPING_LINES } from "./shippingLine.js";

export const getShippingLines = async (req, res) => {
    try {
        const { search } = req.query;
        let results = SHIPPING_LINES;

        if (search) {
            const query = search.toLowerCase();
            results = SHIPPING_LINES.filter(line => 
                line.label.toLowerCase().includes(query) || 
                line.value.toLowerCase().includes(query)
            );
        }

        // Limit results if too many (since it's a huge list, maybe 100 is enough for a dropdown)
        // But the user didn't specify limit, so I'll return all found for now.
        // Or actually, sort them.
        results.sort((a, b) => a.label.localeCompare(b.label));

        res.json({
            success: true,
            data: results,
        });
    } catch (error) {
        console.error("Get Shipping Lines Error:", error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

