// server/routes/form13.js
import express from "express";
import Form13 from "../models/Form13.js";
import axios from "axios";

import config from "../config.js";

const router = express.Router();

// ODeX API Configuration
const ODEX_CONFIG = {
  baseURL: config.odex.baseUrl,
  endpoints: {
    vesselMaster: "/RS/iForm13Service/json/getForm13VesselInfo",

    podMaster: "/RS/iForm13Service/json/getForm13PODInfo",
    submitForm13: "/RS/iForm13Service/json/saveF13",
    getStatus: "/RS/iForm13Service/json/getForm13ReqInfo",
    cancelForm13: "/RS/iForm13Service/json/requestF13CancelPyr",
  },
};

// Helper function to get current timestamp in required format
const getCurrentTimestamp = () => {
  const now = new Date();
  return now.toISOString().replace("T", " ").split(".")[0];
};

// Helper function to get hashkey from config
const getHashKey = () => {
  const hashKey = config.odex.hashKey;
  if (!hashKey) {
    throw new Error("ODeX HASHKEY is not configured for this environment");
  }
  return hashKey;
};

// Helper function to call ODeX API with robust error handling

export const callOdexAPI = async (endpoint, requestData) => {
  const url = `${ODEX_CONFIG.baseURL}${endpoint}`;
  console.log("📤 ODeX Request →", url);
  // console.log("📤 Payload:", JSON.stringify(requestData, null, 2));

  try {
    const res = await axios.post(url, requestData, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 30000,
    });

    // console.log("📥 ODeX Response:", JSON.stringify(res.data, null, 2));

    // ODeX returns JSON even for errors, so no HTML detection needed
    return res.data;
  } catch (error) {
    console.error("❌ ODeX call failed:", error.message);

    if (error.response) {
      // ODeX returned JSON error
      const odexError = error.response.data;
      throw new Error(
        odexError.responseMessage || odexError.error || "ODeX API error"
      );
    } else if (error.request) {
      throw new Error("ODeX service unavailable - no response received");
    } else {
      throw error;
    }
  }
};

// Mock data for testing when API is down
const getMockVesselData = () => {
  return {
    success: true,
    data: [
      {
        vesselCode: "VSL001",
        vesselName: "MAERSK COLUMBUS",
        voyageNo: "234W",
        rotationNo: "ROT12345",
      },
      {
        vesselCode: "VSL002",
        vesselName: "CMA CGM AMERICA",
        voyageNo: "567E",
        rotationNo: "ROT12346",
      },
    ],
  };
};

// Get hashkey for Form 13
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

// Vessel Master API - Calls actual ODeX API
router.post("/vessel-master", async (req, res) => {
  try {
    const { pyrCode } = req.body;

    // Validate required fields
    if (!pyrCode) {
      return res.status(400).json({
        success: false,
        error: "pyrCode is required",
      });
    }

    // Get current timestamp and hashkey
    // const fromTs = getCurrentTimestamp();
    const fromTs = "2025-11-09 00:00:00";
    const hashKey = getHashKey();

    // Prepare request for ODeX API
    const vesselRequest = {
      pyrCode,
      fromTs,
      hashKey,
    };

    // Call actual ODeX Vessel Master API
    const odexResponse = await callOdexAPI(
      ODEX_CONFIG.endpoints.vesselMaster,
      vesselRequest
    );

    res.json({
      success: true,
      data: odexResponse || [],
    });
  } catch (error) {
    console.error("Vessel Master API Error:", error);

    // Return mock data for testing when API is down
    if (process.env.USE_MOCK_DATA === "true") {
      console.log("Returning mock vessel data");
      const mockData = getMockVesselData();
      return res.json(mockData);
    }

    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: getCurrentTimestamp(),
      suggestion:
        "API timeout - check ODeX service availability or use mock data for testing",
    });
  }
});

// POD Master API - Calls actual ODeX API
router.post("/pod-master", async (req, res) => {
  try {
    const { pyrCode } = req.body;

    // Validate required fields
    if (!pyrCode) {
      return res.status(400).json({
        success: false,
        error: "pyrCode is required",
      });
    }

    // Get current timestamp and hashkey
    // const fromTs = getCurrentTimestamp();
    const fromTs = "2022-07-19 00:00:00";

    const hashKey = getHashKey();

    // Prepare request for ODeX API
    const podRequest = {
      pyrCode,
      fromTs,
      hashKey,
    };

    // Call actual ODeX POD Master API
    const odexResponse = await callOdexAPI(
      ODEX_CONFIG.endpoints.podMaster,
      podRequest
    );

    res.json({
      success: true,
      data: odexResponse || [],
    });
  } catch (error) {
    console.error("POD Master API Error:", error);

    // Return mock data for testing when API is down
    if (process.env.USE_MOCK_DATA === "true") {
      return res.json({
        success: true,
        data: [
          { portCode: "INBOM", portName: "MUMBAI" },
          { portCode: "INSHA", portName: "SHARJAH" },
        ],
      });
    }

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Submit Form 13 - Calls actual ODeX API
// Submit Form 13 - Calls actual ODeX API
// server/routes/form13.js - Update the submit endpoint
router.post("/submit", async (req, res) => {
  try {
    const formData = req.body;

    // Validate required fields including formType
    const requiredFields = [
      "pyrCode",
      "vesselNm",
      "pod",
      "formType",
      "hashKey",
    ];
    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    console.log("📥 Received Form 13 Submission:");
    console.log("   - cntrList length:", formData.cntrList?.length);
    console.log("   - attList length:", formData.attList?.length);
    console.log("   - Full payload keys:", Object.keys(formData));

    // Save the EXACT payload as-is - no transformation
    const form13 = new Form13(formData);
    await form13.save();

    console.log("💾 Saved document ID:", form13._id);

    // Call ODeX API
    const odexResponse = await callOdexAPI(
      ODEX_CONFIG.endpoints.submitForm13,
      formData // Send the exact payload from frontend
    );

    // Update with ODeX reference
    if (odexResponse.odexRefNo) {
      form13.odexRefNo = odexResponse.odexRefNo;
      form13.status = "SUBMITTED";
      await form13.save();
    }

    res.json({
      success: true,
      data: odexResponse,
      internalRef: form13._id,
    });
  } catch (error) {
    console.error("Form 13 Submission Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get Form 13 Status - Calls actual ODeX API
router.post("/status", async (req, res) => {
  try {
    const { pyrCode, odexRefNo } = req.body;

    if (!pyrCode || !odexRefNo) {
      return res.status(400).json({
        success: false,
        error: "pyrCode and odexRefNo are required",
      });
    }

    // Get hashkey from environment
    const hashKey = getHashKey();

    const statusRequest = {
      pyrCode,
      odexRefNo,
      hashKey,
    };

    // Call actual ODeX Status API
    const odexResponse = await callOdexAPI(
      ODEX_CONFIG.endpoints.getStatus,
      statusRequest
    );

    res.json({
      success: true,
      data: odexResponse,
    });
  } catch (error) {
    console.error("Form 13 Status Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Cancel Form 13 - Calls actual ODeX API
router.post("/cancel", async (req, res) => {
  try {
    const { pyrCode, odexRefNo, reason } = req.body;

    if (!pyrCode || !odexRefNo || !reason) {
      return res.status(400).json({
        success: false,
        error: "pyrCode, odexRefNo and reason are required",
      });
    }

    // Get hashkey from environment
    const hashKey = getHashKey();

    const cancelRequest = {
      pyrCode,
      odexRefNo,
      reason,
      hashKey,
    };

    // Call actual ODeX Cancellation API
    const odexResponse = await callOdexAPI(
      ODEX_CONFIG.endpoints.cancelForm13,
      cancelRequest
    );

    res.json({
      success: true,
      data: odexResponse,
    });
  } catch (error) {
    console.error("Form 13 Cancellation Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Search for previous Form 13 entry to copy data
router.post("/search-previous", async (req, res) => {
  try {
    const { bnfCode, bookNo } = req.body;
    if (!bnfCode || !bookNo) {
      return res.status(400).json({
        success: false,
        error: "bnfCode and bookNo are required",
      });
    }

    const previous = await Form13.findOne({ bnfCode, bookNo }).sort({
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

// Get all Form 13 requests with filtering and pagination
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

    const filterQuery = {};

    if (status) {
      filterQuery.status = { $regex: status, $options: "i" };
    }

    if (containerNo) {
      filterQuery["containers.cntnrNo"] = { $regex: containerNo, $options: "i" };
    }

    if (bookNo) {
      filterQuery.bookNo = { $regex: bookNo, $options: "i" };
    }

    if (dateFrom || dateTo) {
      filterQuery.createdAt = {};
      if (dateFrom) {
        filterQuery.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endOfDay = new Date(dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        filterQuery.createdAt.$lte = endOfDay;
      }
    }

    const skip = (page - 1) * parseInt(limit);

    const requests = await Form13.find(filterQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Form13.countDocuments(filterQuery);

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
    console.error("Get Form 13 requests error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get Form 13 request by ID
router.get("/requests/:f13Id", async (req, res) => {
  try {
    const { f13Id } = req.params;
    const request = await Form13.findById(f13Id).lean();

    if (!request) {
      return res.status(404).json({
        success: false,
        error: "Form 13 request not found",
      });
    }

    res.json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.error("Get Form 13 request by ID error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Update Form 13 request and retrigger API
router.put("/requests/:f13Id", async (req, res) => {
  try {
    const { f13Id } = req.params;
    const updateData = req.body;

    const originalRequest = await Form13.findById(f13Id);
    if (!originalRequest) {
      return res.status(404).json({
        success: false,
        error: "Form 13 request not found",
      });
    }

    // Call ODeX API with updated data
    const odexResponse = await callOdexAPI(
      ODEX_CONFIG.endpoints.submitForm13,
      updateData
    );

    // Update the record in database
    const updatedStatus = odexResponse.odexRefNo ? "SUBMITTED" : "FAILED";
    const updatedRequest = await Form13.findByIdAndUpdate(
      f13Id,
      {
        ...updateData,
        status: updatedStatus,
        form13ApiResponse: odexResponse,
        odexRefNo: odexResponse.odexRefNo || originalRequest.odexRefNo,
      },
      { new: true }
    );

    res.json({
      success: true,
      data: odexResponse,
      internalRef: updatedRequest._id,
    });
  } catch (error) {
    console.error("Update Form 13 request error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
