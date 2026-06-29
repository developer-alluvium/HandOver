// server/src/services/apiLogger.js
import ApiLog from "../models/ApiLog.js";
import axios from "axios";

export class ApiLogger {
  static isLogVerified(log) {
    if (!log) return false;
    if (log.status === "success") return true;

    const responseData = log.response?.data || {};
    const cntnrStatus = responseData.cntnrStatus || log.status || "";
    if (typeof cntnrStatus === "string") {
      const s = cntnrStatus.toLowerCase();
      if (s.includes("verified") || s.includes("success")) return true;
    }

    const responseMsg = responseData.response || responseData.message || "";
    if (typeof responseMsg === "string") {
      const s = responseMsg.toLowerCase();
      if (s.includes("verified") || s.includes("success")) return true;
    }

    return false;
  }

  static async logAndForward(moduleName, requestData, logId = null) {
    const startTime = Date.now();
    let apiLog;

    try {

      // 1. If logId provided, strictly use it
      if (logId) {
        apiLog = await ApiLog.findById(logId);
        if (apiLog) {
        } else {
          console.warn(`[ApiLogger] WARNING: ID ${logId} was provided but NOT found. Checking by content...`);
        }
      }

      // 2. Fallback to Booking/Container lookup if no log yet found (prevents duplicates from high-level race conditions)
      if (!apiLog && (moduleName === "VGM_SUBMISSION" || moduleName === "VGM_STATUS")) {
        const bookNo = requestData.body?.bookNo?.toString().trim();
        const cntnrNo = requestData.body?.cntnrNo?.toString().trim();

        if (bookNo && cntnrNo) {
          apiLog = await ApiLog.findOne({
            moduleName: "VGM_SUBMISSION",
            "request.body.bookNo": { $regex: new RegExp(`^\\s*${bookNo}\\s*$`, "i") },
            "request.body.cntnrNo": { $regex: new RegExp(`^\\s*${cntnrNo}\\s*$`, "i") },
          }).sort({ createdAt: -1 });
        }
      }

      // If already verified, do not forward/modify the log, return immediately
      if (apiLog && ApiLogger.isLogVerified(apiLog)) {
        console.log(`[ApiLogger] Log ${apiLog._id} is already verified. Skipping API forwarding.`);
        return {
          success: true,
          data: apiLog.response?.data,
          logId: apiLog._id,
        };
      }

      // 3. Last resort: Create new log
      if (!apiLog) {

        apiLog = new ApiLog({
          moduleName,
          status: "pending",
        });
      }

      // Update log with latest request data
      apiLog.request = {
        url: requestData.url,
        method: requestData.method || "POST",
        headers: requestData.headers || {},
        body: requestData.body || {},
        timestamp: new Date(),
      };
      apiLog.status = "pending";

      await apiLog.save();
      const currentLogId = apiLog._id;

      // Forward to third-party API
      const response = await axios({
        method: requestData.method || "POST",
        url: requestData.url,
        headers: requestData.headers,
        data: requestData.body,
        timeout: 30000,
      });

      const timeTaken = Date.now() - startTime;

      // Update log with response
      await ApiLog.findByIdAndUpdate(currentLogId, {
        response: {
          statusCode: response.status,
          data: response.data,
          headers: response.headers,
          timeTaken,
          timestamp: new Date(),
        },
        status: "success",
      });

      return {
        success: true,
        data: response.data,
        logId: currentLogId,
      };
    } catch (error) {
      const timeTaken = Date.now() - startTime;
      const currentLogId = apiLog?._id;

      // Update log with error only if it hasn't been verified or cancelled in the meantime
      if (currentLogId) {
        const latestLog = await ApiLog.findById(currentLogId);
        if (latestLog && (latestLog.status === "success" || latestLog.status === "cancelled" || ApiLogger.isLogVerified(latestLog))) {
          console.log(`[ApiLogger] Log ${currentLogId} is already ${latestLog.status} or verified. Skipping error overwrite.`);
          return {
            success: latestLog.status === "success" || ApiLogger.isLogVerified(latestLog),
            data: latestLog.response?.data,
            logId: currentLogId,
            error: latestLog.status === "success" ? null : (error.response?.data || error.message)
          };
        }

        await ApiLog.findByIdAndUpdate(currentLogId, {
          response: {
            statusCode: error.response?.status || 500,
            data: error.response?.data || { message: error.message },
            timeTaken,
            timestamp: new Date(),
          },
          status: "failed",
          remarks: error.message,
        });
      }

      return {
        success: false,
        error: error.response?.data || error.message,
        logId: currentLogId,
      };
    }
  }

  static async getLogById(logId) {
    return await ApiLog.findById(logId);
  }

  static async getLogsByModule(moduleName, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    return await ApiLog.find({ moduleName }, {
      "request.body.vgmWbAttList": 0,
      "request.body.attachments": 0,
      "request.body.attList": 0,
      "response.data.vgmWbAttList": 0,
      "response.data.attachments": 0,
      "response.data.attList": 0,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }
}
