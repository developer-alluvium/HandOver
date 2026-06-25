// server/controllers/masterDataController.js
import axios from "axios";
import config from "../config.js";
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

export const getPODCodes = async (req, res) => {
    try {
        // Calculate a timestamp for exactly 15 years ago in YYYY-MM-DD HH:mm:ss format
        const date = new Date();
        date.setFullYear(date.getFullYear() - 15);
        const pad = (num) => String(num).padStart(2, '0');
        const last5YearsTs = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;

        // Get ODeX authentication details from config
        let response;

        if (config.odex.baseUrl && config.odex.hashKey) {
            try {
                const pyrCode = config.odex.pyrCode || config.odex.productionPyrCode || "ODeX/IN/SHP/2510/00001";
                const hashKey = config.odex.hashKey;
                const url = `${config.odex.baseUrl}/RS/iForm13Service/json/getForm13PODInfo`;
                const payload = {
                    pyrCode,
                    fromTs: last5YearsTs,
                    hashKey
                };

                response = await axios.post(url, payload, {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    timeout: 15000,
                });
            } catch (configErr) {
                console.warn("ODeX API call with config failed, trying proxy API fallback:", configErr.message);
            }
        }

        // Fetch from proxy API if config was missing or failed
        if (!response) {
            const proxyUrl = "https://in.odexglobal.com/RS/iForm13Service/json/getForm13PODInfo";
            const payload = {
                pyrCode: "ODeX/IN/SHP/2511/00001",
                fromTs: "2026-04-27 00:00:00",
                hashKey: "9HTKQ7LWMZRP"
            };

            response = await axios.post(proxyUrl, payload, {
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                timeout: 30000,
            });
        }

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

        // Keep nested structure, but filter for active status
        const filteredData = [];
        for (const loc of apiData) {
            const terminals = [];
            if (loc.terminal && Array.isArray(loc.terminal)) {
                for (const term of loc.terminal) {
                    const services = [];
                    if (term.service && Array.isArray(term.service)) {
                        for (const serv of term.service) {
                            if (serv.pod && Array.isArray(serv.pod)) {
                                const activePods = serv.pod.filter(p => 
                                    p.status && p.status.trim().toUpperCase() === "ACTIVE"
                                );
                                if (activePods.length > 0) {
                                    services.push({
                                        ...serv,
                                        pod: activePods
                                    });
                                }
                            }
                        }
                    }
                    if (services.length > 0) {
                        terminals.push({
                            ...term,
                            service: services
                        });
                    }
                }
            }
            if (terminals.length > 0) {
                filteredData.push({
                    ...loc,
                    terminal: terminals
                });
            }
        }

        res.json({
            success: true,
            data: filteredData,
        });
    } catch (error) {
        console.error("Get POD Codes ODeX API call failed:", error.message);
        res.status(500).json({
            success: false,
            error: `ODeX API call failed: ${error.message}`
        });
    }
};

