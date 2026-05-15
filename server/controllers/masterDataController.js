// server/controllers/masterDataController.js
import { SHIPPING_LINES } from "./shippingLine.js";
import { HAULIERS } from "./haulier.js";
import { CFS_CODES } from "./cfsCodes.js";
import { POD_CODES } from "./POD.js";

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

export const getPODCodes = async (req, res) => {
    try {
        const { search } = req.query;
        let results = POD_CODES;

        if (search) {
            const query = search.toLowerCase();
            results = POD_CODES.filter(p => 
                p.label.toLowerCase().includes(query) || 
                p.value.toLowerCase().includes(query)
            );
        }

        // Limit results for performance if no search is provided
        if (!search) {
            results = results.slice(0, 100);
        }

        results.sort((a, b) => a.label.localeCompare(b.label));

        res.json({
            success: true,
            data: results,
        });
    } catch (error) {
        console.error("Get POD Codes Error:", error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

