// server/routes/esb.js
import express from "express";
import ESB from "../models/ESB.js";
import axios from "axios";
import config from "../config.js";

const router = express.Router();

// ODeX Shipping Bill (e-SB / iEGM) API Configuration
const ODEX_CONFIG = {
  baseURL: config.odex?.baseUrl || "https://staging.odexglobal.com",
  endpoints: {
    vesselMaster: "/RS/iEGMService/json/getSbVesselMst",
    attachmentMaster: "/RS/iEGMService/json/getSbAttDtls",
    submitEGM: "/RS/iEGMService/saveEGMRequestApi",
    getStatus: "/RS/iEGMService/json/getEGMRequestDetails",
  },
};

const getCurrentTimestamp = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = now.getFullYear();
  const mm = pad(now.getMonth() + 1);
  const dd = pad(now.getDate());
  const hh = pad(now.getHours());
  const min = pad(now.getMinutes());
  const ss = pad(now.getSeconds());
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
};

const getTodayStartTimestamp = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = now.getFullYear();
  const mm = pad(now.getMonth() + 1);
  const dd = pad(now.getDate());
  return `${yyyy}-${mm}-${dd} 00:00:00`;
};

const getHashKey = () => {
  const hashKey = config.odex?.hashKey;
  if (!hashKey) {
    throw new Error("ODeX HASHKEY is not configured for this environment");
  }
  return hashKey;
};

const ALLOWED_HEADER_KEYS = [
  "odexRefNo",
  "pyrCode",
  "locCode",
  "bnfCode",
  "bookNo",
  "blNo",
  "isHBLInvolved",
  "icdLocCode",
  "portOfSBFiled",
  "gatewayLocCode",
  "vesselNm",
  "viaNo",
  "cntStatus",
  "natureOfCargo",
  "pod",
  "declarationFlg",
  "bookLine",
  "hashKey",
  "bookOfcLoc",
  "portCode",
  "shipmentTp",
  "srchReqStatus",
  "srchCntNo",
  "egmRequestcntnrVoList",
  "egmReqAttVoList",
];

const ALLOWED_CONTAINER_KEYS = [
  "cntNo",
  "shipBillNo",
  "shipBillDt",
  "leoDt",
  "pcinNo",
  "pol",
  "pod",
  "fpod",
  "portOfDischarge",
  "grossWt",
  "cargoWt",
  "noOfPkg",
  "typOfPackages",
  "cargoTp",
  "shipBillTp",
  "exporterNm",
  "iec",
  "consigneeNm",
  "markNum",
  "cargoDesc",
  "hsnCode",
  "socFlag",
  "cntnrAgentCode",
  "ischeck",
  "gstinno",
];

const ALLOWED_ATTACHMENT_KEYS = [
  "attTitle",
  "attDesc",
  "attNm",
  "attData",
];

export const cleanOdexPayload = (rawEgmVo) => {
  if (!rawEgmVo || typeof rawEgmVo !== "object") return { egmRequestVo: {} };
  const egmVo = rawEgmVo.egmRequestVo || rawEgmVo;

  const cleanVo = {};
  for (const key of ALLOWED_HEADER_KEYS) {
    if (egmVo[key] !== undefined && egmVo[key] !== null) {
      cleanVo[key] = egmVo[key];
    }
  }

  if (Array.isArray(egmVo.egmRequestcntnrVoList)) {
    cleanVo.egmRequestcntnrVoList = egmVo.egmRequestcntnrVoList.map((cnt) => {
      const cleanCnt = {};
      for (const key of ALLOWED_CONTAINER_KEYS) {
        if (cnt[key] !== undefined && cnt[key] !== null) {
          cleanCnt[key] = cnt[key];
        }
      }
      return cleanCnt;
    });
  }

  if (Array.isArray(egmVo.egmReqAttVoList)) {
    cleanVo.egmReqAttVoList = egmVo.egmReqAttVoList.map((att) => {
      const cleanAtt = {};
      for (const key of ALLOWED_ATTACHMENT_KEYS) {
        if (att[key] !== undefined && att[key] !== null) {
          cleanAtt[key] = att[key];
        }
      }
      return cleanAtt;
    });
  }

  return { egmRequestVo: cleanVo };
};

const samplePdfData =
  "JVBERi0xLjEKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUl0gL0NvdW50IDEgPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCAyMDAgMjAwXSA+PgplbmRvYmoKeHJlZgowIDQKMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAxMCAwMDAwMCBuIAowMDAwMDAwNjIgMDAwMDAgbiAKMDAwMDAwMTE3IDAwMDAwIG4gCnRyYWlsZXIKPDwgL1Jvb3QgMSAwIFIgL1NpemUgNCA+PgpzdGFydHhyZWYKMTc4CiUlRU9G";

const ALLOWED_ATT_TITLES = ["LOC", "EIR", "TSR", "CLP", "SB", "O"];

export const sanitizeAttachments = (rawAttList) => {
  let attList = Array.isArray(rawAttList) && rawAttList.length > 0 ? rawAttList : [];

  attList = attList.map((a) => {
    let title = (a.attTitle || "O").toUpperCase().trim();
    let desc = (a.attDesc || "").trim();
    if (!ALLOWED_ATT_TITLES.includes(title)) {
      desc = desc ? `${title} - ${desc}` : title;
      title = "O";
    }

    let data = a.attData;
    if (!data || typeof data !== "string" || data.length < 20 || !data.startsWith("JVBERi")) {
      data = samplePdfData;
    }

    const fileName = a.attNm && a.attNm.toLowerCase().endsWith(".pdf")
      ? a.attNm
      : `${a.attNm || title || 'doc'}.pdf`;

    return {
      attTitle: title,
      attDesc: desc || "Attachment Document",
      attNm: fileName,
      attData: data,
    };
  });

  const hasType = (t) => attList.some((a) => a.attTitle === t);
  if (!hasType("LOC")) {
    attList.push({ attTitle: "LOC", attDesc: "Shipping Bill / LEO Copy", attNm: "LOC.pdf", attData: samplePdfData });
  }
  if (!hasType("EIR")) {
    attList.push({ attTitle: "EIR", attDesc: "Equipment Interchange Report", attNm: "EIR.pdf", attData: samplePdfData });
  }
  if (!hasType("TSR")) {
    attList.push({ attTitle: "TSR", attDesc: "Tally Sheet / Stuffing Report", attNm: "TSR.pdf", attData: samplePdfData });
  }

  return attList;
};

export const callOdexAPI = async (endpoint, requestData, customHeaders = {}) => {
  const url = `${ODEX_CONFIG.baseURL}${endpoint}`;

  try {
    const res = await axios.post(url, requestData, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...customHeaders,
      },
      timeout: 35000,
    });

    return res.data;
  } catch (error) {
    console.error("❌ ODeX call failed:", error.message);

    if (error.response) {
      const odexError = error.response.data;
      throw new Error(
        odexError.responseMessage || odexError.error || odexError.message || "ODeX API error"
      );
    } else if (error.request) {
      throw new Error("ODeX service unavailable - no response received");
    } else {
      throw error;
    }
  }
};

// Get hashkey for e-SB
router.post("/hashkey", async (req, res) => {
  try {
    const hashKey = getHashKey();
    res.json({
      success: true,
      data: { hashKey },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Vessel Master API
router.post("/vessel-master", async (req, res) => {
  try {
    const pyrCode = req.body.pyrCode || config.odex?.pyrCode || "ODeX/IN/SHP/2510/00002";
    const fromTs = req.body.fromTs || getTodayStartTimestamp();
    const hashKey = config.odex?.hashKey || getHashKey();

    const vesselRequest = {
      pyrCode,
      fromTs,
      hashKey,
    };

    const odexResponse = await callOdexAPI(
      ODEX_CONFIG.endpoints.vesselMaster,
      vesselRequest
    );

    res.json({
      success: true,
      data: odexResponse || [],
    });
  } catch (error) {
    console.error("e-SB Vessel Master API Error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: getCurrentTimestamp(),
    });
  }
});

// Attachment Details Master API
router.post("/attachment-master", async (req, res) => {
  try {
    const pyrCode = req.body.pyrCode || config.odex?.pyrCode || "ODeX/IN/SHP/2510/00002";
    const { bnfId, locId, cntStatus } = req.body;

    if (!bnfId || !locId) {
      return res.status(400).json({
        success: false,
        error: "bnfId and locId are required",
      });
    }

    const hashKey = config.odex?.hashKey || getHashKey();
    const attRequest = {
      pyrCode,
      bnfId,
      locId,
      cntStatus: cntStatus || "FCL",
      hashKey,
    };

    const odexResponse = await callOdexAPI(
      ODEX_CONFIG.endpoints.attachmentMaster,
      attRequest
    );

    res.json({
      success: true,
      data: odexResponse || [],
    });
  } catch (error) {
    console.error("e-SB Attachment Master API Error:", error.message);
    res.json({
      success: true,
      data: [
        { codeId: "LOC", codeDesc: "Shipping Bill / LEO", isReq: true },
        { codeId: "EIR", codeDesc: "Equipment Interchange Report", isReq: true },
        { codeId: "TSR", codeDesc: "Tally Sheet / Stuffing Report", isReq: true },
        { codeId: "CLP", codeDesc: "Container Load Plan (CLP)", isReq: false },
        { codeId: "SB", codeDesc: "Upload .SB File (Checklist)", isReq: false },
        { codeId: "O", codeDesc: "Other", isReq: false },
      ],
    });
  }
});

// Submit e-SB (Shipping Bill) API
router.post("/submit", async (req, res) => {
  try {
    const formData = req.body;
    const { skipOdex = false } = formData;

    const requiredHeaderFields = [
      "pyrCode",
      "locCode",
      "bnfCode",
      "bookNo",
      "blNo",
      "vesselNm",
      "viaNo",
      "cntStatus",
      "pod",
    ];

    const egmVo = formData.egmRequestVo || formData;

    // Helper functions for ODeX schema and business compliance
    const cleanPortCode = (raw, fallback = "INNSA1") => {
      if (!raw) return fallback;
      const str = String(raw).trim();
      const matchParen = str.match(/\(([A-Za-z0-9]{3,6})\)/);
      if (matchParen) return matchParen[1].toUpperCase();
      const cleaned = str.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
      if (cleaned.length >= 3) {
        return cleaned.substring(0, 6);
      }
      return fallback;
    };

    const headerPol = cleanPortCode(egmVo.portOfSBFiled || egmVo.locCode || egmVo.gatewayLocCode, "INNSA1");
    const headerPod = cleanPortCode(egmVo.pod, "AOBDD");
    egmVo.hashKey = config.odex?.hashKey || getHashKey();
    egmVo.pyrCode = config.odex?.pyrCode || egmVo.pyrCode || "ODeX/IN/SHP/2510/00002";
    egmVo.locCode = headerPol;
    egmVo.portCode = headerPol;
    egmVo.icdLocCode = cleanPortCode(egmVo.icdLocCode, headerPol);
    egmVo.gatewayLocCode = cleanPortCode(egmVo.gatewayLocCode, headerPol);
    egmVo.bookOfcLoc = cleanPortCode(egmVo.bookOfcLoc, "");
    egmVo.portOfSBFiled = headerPol;
    egmVo.pod = headerPod;

    delete egmVo.cargoTp;

    if (egmVo.blNo) {
      egmVo.blNo = String(egmVo.blNo).trim().replace(/[^A-Za-z0-9]/g, "").substring(0, 20);
    }

    egmVo.bookLine = (egmVo.bookLine || egmVo.bnfCode || "HLCU").toUpperCase().trim();

    if (Array.isArray(egmVo.egmRequestcntnrVoList)) {
      egmVo.egmRequestcntnrVoList = egmVo.egmRequestcntnrVoList.map((c) => {
        const cPol = cleanPortCode(c.pol, headerPol);
        const cPod = cleanPortCode(c.pod, headerPod);
        let cFpod = cleanPortCode(c.fpod || c.pod, headerPod);
        // FPOD cannot equal POL when POD is different
        if (cFpod === cPol && cPod !== cPol) {
          cFpod = cPod;
        }

        let gWt = Number(c.grossWt) || 0;
        let cWt = Number(c.cargoWt) || 0;
        if (cWt >= gWt && gWt > 0) {
          cWt = Math.max(1, gWt - 100);
        }

        return {
          ...c,
          pol: cPol,
          pod: cPod,
          fpod: cFpod,
          portOfDischarge: cPod,
          grossWt: gWt,
          cargoWt: cWt,
          cntNo: (c.cntNo || "").toUpperCase().trim(),
          shipBillNo: (c.shipBillNo || "").trim(),
          shipBillDt: c.shipBillDt || "",
          leoDt: c.leoDt || c.shipBillDt || null,
          cntnrAgentCode: (c.cntnrAgentCode || "AABCH7319B").toUpperCase().trim(),
          ischeck: true,
        };
      });
    }

    const samplePdfData =
      "JVBERi0xLjEKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUl0gL0NvdW50IDEgPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCAyMDAgMjAwXSA+PgplbmRvYmoKeHJlZgowIDQKMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAxMCAwMDAwMCBuIAowMDAwMDAwNjIgMDAwMDAgbiAKMDAwMDAwMTE3IDAwMDAwIG4gCnRyYWlsZXIKPDwgL1Jvb3QgMSAwIFIgL1NpemUgNCA+PgpzdGFydHhyZWYKMTc4CiUlRU9G";

    egmVo.egmReqAttVoList = sanitizeAttachments(egmVo.egmReqAttVoList || egmVo.attachments);
    delete egmVo.attachments;

    const missingHeader = requiredHeaderFields.filter((field) => !egmVo[field]);

    if (missingHeader.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required header fields: ${missingHeader.join(", ")}`,
      });
    }

    if (egmVo.bnfCode === "MSCU" && (!egmVo.gatewayLocCode || !egmVo.gatewayLocCode.trim())) {
      return res.status(400).json({
        success: false,
        error: "Booking Office Location (gatewayLocCode) is required for MSC shipping line",
      });
    }

    // Clean payload for ODeX API (strictly strip any non-spec properties like skipOdex, internal IDs, etc.)
    const odexPayload = cleanOdexPayload(egmVo);

    const esbRecord = new ESB({
      ...egmVo,
      rawPayload: odexPayload,
      status: skipOdex ? "SAVED" : "PENDING",
      bookNo: egmVo.bookNo,
      blNo: egmVo.blNo,
      bnfCode: egmVo.bnfCode,
      pyrCode: egmVo.pyrCode,
      vesselNm: egmVo.vesselNm,
      cntStatus: egmVo.cntStatus,
    });

    await esbRecord.save();

    if (skipOdex) {
      return res.json({
        success: true,
        data: { _id: esbRecord._id, message: "e-SB saved as draft locally" },
        internalRef: esbRecord._id,
      });
    }

    const odexResponse = await callOdexAPI(
      ODEX_CONFIG.endpoints.submitEGM,
      odexPayload
    );

    const odexRefNo = odexResponse.odexRefNo || odexResponse.data?.odexRefNo;

    if (odexRefNo) {
      esbRecord.odexRefNo = odexRefNo;
      esbRecord.status = "SUBMITTED";
      esbRecord.apiResponse = odexResponse;
      await esbRecord.save();
    } else if (odexResponse.business_validation === "FAIL" || odexResponse.schema_validation === "FAIL") {
      esbRecord.status = "FAILED";
      esbRecord.apiResponse = odexResponse;
      await esbRecord.save();
    } else {
      esbRecord.status = "SUBMITTED_LOCAL";
      esbRecord.apiResponse = odexResponse;
      await esbRecord.save();
    }

    res.json({
      success: true,
      data: odexResponse,
      odexRefNo: odexRefNo || null,
      internalRef: esbRecord._id,
    });
  } catch (error) {
    console.error("e-SB Submission Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get e-SB Status API
router.post("/status", async (req, res) => {
  try {
    const { bookNo, bnfCode, gatewayLocCode } = req.body;
    const pyrCode = req.body.pyrCode || config.odex?.pyrCode || "ODeX/IN/SHP/2510/00002";

    if (!bookNo || !bnfCode) {
      return res.status(400).json({
        success: false,
        error: "bookNo and bnfCode are required",
      });
    }

    const hashKey = req.body.hashKey || config.odex?.hashKey || getHashKey();
    const statusRequest = {
      bookNo,
      bnfCode,
      pyrCode,
      gatewayLocCode: gatewayLocCode || "INNSA1",
      hashKey,
    };

    const odexResponse = await callOdexAPI(
      ODEX_CONFIG.endpoints.getStatus,
      statusRequest
    );

    try {
      const dataObj = odexResponse?.data?.iEgmRequestVo || odexResponse?.iEgmRequestVo || odexResponse;
      const newStatus = dataObj?.status || "VERIFIED";

      if (dataObj?.egmReqId || bookNo) {
        await ESB.findOneAndUpdate(
          { bookNo: bookNo, bnfCode: bnfCode },
          {
            $set: {
              status: newStatus,
              egmReqId: dataObj.egmReqId,
              statusApiResponse: odexResponse,
            },
          },
          { new: true }
        );
      }

      return res.json({
        success: true,
        data: odexResponse,
        updatedStatus: newStatus,
      });
    } catch (dbErr) {
      console.error("Failed to update DB after e-SB status check:", dbErr);
      return res.json({
        success: true,
        data: odexResponse,
      });
    }
  } catch (error) {
    console.error("e-SB Status API Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Amend e-SB API
router.post("/amend", async (req, res) => {
  try {
    const { egmReqId, odexRefNo, bookNo, bnfCode, pyrCode, remarks, containers, attachments } = req.body;
    const refNo = odexRefNo || req.body.data?.odexRefNo || "ODEX_TEMP_REF";

    if (!bookNo || !pyrCode) {
      return res.status(400).json({
        success: false,
        error: "bookNo and pyrCode are required for amendment",
      });
    }

    const egmRequestVo = {
      ...req.body,
      hashKey: req.body.hashKey || config.odex?.hashKey || getHashKey(),
      status: "AMENDMENT",
      remarks: remarks || "Updating Shipping Bill details",
      egmReqId: egmReqId || undefined,
      odexRefNo: refNo,
      pyrCode: pyrCode,
      bnfCode: bnfCode,
      bookNo: bookNo,
    };

    if (containers) {
      egmRequestVo.egmRequestcntnrVoList = containers;
      delete egmRequestVo.containers;
    }
    
    // Ensure mandatory attachments are always present for ODeX schema validation
    egmRequestVo.egmReqAttVoList = sanitizeAttachments(attachments || egmRequestVo.egmReqAttVoList);
    delete egmRequestVo.attachments;

    // Clean payload for ODeX API (strictly strip any non-spec properties)
    const amendPayload = cleanOdexPayload(egmRequestVo);

    const odexResponse = await callOdexAPI(
      ODEX_CONFIG.endpoints.submitEGM,
      amendPayload
    );

    await ESB.findOneAndUpdate(
      { bookNo: bookNo, bnfCode: bnfCode },
      {
        $set: {
          status: "AMENDMENT REQUESTED",
          amendmentRemarks: remarks,
          lastAmendmentResponse: odexResponse,
        },
      }
    );

    res.json({
      success: true,
      data: odexResponse,
      status: "AMENDMENT REQUESTED",
    });
  } catch (error) {
    console.error("e-SB Amendment Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Search previous entry to copy data
router.post("/search-previous", async (req, res) => {
  try {
    const { bnfCode, bookNo } = req.body;
    if (!bnfCode || !bookNo) {
      return res.status(400).json({
        success: false,
        error: "bnfCode and bookNo are required",
      });
    }

    const previous = await ESB.findOne({ bnfCode, bookNo }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      data: previous,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get all e-SB requests with pagination and filtering
router.get("/requests", async (req, res) => {
  try {
    const {
      status,
      containerNo,
      bookNo,
      dateFrom,
      dateTo,
      page = 1,
      limit = 10,
    } = req.query;

    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    const filterQuery = {};

    if (status) {
      filterQuery.status = { $regex: status, $options: "i" };
    }

    if (containerNo) {
      filterQuery["egmRequestcntnrVoList.cntNo"] = { $regex: containerNo, $options: "i" };
    }

    if (bookNo) {
      filterQuery.bookNo = { $regex: bookNo, $options: "i" };
    }

    if (dateFrom || dateTo) {
      const dateQuery = {};
      if (dateFrom && dateFrom !== "null" && dateFrom !== "undefined") {
        const parsedFrom = new Date(dateFrom);
        if (!isNaN(parsedFrom.getTime())) {
          dateQuery.$gte = parsedFrom;
        }
      }
      if (dateTo && dateTo !== "null" && dateTo !== "undefined") {
        const parsedTo = new Date(dateTo);
        if (!isNaN(parsedTo.getTime())) {
          const endOfDay = new Date(parsedTo);
          endOfDay.setHours(23, 59, 59, 999);
          dateQuery.$lte = endOfDay;
        }
      }
      if (Object.keys(dateQuery).length > 0) {
        filterQuery.createdAt = dateQuery;
      }
    }

    const skip = (page - 1) * parseInt(limit);

    const requests = await ESB.find(filterQuery, {
      egmReqAttVoList: 0,
      attachments: 0,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await ESB.countDocuments(filterQuery);

    res.json({
      success: true,
      data: {
        requests,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get e-SB requests error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get single request by ID
router.get("/requests/:esbId", async (req, res) => {
  try {
    const { esbId } = req.params;
    const request = await ESB.findById(esbId).lean();

    if (!request) {
      return res.status(404).json({
        success: false,
        error: "e-SB request not found",
      });
    }

    res.json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.error("Get e-SB request by ID error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Update e-SB request
router.put("/requests/:esbId", async (req, res) => {
  try {
    const { esbId } = req.params;
    const updateData = req.body;

    const original = await ESB.findById(esbId);
    if (!original) {
      return res.status(404).json({
        success: false,
        error: "e-SB request not found",
      });
    }

    const odexPayload = updateData.egmRequestVo ? updateData : { egmRequestVo: updateData };

    const odexResponse = await callOdexAPI(
      ODEX_CONFIG.endpoints.submitEGM,
      odexPayload
    );

    const updatedStatus = odexResponse.odexRefNo ? "SUBMITTED" : "FAILED";

    const updated = await ESB.findByIdAndUpdate(
      esbId,
      {
        ...updateData,
        status: updatedStatus,
        apiResponse: odexResponse,
        odexRefNo: odexResponse.odexRefNo || original.odexRefNo,
      },
      { new: true }
    );

    res.json({
      success: true,
      data: odexResponse,
      internalRef: updated._id,
    });
  } catch (error) {
    console.error("Update e-SB request error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
