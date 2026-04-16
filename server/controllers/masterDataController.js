// server/controllers/masterDataController.js
import { SHIPPING_LINES } from "./shippingLine.js";
import { HAULIERS } from "./haulier.js";
import { CFS_CODES } from "./cfsCodes.js";

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

export const getHauliers = async (req, res) => {
    try {
        const { search } = req.query;
        let results = HAULIERS;

        if (search) {
            const query = search.toLowerCase();
            results = HAULIERS.filter(h => 
                h.label.toLowerCase().includes(query) || 
                h.value.toLowerCase().includes(query)
            );
        }

        results.sort((a, b) => a.label.localeCompare(b.label));

        res.json({
            success: true,
            data: results,
        });
    } catch (error) {
        console.error("Get Hauliers Error:", error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

export const getCFSCodes = async (req, res) => {
    try {
        const { search } = req.query;
        let results = CFS_CODES;

        if (search) {
            const query = search.toLowerCase();
            results = CFS_CODES.filter(c => 
                c.label.toLowerCase().includes(query) || 
                c.value.toLowerCase().includes(query)
            );
        }

        results.sort((a, b) => a.label.localeCompare(b.label));

        res.json({
            success: true,
            data: results,
        });
    } catch (error) {
        console.error("Get CFS Codes Error:", error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

