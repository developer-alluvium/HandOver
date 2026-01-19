// server/src/controllers/apiLogController.js
import { ApiLogger } from "../services/apiLogger.js";
import ApiLog from "../models/ApiLog.js";
import config from "../config.js";

export const submitVGM = async (req, res) => {
  try {
    // Don't forward all headers from client - create clean headers
    const requestData = {
      url: `${config.odex.baseUrl}/RS/iVGMService/json/saveVgmWb`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: req.body,
    };

    const result = await ApiLogger.logAndForward("VGM_SUBMISSION", requestData);

    if (result.success) {
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
    console.error("Submit VGM Error:", error);
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
    const requestData = {
      url: `${config.odex.baseUrl}/RS/iVGMService/json/getVGMAccessInfo`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: req.body,
    };

    const result = await ApiLogger.logAndForward("AUTHORIZATION", requestData);

    if (result.success) {
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
      updatedRequest
    );

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
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
      newLog.request
    );

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
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
      dateFrom,
      dateTo,
      page = 1,
      limit = 10,
    } = req.query;

    // Build filter query for VGM submissions
    const filterQuery = { moduleName: "VGM_SUBMISSION" };

    // Status filter - check both status field and response data
    if (status) {
      filterQuery.$or = [
        { status: { $regex: status, $options: "i" } },
        { "response.data.cntnrStatus": { $regex: status, $options: "i" } },
      ];
    }

    // Container number filter
    if (containerNo) {
      filterQuery["request.body.cntnrNo"] = {
        $regex: containerNo,
        $options: "i",
      };
    }

    // Booking number filter
    if (bookingNo) {
      if (req.query.exactMatch === "true") {
        filterQuery["request.body.bookNo"] = bookingNo;
      } else {
        filterQuery["request.body.bookNo"] = {
          $regex: bookingNo,
          $options: "i",
        };
      }
    }

    // Liner/Shipping Line filter
    if (req.query.linerId) {
      filterQuery["request.body.linerId"] = req.query.linerId;
    }

    // Date range filter
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

    console.log(`Updating VGM request ${vgmId} with data:`, updateData);

    // Get the original VGM request
    const originalLog = await ApiLog.findById(vgmId);
    if (!originalLog) {
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

    console.log(
      "Updated request data for resubmission:",
      JSON.stringify(updatedRequestData.body, null, 2)
    );

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
      updatedRequestData
    );

    console.log("Resubmission result structure:", {
      success: result.success,
      errorType: typeof result.error,
      errorValue: result.error,
      hasLogId: !!result.logId,
    });

    // Update the log with the response
    if (result.success) {
      await ApiLog.findByIdAndUpdate(vgmId, {
        "response.data": result.data,
        status: "success",
      });

      res.json({
        success: true,
        data: result.data,
        message: "VGM request updated and resubmitted successfully",
        vgmId: vgmId,
      });
    } else {
      // DEBUG: Log the exact structure of result.error
      console.log("DEBUG - result.error structure:", {
        type: typeof result.error,
        value: result.error,
        isObject: result.error && typeof result.error === "object",
        isString: typeof result.error === "string",
        keys:
          result.error && typeof result.error === "object"
            ? Object.keys(result.error)
            : "N/A",
      });

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

      console.log("DEBUG - Final errorData to store:", errorData);

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
