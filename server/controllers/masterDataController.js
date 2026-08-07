// server/controllers/masterDataController.js
import axios from "axios";
import config from "../config.js";
import { SHIPPING_LINES } from "./shippingLine.js";
import { HAULIERS } from "./haulier.js";
import { CFS_CODES } from "./cfsCodes.js";
import Fpod from "../models/Fpod.js";
import Shipper from "../models/Shipper.js";



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

export const getFpodCodes = async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};
        let limit = 5;

        if (search && search.trim() !== "") {
            const searchRegex = new RegExp(search.trim(), "i");
            query = {
                $or: [
                    { PORT_CODE: searchRegex },
                    { PORT_NAME: searchRegex }
                ]
            };
            limit = 20; // Return up to 20 results when searching for better usability
        }

        const results = await Fpod.find(query, { _id: 0, PORT_CODE: 1, PORT_NAME: 1 })
            .limit(limit)
            .lean();

        res.json({
            success: true,
            data: results,
        });
    } catch (error) {
        console.error("Get Fpod Codes Error:", error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let shipperMasterCache = null;

export const loadShipperMaster = () => {
    if (shipperMasterCache) return shipperMasterCache;
    try {
        const csvPath = path.join(__dirname, "../Shipper Master.csv");
        if (!fs.existsSync(csvPath)) {
            console.warn("Shipper Master.csv not found at", csvPath);
            return [];
        }
        const fileContent = fs.readFileSync(csvPath, "utf-8");
        const lines = fileContent.split(/\r?\n/);
        const shippers = [];
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            const firstCommaIndex = line.indexOf(",");
            if (firstCommaIndex !== -1) {
                const shipperCd = line.substring(0, firstCommaIndex).replace(/^"|"$/g, "").trim();
                const shipperNm = line.substring(firstCommaIndex + 1).replace(/^"|"$/g, "").trim();
                if (shipperCd || shipperNm) {
                    shippers.push({ shipperCd, shipperNm });
                }
            }
        }
        shipperMasterCache = shippers;
        return shipperMasterCache;
    } catch (err) {
        console.error("Error loading Shipper Master CSV:", err);
        return [];
    }
};

export const getShippers = async (req, res) => {
    try {
        const { search, portCd, location, PORT_CD } = req.query;
        const targetPort = (portCd || location || PORT_CD || "").trim();
        let query = {};
        let limit = 50;

        const conditions = [];

        if (search && search.trim() !== "") {
            const searchRegex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
            conditions.push({
                $or: [
                    { SHIPPER_NM: searchRegex },
                    { shipperNm: searchRegex },
                    { SHIPPER_CD: searchRegex },
                    { shipperCd: searchRegex }
                ]
            });
        }

        if (targetPort) {
            const portRegex = new RegExp(`^${targetPort.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
            conditions.push({
                $or: [
                    { PORT_CD: portRegex },
                    { portCd: portRegex }
                ]
            });
        }

        if (conditions.length === 1) {
            query = conditions[0];
        } else if (conditions.length > 1) {
            query = { $and: conditions };
        }

        // Fetch from MongoDB
        let dbResults = await Shipper.find(query).limit(limit).lean();

        // Fallback: If location filter was provided but returned 0 results, retry without location filter
        if ((!dbResults || dbResults.length === 0) && targetPort) {
            let fallbackQuery = {};
            if (search && search.trim() !== "") {
                const searchRegex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
                fallbackQuery = {
                    $or: [
                        { SHIPPER_NM: searchRegex },
                        { shipperNm: searchRegex },
                        { SHIPPER_CD: searchRegex },
                        { shipperCd: searchRegex }
                    ]
                };
            }
            dbResults = await Shipper.find(fallbackQuery).limit(limit).lean();
        }

        if (dbResults && dbResults.length > 0) {
            const normalized = dbResults.map(s => ({
                shipperCd: s.SHIPPER_CD || s.shipperCd || "",
                shipperNm: s.SHIPPER_NM || s.shipperNm || "",
                portCd: s.PORT_CD || s.portCd || ""
            }));
            return res.json({
                success: true,
                data: normalized,
            });
        }

        // Fallback to local CSV if MongoDB Shipper collection is empty or has no match
        const shippers = loadShipperMaster();
        let results = shippers;

        if (search && search.trim() !== "") {
            const q = search.trim().toLowerCase();
            results = shippers.filter(s =>
                s.shipperNm.toLowerCase().includes(q) ||
                s.shipperCd.toLowerCase().includes(q)
            );
        }

        res.json({
            success: true,
            data: results.slice(0, 50),
        });
    } catch (error) {
        console.error("Get Shippers Error:", error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

export const validateShipperDetails = async (shipperNm, shipperCd, portCd = "") => {
    const normNm = (shipperNm || "").trim();
    const normCd = (shipperCd || "").trim();
    const normPort = (portCd || "").trim();

    if (!normNm) {
        return { isValid: false, message: "Shipper Name is mandatory and should always be provided." };
    }

    const nmRegex = new RegExp(`^${normNm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");

    // Check if MongoDB collection has data
    const dbCount = await Shipper.countDocuments().catch(() => 0);

    if (dbCount > 0) {
        const portCondition = normPort ? { $or: [{ PORT_CD: new RegExp(`^${normPort.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") }, { portCd: new RegExp(`^${normPort.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") }] } : null;

        // 1. If shipperCd is provided and not empty/OTHR, match by code first
        if (normCd && normCd.toUpperCase() !== "OTHR") {
            const cdRegex = new RegExp(`^${normCd.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
            const codeCondition = { $or: [{ SHIPPER_CD: cdRegex }, { shipperCd: cdRegex }] };
            const fullQuery = portCondition ? { $and: [portCondition, codeCondition] } : codeCondition;

            let matchByCd = await Shipper.findOne(fullQuery).lean();
            if (!matchByCd && normPort) {
                matchByCd = await Shipper.findOne(codeCondition).lean();
            }

            if (matchByCd) {
                const masterNm = (matchByCd.SHIPPER_NM || matchByCd.shipperNm || "").trim();
                if (masterNm.toUpperCase() === normNm.toUpperCase()) {
                    return { isValid: true };
                } else {
                    return {
                        isValid: false,
                        errorCode: 1024,
                        message: "Shipper Name or Shipper Code is invalid. Shipper details should match with the master data value."
                    };
                }
            }
        }

        // 2. Match by Shipper Name in MongoDB
        const nameCondition = { $or: [{ SHIPPER_NM: nmRegex }, { shipperNm: nmRegex }] };
        const fullNameQuery = portCondition ? { $and: [portCondition, nameCondition] } : nameCondition;

        let matchByNm = await Shipper.findOne(fullNameQuery).lean();
        if (!matchByNm && normPort) {
            matchByNm = await Shipper.findOne(nameCondition).lean();
        }

        if (matchByNm) {
            const masterCd = (matchByNm.SHIPPER_CD || matchByNm.shipperCd || "").trim();
            if (normCd && normCd.toUpperCase() !== "OTHR" && masterCd.toUpperCase() !== normCd.toUpperCase()) {
                return {
                    isValid: false,
                    errorCode: 1024,
                    message: "Shipper Name or Shipper Code is invalid. Shipper details should match with the master data value."
                };
            }
            return { isValid: true, matchedCd: masterCd };
        }

        return {
            isValid: false,
            errorCode: 1024,
            message: "Shipper Name or Shipper Code is invalid. Shipper details should match with the master data value."
        };
    }

    // CSV Fallback if MongoDB collection is not seeded yet
    const shippers = loadShipperMaster();
    if (!shippers || shippers.length === 0) {
        return { isValid: true };
    }

    const normNmUpper = normNm.toUpperCase();
    const normCdUpper = normCd.toUpperCase();

    if (normCdUpper && normCdUpper !== "OTHR") {
        const matchByCd = shippers.find(s => s.shipperCd.trim().toUpperCase() === normCdUpper);
        if (matchByCd) {
            if (matchByCd.shipperNm.trim().toUpperCase() === normNmUpper) {
                return { isValid: true };
            } else {
                return {
                    isValid: false,
                    errorCode: 1024,
                    message: "Shipper Name or Shipper Code is invalid. Shipper details should match with the master data value."
                };
            }
        }
    }

    const matchByNm = shippers.find(s => s.shipperNm.trim().toUpperCase() === normNmUpper);
    if (matchByNm) {
        if (normCdUpper && normCdUpper !== "OTHR" && matchByNm.shipperCd.trim().toUpperCase() !== normCdUpper) {
            return {
                isValid: false,
                errorCode: 1024,
                message: "Shipper Name or Shipper Code is invalid. Shipper details should match with the master data value."
            };
        }
        return { isValid: true, matchedCd: matchByNm.shipperCd };
    }

    return {
        isValid: false,
        errorCode: 1024,
        message: "Shipper Name or Shipper Code is invalid. Shipper details should match with the master data value."
    };
};



