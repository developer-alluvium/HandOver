import { ApiLogger } from "../services/apiLogger.js";
import ApiLog from "../models/ApiLog.js";
import config from "../config.js";

export const submitVGM = async (req, res) => {
  try {
    // Sanitize input
    req.body.bookNo = req.body.bookNo?.toString().trim();
    req.body.cntnrNo = req.body.cntnrNo?.toString().trim();

    const bookNo = req.body.bookNo;
    const cntnrNo = req.body.cntnrNo;

    console.log(`[submitVGM] Checking for existing log: "${bookNo}" / "${cntnrNo}"`);

    // Check if a request already exists for this booking + container combination
    // Use whitespace-tolerant regex just in case
    const existingLog = await ApiLog.findOne({
      moduleName: "VGM_SUBMISSION",
      "request.body.bookNo": { $regex: new RegExp(`^\\s*${bookNo}\\s*$`, "i") },
      "request.body.cntnrNo": { $regex: new RegExp(`^\\s*${cntnrNo}\\s*$`, "i") }
    }).sort({ createdAt: -1 });

    if (existingLog) {
      console.log(`[submitVGM] Found existing log: ${existingLog._id}`);
    }

    const requestData = {
      url: `${config.odex.baseUrl}/RS/iVGMService/json/saveVgmWb`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: req.body,
    };

    const result = await ApiLogger.logAndForward(
      "VGM_SUBMISSION",
      requestData,
      existingLog?._id
    );

    if (result.success) {
      res.json({
        success: true,
        data: { ...result.data, logId: result.logId },
        logId: result.logId,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        logId: result.logId,
      });
    }
  } catch (error) {
    console.error("Submit VGM Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const saveVGM = async (req, res) => {
  try {
    // Sanitize input
    req.body.bookNo = req.body.bookNo?.toString().trim();
    req.body.cntnrNo = req.body.cntnrNo?.toString().trim();

    const bookNo = req.body.bookNo;
    const cntnrNo = req.body.cntnrNo;

    console.log(`[saveVGM] Checking for existing draft: "${bookNo}" / "${cntnrNo}"`);

    // Check if a draft or request already exists for this booking + container combination
    const existingDraft = await ApiLog.findOne({
      moduleName: "VGM_SUBMISSION",
      "request.body.bookNo": { $regex: new RegExp(`^\\s*${bookNo}\\s*$`, "i") },
      "request.body.cntnrNo": { $regex: new RegExp(`^\\s*${cntnrNo}\\s*$`, "i") }
    }).sort({ createdAt: -1 });

    if (existingDraft) {
      console.log(`[saveVGM] Found existing draft: ${existingDraft._id}`);
    }

    const requestData = {
      url: `${config.odex.baseUrl}/RS/iVGMService/json/saveVgmWb`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: req.body,
      timestamp: new Date()
    };

    let savedLog;

    if (existingDraft) {
      // Update existing draft
      savedLog = await ApiLog.findByIdAndUpdate(
        existingDraft._id,
        {
          request: requestData,
          response: {
            data: { message: "Draft updated" },
            timestamp: new Date()
          },
          status: "saved",
          remarks: `Draft updated on ${new Date().toISOString()}`
        },
        { new: true }
      );
      console.log(`Updated existing draft: ${savedLog._id}`);
    } else {
      // Create new draft
      savedLog = new ApiLog({
        moduleName: "VGM_SUBMISSION",
        request: requestData,
        response: {
          data: { message: "Saved as draft" },
          timestamp: new Date()
        },
        status: "saved",
        remarks: "Saved by user as draft"
      });
      await savedLog.save();
    }

    res.json({
      success: true,
      data: {
        message: existingDraft ? "Draft updated successfully" : "Draft saved successfully",
        isUpdate: !!existingDraft,
        logId: savedLog._id
      },
      logId: savedLog._id,
    });
  } catch (error) {
    console.error("Save VGM Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getVGMStatus = async (req, res) => {
  try {
    const { vgmId } = req.params;

    const log = await ApiLog.findById(vgmId).lean();

    if (!log) {
      return res.status(404).json({ error: "VGM request not found" });
    }

    const requestBody = log.request?.body || {};
    const responseData = log.response?.data || {};

    const transformedRequest = {
      vgmId: log._id,
      _id: log._id,
      cntnrNo: requestBody.cntnrNo,
      bookNo: requestBody.bookNo,
      status: log.status,
      cntnrStatus: responseData.cntnrStatus || log.status,
      totWt: requestBody.totWt,
      totWtUom: requestBody.totWtUom,
      vgmEvalMethod: requestBody.vgmEvalMethod,
      weighBridgeSlipNo: requestBody.weighBridgeSlipNo,
      weighBridgeWtTs: requestBody.weighBridgeWtTs,
      createdAt: log.createdAt,
      response: responseData.response || responseData.message || "Pending",
      remarks: log.remarks,
    };

    res.json(transformedRequest);
  } catch (error) {
    console.error("Get VGM status error:", error);
    res.status(500).json({
      error: "Failed to fetch VGM status",
      details: error.message,
    });
  }
};

export const getAuthorization = async (req, res) => {
  try {
    const requestBody = { ...req.body };

    // Generate current timestamp in YYYY-MM-DD HH:mm:ss format
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    const fromTs = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    requestBody.fromTs = fromTs;

    // Pass secret key automatically
    if (!requestBody.hashKey) {
      if (config.odex.secretKey) {
        requestBody.hashKey = config.odex.secretKey;

      } else {
        console.warn("ODeX Secret Key is missing in server config");
      }
    }

    const requestData = {
      url: `${config.odex.baseUrl}/RS/iVGMService/json/getVGMAccessInfo`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: requestBody,
    };

    const result = await ApiLogger.logAndForward("AUTHORIZATION", requestData);

    if (result.success) {
      // Set authentication cookie
      const authData = {
        userData: { pyrCode: req.body.pyrCode },
        shippers: result.data,
        timestamp: new Date().toISOString(),
      };

      res.cookie("odex_auth", JSON.stringify(authData), {
        httpOnly: true,
        secure: config.isProduction, // True for HTTPS in production, false for HTTP in dev
        sameSite: config.isProduction ? "None" : "Lax", // None for HTTPS cross-site support, Lax for HTTP localhost
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      res.json({
        success: true,
        data: result.data,
        logId: result.logId,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        logId: result.logId,
      });
    }
  } catch (error) {
    console.error("Get Authorization Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("odex_auth");
  res.json({ success: true, message: "Logged out successfully" });
};

export const getCurrentUser = async (req, res) => {
  try {
    const authCookie = req.cookies.odex_auth;
    if (!authCookie) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const authData = JSON.parse(authCookie);
    res.json({
      success: true,
      data: authData,
    });
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid session" });
  }
};

// Auto-login using credentials from environment variables
export const autoLogin = async (req, res) => {
  try {
    // Get credentials from environment config
    const pyrCode = config.odex.pyrCode;
    const hashKey = config.odex.hashKey;

    if (!pyrCode || !hashKey) {
      return res.status(500).json({
        success: false,
        error: "Auto-login credentials not configured in environment",
      });
    }

    console.log("[AUTO-LOGIN] Attempting auto-login with pyrCode:", pyrCode);

    // Generate current timestamp in YYYY-MM-DD HH:mm:ss format
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    const fromTs = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const requestBody = {
      pyrCode,
      hashKey,
      fromTs,
    };

    const requestData = {
      url: `${config.odex.baseUrl}/RS/iVGMService/json/getVGMAccessInfo`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: requestBody,
    };

    const result = await ApiLogger.logAndForward("AUTHORIZATION", requestData);

    if (result.success) {
      // Set authentication cookie
      const authData = {
        userData: { pyrCode },
        shippers: result.data,
        timestamp: new Date().toISOString(),
      };

      res.cookie("odex_auth", JSON.stringify(authData), {
        httpOnly: true,
        secure: config.isProduction,
        sameSite: config.isProduction ? "None" : "Lax",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      console.log("[AUTO-LOGIN] Success! Authenticated as:", pyrCode);

      res.json({
        success: true,
        data: result.data,
        logId: result.logId,
        message: "Auto-login successful",
      });
    } else {
      console.error("[AUTO-LOGIN] Failed:", result.error);
      res.status(500).json({
        success: false,
        error: result.error,
        logId: result.logId,
      });
    }
  } catch (error) {
    console.error("Auto-Login Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Edit specific fields of a log and retrigger API
export const editApiLog = async (req, res) => {
  try {
    const { logId } = req.params;
    const updates = req.body;

    // Get original log
    const originalLog = await ApiLog.findById(logId);
    if (!originalLog) {
      return res.status(404).json({ error: "Log not found" });
    }

    // Create updated request data with clean headers
    const updatedRequest = {
      ...originalLog.request.toObject(),
      ...updates.request,
      body: { ...originalLog.request.body, ...updates.request?.body },
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...updates.request?.headers,
      },
    };

    // Create new log entry for the edit
    const newLog = new ApiLog({
      ...originalLog.toObject(),
      _id: undefined, // Let MongoDB generate new ID
      request: updatedRequest,
      response: {},
      status: "pending",
      originalLogId: logId,
      remarks: `Edited from log ${logId}`,
    });

    await newLog.save();

    // Retrigger API call with updated data
    const result = await ApiLogger.logAndForward(
      newLog.moduleName,
      updatedRequest,
      newLog._id
    );

    if (result.success) {
      res.json({
        success: true,
        data: { ...result.data, logId: result.logId },
        originalLogId: logId,
        newLogId: result.logId,
        message: "API retriggered successfully with updated data",
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        originalLogId: logId,
        newLogId: result.logId,
      });
    }
  } catch (error) {
    console.error("Edit API Log Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Update entire log record and retrigger API
export const updateApiLog = async (req, res) => {
  try {
    const { logId } = req.params;
    const { request, moduleName } = req.body;

    // Verify original log exists
    const originalLog = await ApiLog.findById(logId);
    if (!originalLog) {
      return res.status(404).json({ error: "Log not found" });
    }

    // Create completely new log with clean headers
    const newLog = new ApiLog({
      moduleName: moduleName || originalLog.moduleName,
      request: {
        url: request.url || originalLog.request.url,
        method: request.method || originalLog.request.method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...request.headers,
        },
        body: request.body || originalLog.request.body,
        timestamp: new Date(),
      },
      status: "pending",
      originalLogId: logId,
      remarks: `Complete update from log ${logId}`,
    });

    await newLog.save();

    // Retrigger API call
    const result = await ApiLogger.logAndForward(
      newLog.moduleName,
      newLog.request,
      newLog._id
    );

    if (result.success) {
      res.json({
        success: true,
        data: { ...result.data, logId: result.logId },
        originalLogId: logId,
        newLogId: result.logId,
        message: "API retriggered successfully with new data",
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        originalLogId: logId,
        newLogId: result.logId,
      });
    }
  } catch (error) {
    console.error("Update API Log Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get log by ID
export const getLogById = async (req, res) => {
  try {
    const { logId } = req.params;
    const log = await ApiLog.findById(logId);

    if (!log) {
      return res.status(404).json({ error: "Log not found" });
    }

    res.json(log);
  } catch (error) {
    console.error("Get Log By ID Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get logs by module with pagination
export const getLogsByModule = async (req, res) => {
  try {
    const { moduleName } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const logs = await ApiLogger.getLogsByModule(
      moduleName,
      parseInt(page),
      parseInt(limit)
    );
    const total = await ApiLog.countDocuments({ moduleName });

    res.json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get Logs By Module Error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getVGMRequests = async (req, res) => {
  try {
    const {
      status,
      containerNo,
      bookingNo,
      search,
      dateFrom,
      dateTo,
      page = 1,
      limit = 10,
    } = req.query;

    console.log("getVGMRequests query params:", req.query);

    // Build filter query for VGM submissions
    const filterQuery = { moduleName: "VGM_SUBMISSION" };
    const andConditions = [];

    // Status filter - check both status field and response data
    if (status) {
      andConditions.push({
        $or: [
          { status: { $regex: status, $options: "i" } },
          { "response.data.cntnrStatus": { $regex: status, $options: "i" } },
        ],
      });
    }

    // Generic Search (Container OR Booking)
    if (search) {
      andConditions.push({
        $or: [
          { "request.body.cntnrNo": { $regex: search, $options: "i" } },
          { "request.body.bookNo": { $regex: search, $options: "i" } },
        ],
      });
    }

    // Container number filter (specific)
    if (containerNo) {
      andConditions.push({
        "request.body.cntnrNo": { $regex: containerNo, $options: "i" },
      });
    }

    // Booking number filter (specific)
    if (bookingNo) {
      if (req.query.exactMatch === "true") {
        andConditions.push({ "request.body.bookNo": bookingNo });
      } else {
        andConditions.push({
          "request.body.bookNo": { $regex: bookingNo, $options: "i" },
        });
      }
    }

    // Liner/Shipping Line filter
    if (req.query.linerId) {
      andConditions.push({ "request.body.linerId": req.query.linerId });
    }

    // Date range filter
    if (dateFrom || dateTo) {
      const dateQuery = {};
      if (dateFrom) {
        dateQuery.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endOfDay = new Date(dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        dateQuery.$lte = endOfDay;
      }
      andConditions.push({ createdAt: dateQuery });
    }

    // Combine all conditions
    if (andConditions.length > 0) {
      filterQuery.$and = andConditions;
    }

    const skip = (page - 1) * parseInt(limit);

    // Fetch paginated results
    const requests = await ApiLog.find(filterQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await ApiLog.countDocuments(filterQuery);

    // Transform data for frontend display
    const transformedRequests = requests.map((log) => {
      const requestBody = log.request?.body || {};
      const responseData = log.response?.data || {};

      // Determine the display status
      const displayStatus = responseData.cntnrStatus || log.status;

      return {
        vgmId: log._id,
        cntnrNo: requestBody.cntnrNo,
        bookNo: requestBody.bookNo,
        linerId: requestBody.linerId, // Shipping Line
        locId: requestBody.locId, // Port
        status: log.status, // Original status
        cntnrStatus: displayStatus, // Display status for UI
        totWt: requestBody.totWt,
        totWtUom: requestBody.totWtUom,
        vgmEvalMethod: requestBody.vgmEvalMethod,
        weighBridgeSlipNo: requestBody.weighBridgeSlipNo,
        weighBridgeWtTs: requestBody.weighBridgeWtTs,
        createdAt: log.createdAt,
        response: responseData.response || responseData.message || "Pending",
        remarks: log.remarks,
      };
    });

    res.json({
      requests: transformedRequests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get VGM requests error:", error);
    res.status(500).json({
      error: "Failed to fetch VGM requests",
      details: error.message,
    });
  }
};

// server/src/controllers/apiLogController.js

// Update VGM request and retrigger third-party API
// server/src/controllers/apiLogController.js

// Update VGM request and retrigger third-party API
// server/src/controllers/apiLogController.js

// Get VGM request by ID for editing
export const getVGMRequestById = async (req, res) => {
  try {
    const { vgmId } = req.params;

    const log = await ApiLog.findById(vgmId).lean();

    if (!log) {
      return res.status(404).json({ error: "VGM request not found" });
    }

    // Return complete log data including original request and response
    res.json({
      _id: log._id,
      vgmId: log._id,
      ...log.request?.body,
      status: log.status,
      cntnrStatus: log.response?.data?.cntnrStatus || log.status,
      response: log.response?.data,
      createdAt: log.createdAt,
      originalRequest: log.request?.body,
      apiResponse: log.response?.data,
    });
  } catch (error) {
    console.error("Get VGM request by ID error:", error);
    res.status(500).json({
      error: "Failed to fetch VGM request",
      details: error.message,
    });
  }
};

// Update VGM request and retrigger third-party API
// Update VGM request and retrigger third-party API
export const updateVGMRequest = async (req, res) => {
  try {
    const { vgmId } = req.params;
    const updateData = req.body;

    // Sanitize input
    if (updateData.bookNo) updateData.bookNo = updateData.bookNo.toString().trim();
    if (updateData.cntnrNo) updateData.cntnrNo = updateData.cntnrNo.toString().trim();

    console.log(`[updateVGMRequest] Received update for vgmId: ${vgmId}, BookNo: ${updateData.bookNo}, CntnrNo: ${updateData.cntnrNo}`);

    // Get the original VGM request
    const originalLog = await ApiLog.findById(vgmId);
    if (!originalLog) {
      console.log(`[updateVGMRequest] CRITICAL: Log not found for ID ${vgmId}`);
      return res.status(404).json({ error: "VGM request not found" });
    }

    // Create updated request data
    const updatedRequestData = {
      ...originalLog.request.toObject(),
      body: {
        ...originalLog.request.body,
        ...updateData,
      },
    };

    // Update the existing log with pending status
    await ApiLog.findByIdAndUpdate(vgmId, {
      request: updatedRequestData,
      status: "pending",
      remarks: `Updated and resubmitted on ${new Date().toISOString()}`,
      $inc: { retryCount: 1 },
    });

    // Retrigger API call to third party with updated data
    const result = await ApiLogger.logAndForward(
      "VGM_SUBMISSION",
      updatedRequestData,
      vgmId
    );

    // Update the log with the response
    if (result.success) {
      await ApiLog.findByIdAndUpdate(vgmId, {
        "response.data": result.data,
        status: "success",
      });

      res.json({
        success: true,
        data: { ...result.data, logId: result.logId },
        message: "VGM request updated and resubmitted successfully",
        vgmId: vgmId,
      });
    } else {

      // Safely handle the error - always ensure it's an object
      let errorData;
      if (!result.error) {
        errorData = { message: "No error information provided" };
      } else if (typeof result.error === "string") {
        errorData = {
          message: result.error,
          originalString: result.error,
        };
      } else if (typeof result.error === "object") {
        errorData = result.error;
      } else {
        errorData = {
          message: "Unknown error type",
          originalValue: String(result.error),
        };
      }

      // Update database with error
      await ApiLog.findByIdAndUpdate(vgmId, {
        "response.data": errorData,
        status: "failed",
      });

      res.status(500).json({
        success: false,
        error: errorData,
        vgmId: vgmId,
        message: "VGM request updated but third-party API call failed",
      });
    }
  } catch (error) {
    console.error("Update VGM request error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
    });

    res.status(500).json({
      error: "Failed to update VGM request",
      details: error.message,
    });
  }
};
