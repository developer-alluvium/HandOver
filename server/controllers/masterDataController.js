// server/controllers/masterDataController.js
import axios from "axios";
import config from "../config.js";
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

        // Calculate a timestamp for exactly 5 years ago in YYYY-MM-DD HH:mm:ss format
        const date = new Date();
        date.setFullYear(date.getFullYear() - 5);
        const pad = (num) => String(num).padStart(2, '0');
        const last5YearsTs = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;

        // Get ODeX authentication details from config
        const pyrCode = config.odex.pyrCode || config.odex.productionPyrCode || "ODeX/IN/SHP/2510/00001";
        const hashKey = config.odex.hashKey;

        if (!hashKey) {
            throw new Error("ODeX HASHKEY is not configured in config file");
        }

        const podRequest = {
            pyrCode,
            fromTs: last5YearsTs,
            hashKey
        };

        const url = `${config.odex.baseUrl}/RS/iForm13Service/json/getForm13PODInfo`;

        // Fetch port of loading / POD master codes from ODeX API
        const response = await axios.post(url, podRequest, {
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            timeout: 30000,
        });

        const odexResponse = response.data;
        let apiData = [];

        if (Array.isArray(odexResponse)) {
            apiData = odexResponse;
        } else if (odexResponse && Array.isArray(odexResponse.data)) {
            apiData = odexResponse.data;
        } else if (odexResponse && typeof odexResponse === 'object') {
            const arrayKey = Object.keys(odexResponse).find(key => Array.isArray(odexResponse[key]));
            if (arrayKey) {
                apiData = odexResponse[arrayKey];
            }
        }

        // Map response items by parsing the nested locations -> terminals -> services -> pods structure
        const mappedResults = [];
        const seenPodCds = new Set();

        for (const loc of apiData) {
            if (loc.terminal && Array.isArray(loc.terminal)) {
                for (const term of loc.terminal) {
                    if (term.service && Array.isArray(term.service)) {
                        for (const serv of term.service) {
                            if (serv.pod && Array.isArray(serv.pod)) {
                                for (const p of serv.pod) {
                                    const code = p.podCd;
                                    const name = p.podNm;
                                    if (code && !seenPodCds.has(code)) {
                                        seenPodCds.add(code);
                                        mappedResults.push({
                                            label: name || code,
                                            value: code,
                                            podCd: code,
                                            podNm: name,
                                            status: p.status || "Active"
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        let results = mappedResults;

        if (search) {
            const query = search.toLowerCase();
            results = mappedResults.filter(p => 
                p.label.toLowerCase().includes(query) || 
                p.value.toLowerCase().includes(query)
            );
        }

        results.sort((a, b) => a.label.localeCompare(b.label));

        res.json({
            success: true,
            data: results,
        });
    } catch (error) {
        console.error("Get POD Codes ODeX API call failed, using static fallback:", error.message);
        
        // Dynamic fallback to the offline master list from ./POD.js in case of API failure
        let results = POD_CODES;
        if (search) {
            const query = search.toLowerCase();
            results = POD_CODES.filter(p => 
                p.label.toLowerCase().includes(query) || 
                p.value.toLowerCase().includes(query)
            );
        }

        if (!search) {
            results = results.slice(0, 100);
        }

        results.sort((a, b) => a.label.localeCompare(b.label));

        res.json({
            success: true,
            data: results,
            fallback: true
        });
    }
};

