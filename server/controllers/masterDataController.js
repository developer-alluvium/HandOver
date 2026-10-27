// server/controllers/masterDataController.js
import axios from "axios";
import config from "../config.js";
import { SHIPPING_LINES } from "./shippingLine.js";
import { HAULIERS } from "./haulier.js";
import { CFS_CODES } from "./cfsCodes.js";
import Fpod from "../models/Fpod.js";
import Shipper from "../models/Shipper.js";



import ShippingLineModel from "../models/ShippingLineModel.js";
import CfsCode from "../models/CfsCode.js";
import Haulier from "../models/Haulier.js";

// Helper to seed ShippingLine collection if empty or missing labels
const ensureShippingLinesSeeded = async () => {
    try {
        const validCount = await ShippingLineModel.countDocuments({ label: { $exists: true, $ne: "" } });
        if (validCount === 0 && Array.isArray(SHIPPING_LINES) && SHIPPING_LINES.length > 0) {
            console.log(`Re-seeding ${SHIPPING_LINES.length} Shipping Lines into MongoDB...`);
            await ShippingLineModel.deleteMany({});
            const uniqueDocs = [];
            const seen = new Set();
            for (const sl of SHIPPING_LINES) {
                const val = (sl.value || sl.code || "").trim();
                const lbl = (sl.label || sl.name || val).trim();
                if (val && !seen.has(val)) {
                    seen.add(val);
                    uniqueDocs.push({
                        label: lbl,
                        value: val,
                        lable: lbl
                    });
                }
            }
            await ShippingLineModel.insertMany(uniqueDocs, { ordered: false });
            console.log("✅ Shipping Lines seeded into MongoDB successfully.");
        }
    } catch (err) {
        console.warn("Shipping Lines auto-seed notice:", err.message);
    }
};

// Helper to seed CFS Codes collection if empty
const ensureCFSCodesSeeded = async () => {
    try {
        const count = await CfsCode.countDocuments();
        if (count === 0 && Array.isArray(CFS_CODES) && CFS_CODES.length > 0) {
            console.log(`Seeding ${CFS_CODES.length} CFS Codes into MongoDB...`);
            const docs = [];
            const seen = new Set();
            for (const item of CFS_CODES) {
                const val = (item.value || item.cfsCode || "").trim().toUpperCase();
                if (val && !seen.has(val)) {
                    seen.add(val);
                    docs.push({
                        label: item.label ? item.label.trim() : val,
                        value: val,
                        cfsCode: val,
                        locId: item.locId || val.slice(0, 6),
                        cfsName: item.cfsName || item.label || val
                    });
                }
            }
            await CfsCode.insertMany(docs, { ordered: false });
            console.log("✅ CFS Codes seeded into MongoDB successfully.");
        }
    } catch (err) {
        console.warn("CFS Codes auto-seed notice:", err.message);
    }
};

// Helper to seed Hauliers collection if empty
const ensureHauliersSeeded = async () => {
    try {
        const count = await Haulier.countDocuments();
        if (count === 0 && Array.isArray(HAULIERS) && HAULIERS.length > 0) {
            console.log(`Seeding ${HAULIERS.length} Hauliers into MongoDB...`);
            const docs = [];
            const seen = new Set();
            for (const h of HAULIERS) {
                const val = (h.value || h.code || "").trim();
                if (val && !seen.has(val)) {
                    seen.add(val);
                    docs.push({
                        label: h.label || val,
                        value: val,
                        code: val
                    });
                }
            }
            await Haulier.insertMany(docs, { ordered: false });
            console.log("✅ Hauliers seeded into MongoDB successfully.");
        }
    } catch (err) {
        console.warn("Hauliers auto-seed notice:", err.message);
    }
};

export const getShippingLines = async (req, res) => {
    try {
        await ensureShippingLinesSeeded();
        const { search } = req.query;
        let query = {};

        if (search) {
            const regex = new RegExp(search.trim(), "i");
            query = {
                $or: [{ label: regex }, { value: regex }]
            };
        }

        const results = await ShippingLineModel.find(query).sort({ label: 1 }).lean();

        const defaultLines = [
            { label: "ARKU - ARKAS SHIPPING LINE", value: "ARKU", code: "ARKU", name: "ARKU - ARKAS SHIPPING LINE" },
            { label: "HLCU - Hapag-Lloyd", value: "HLCU", code: "HLCU", name: "HLCU - Hapag-Lloyd" },
            { label: "MSCU - Mediterranean Shipping Company (MSC)", value: "MSCU", code: "MSCU", name: "MSCU - Mediterranean Shipping Company (MSC)" },
            { label: "HDMU - Hyundai Merchant Marine (HMM)", value: "HDMU", code: "HDMU", name: "HDMU - Hyundai Merchant Marine (HMM)" },
            { label: "ONEY - Ocean Network Express (ONE)", value: "ONEY", code: "ONEY", name: "ONEY - Ocean Network Express (ONE)" },
            { label: "COSU - COSCO Shipping Lines", value: "COSU", code: "COSU", name: "COSU - COSCO Shipping Lines" },
            { label: "OOLU - Orient Overseas Container Line (OOCL)", value: "OOLU", code: "OOLU", name: "OOLU - Orient Overseas Container Line (OOCL)" },
            { label: "CMDU - CMA CGM", value: "CMDU", code: "CMDU", name: "CMDU - CMA CGM" },
            { label: "MAEU - Maersk Line", value: "MAEU", code: "MAEU", name: "MAEU - Maersk Line" },
            { label: "KMTC - Korea Marine Transport", value: "KMTC", code: "KMTC", name: "KMTC - Korea Marine Transport" },
            { label: "RCLA - Regional Container Lines", value: "RCLA", code: "RCLA", name: "RCLA - Regional Container Lines" },
            { label: "PILU - Pacific International Lines", value: "PILU", code: "PILU", name: "PILU - Pacific International Lines" },
            { label: "TSLI - T.S. Lines", value: "TSLI", code: "TSLI", name: "TSLI - T.S. Lines" },
            { label: "WHLU - Wan Hai Lines", value: "WHLU", code: "WHLU", name: "WHLU - Wan Hai Lines" },
            { label: "YMLU - Yang Ming Marine Transport", value: "YMLU", code: "YMLU", name: "YMLU - Yang Ming Marine Transport" },
            { label: "ZIMU - ZIM Integrated Shipping Services", value: "ZIMU", code: "ZIMU", name: "ZIMU - ZIM Integrated Shipping Services" },
            { label: "EVRG - Evergreen Line", value: "EVRG", code: "EVRG", name: "EVRG - Evergreen Line" },
        ];

        const mappedResults = results.map(r => {
            const lbl = r.label || r.lable || r.name || r.value;
            return {
                label: lbl,
                value: r.value,
                code: r.value,
                name: lbl
            };
        });

        const seenVals = new Set(mappedResults.map(m => (m.value || "").toUpperCase()));
        for (const dl of defaultLines) {
            if (!seenVals.has(dl.value.toUpperCase())) {
                if (!search || dl.label.toLowerCase().includes(search.toLowerCase()) || dl.value.toLowerCase().includes(search.toLowerCase())) {
                    mappedResults.unshift(dl);
                    seenVals.add(dl.value.toUpperCase());
                }
            }
        }

        res.json({
            success: true,
            data: mappedResults,
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
        await ensureHauliersSeeded();
        const { search } = req.query;
        let query = {};

        if (search) {
            const regex = new RegExp(search.trim(), "i");
            query = {
                $or: [{ label: regex }, { value: regex }]
            };
        }

        const results = await Haulier.find(query).sort({ label: 1 }).lean();

        res.json({
            success: true,
            data: results.map(r => ({ label: r.label, value: r.value })),
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
        await ensureCFSCodesSeeded();
        const { search, locId } = req.query;
        let query = {};

        if (locId) {
            const loc = locId.trim().toUpperCase();
            query.value = new RegExp("^" + loc, "i");
        }

        if (search) {
            const regex = new RegExp(search.trim(), "i");
            query.$and = [
                { $or: [{ label: regex }, { value: regex }] }
            ];
        }

        const results = await CfsCode.find(query).sort({ label: 1 }).lean();

        res.json({
            success: true,
            data: results.map(r => ({ label: r.label, value: r.value })),
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
        const { search, portCd, location, PORT_CD, terminalCode, terminal, TERMINAL } = req.query;
        const targetPort = (portCd || location || PORT_CD || "").trim();
        const targetTerminal = (terminalCode || terminal || TERMINAL || "").trim();
        let limit = 50;

        const conditions = [{ STATUS: { $ne: "INACTIVE" } }];

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
                    { portCd: portRegex },
                    { PORT_CODE: portRegex }
                ]
            });
        }

        if (targetTerminal) {
            const termRegex = new RegExp(`^${targetTerminal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
            conditions.push({
                $or: [
                    { TERMINAL: termRegex },
                    { terminal: termRegex }
                ]
            });
        }

        const query = conditions.length === 1 ? conditions[0] : { $and: conditions };

        // Fetch from MongoDB
        let dbResults = await Shipper.find(query).limit(limit).lean();

        // Fallback 1: If terminal filter was provided but returned 0 results, retry without terminal filter
        if ((!dbResults || dbResults.length === 0) && targetTerminal) {
            const portConditions = conditions.filter(c => !c.$or || !c.$or.some(o => o.TERMINAL || o.terminal));
            const fallbackQuery = portConditions.length === 1 ? portConditions[0] : { $and: portConditions };
            dbResults = await Shipper.find(fallbackQuery).limit(limit).lean();
        }

        // Fallback 2: If location filter was provided but returned 0 results, retry with search only
        if ((!dbResults || dbResults.length === 0) && targetPort) {
            let fallbackQuery = { STATUS: { $ne: "INACTIVE" } };
            if (search && search.trim() !== "") {
                const searchRegex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
                fallbackQuery.$or = [
                    { SHIPPER_NM: searchRegex },
                    { shipperNm: searchRegex },
                    { SHIPPER_CD: searchRegex },
                    { shipperCd: searchRegex }
                ];
            }
            dbResults = await Shipper.find(fallbackQuery).limit(limit).lean();
        }

        if (dbResults && dbResults.length > 0) {
            let normalized = dbResults.map(s => {
                const masterCd = s.SHIPPER_CD || s.shipperCd || "";
                const sTerm = (s.TERMINAL || s.terminal || "").trim();
                let codeToUse = masterCd;
                if (targetTerminal && (!sTerm || sTerm.toUpperCase() !== targetTerminal.toUpperCase())) {
                    codeToUse = "";
                }
                return {
                    shipperCd: codeToUse,
                    shipperNm: s.SHIPPER_NM || s.shipperNm || "",
                    portCd: s.PORT_CD || s.portCd || "",
                    terminal: sTerm
                };
            });

            const hasOther = normalized.some(s => (s.shipperCd || "").toUpperCase() === "OTHR" || (s.shipperNm || "").toUpperCase() === "OTHER SHIPPER");
            if (!hasOther) {
                normalized.push({
                    shipperCd: "OTHR",
                    shipperNm: "OTHER SHIPPER",
                    portCd: targetPort || "",
                    terminal: targetTerminal || ""
                });
            }

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

        const hasOther = results.some(s => (s.shipperCd || "").toUpperCase() === "OTHR" || (s.shipperNm || "").toUpperCase() === "OTHER SHIPPER");
        if (!hasOther) {
            results = [...results, { shipperCd: "OTHR", shipperNm: "OTHER SHIPPER" }];
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

export const validateShipperDetails = async (shipperNm, shipperCd, portCd = "", terminalCode = "") => {
    const normNm = (shipperNm || "").trim();
    const normCd = (shipperCd || "").trim();
    const normPort = (portCd || "").trim();
    const normTerminal = (terminalCode || "").trim();

    if (!normNm) {
        return {
            isValid: false,
            errorCode: 1024,
            message: "Shipper Name is mandatory and should always be provided."
        };
    }

    // Always accept OTHR code for shippers not in master
    if (normCd.toUpperCase() === "OTHR") {
        return { isValid: true, matchedCd: "OTHR" };
    }

    const nmRegex = new RegExp(`^${normNm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
    const cdRegex = normCd ? new RegExp(`^${normCd.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") : null;

    // Check if MongoDB collection has data
    const dbCount = await Shipper.countDocuments().catch(() => 0);

    if (dbCount > 0) {
        const baseConditions = [
            { STATUS: { $ne: "INACTIVE" } },
            { $or: [{ SHIPPER_NM: nmRegex }, { shipperNm: nmRegex }] }
        ];

        if (cdRegex) {
            baseConditions.push({
                $or: [{ SHIPPER_CD: cdRegex }, { shipperCd: cdRegex }]
            });
        }

        if (normPort) {
            const portRegex = new RegExp(`^${normPort.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
            baseConditions.push({
                $or: [{ PORT_CD: portRegex }, { portCd: portRegex }, { PORT_CODE: portRegex }]
            });
        }

        // 1. Try matching with terminal if terminalCode is provided
        if (normTerminal) {
            const termRegex = new RegExp(`^${normTerminal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
            const termConditions = [
                ...baseConditions,
                { $or: [{ TERMINAL: termRegex }, { terminal: termRegex }] }
            ];
            let matchWithTerminal = await Shipper.findOne({ $and: termConditions }).lean();
            if (matchWithTerminal) {
                return { isValid: true, matchedCd: matchWithTerminal.SHIPPER_CD || matchWithTerminal.shipperCd || "" };
            }
        }

        // 2. Try matching with port + shipper pair (terminal not specified or not matching in master)
        let matchWithPort = await Shipper.findOne({ $and: baseConditions }).lean();
        if (matchWithPort) {
            // Location and shipper name match in master!
            // If terminal was provided but terminal is not present/matched in master for this shipper:
            // Pass shipper Name and code as empty string.
            const masterTerm = (matchWithPort.TERMINAL || matchWithPort.terminal || "").trim();
            if (!masterTerm || (normTerminal && masterTerm.toUpperCase() !== normTerminal.toUpperCase())) {
                return { isValid: true, matchedCd: "" };
            }
            return { isValid: true, matchedCd: matchWithPort.SHIPPER_CD || matchWithPort.shipperCd || "" };
        }

        // 3. Fallback: Check without port condition
        if (normPort) {
            const noPortConditions = [
                { STATUS: { $ne: "INACTIVE" } },
                { $or: [{ SHIPPER_NM: nmRegex }, { shipperNm: nmRegex }] }
            ];
            if (cdRegex) {
                noPortConditions.push({
                    $or: [{ SHIPPER_CD: cdRegex }, { shipperCd: cdRegex }]
                });
            }
            let matchNoPort = await Shipper.findOne({ $and: noPortConditions }).lean();
            if (matchNoPort) {
                return { isValid: true, matchedCd: "" };
            }
        }

        // 4. Shipper not in master at all -> fallback to OTHR
        return { isValid: true, matchedCd: "OTHR" };
    }

    // CSV Fallback if MongoDB collection is not seeded yet
    const shippers = loadShipperMaster();
    if (!shippers || shippers.length === 0) {
        return { isValid: true, matchedCd: "OTHR" };
    }

    const normNmUpper = normNm.toUpperCase();
    const normCdUpper = normCd.toUpperCase();

    const csvMatch = shippers.find(s => {
        const cdMatch = !normCdUpper || s.shipperCd.trim().toUpperCase() === normCdUpper;
        const nmMatch = s.shipperNm.trim().toUpperCase() === normNmUpper;
        return cdMatch && nmMatch;
    });

    if (csvMatch) {
        const csvTerm = (csvMatch.terminal || csvMatch.TERMINAL || "").trim();
        if (normTerminal && (!csvTerm || csvTerm.toUpperCase() !== normTerminal.toUpperCase())) {
            return { isValid: true, matchedCd: "" };
        }
        return { isValid: true, matchedCd: csvMatch.shipperCd || "" };
    }

    // If no match in CSV, fallback to OTHR
    return { isValid: true, matchedCd: "OTHR" };
};




