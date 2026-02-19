// server/src/services/apiLogger.js
import ApiLog from "../models/ApiLog.js";
import axios from "axios";

export class ApiLogger {
  static async logAndForward(moduleName, requestData, logId = null) {
    const startTime = Date.now();
    let apiLog;

    try {
      console.log(`[ApiLogger] logAndForward: Request for module ${moduleName}, ID hint: ${logId}`);

      // 1. If logId provided, strictly use it
      if (logId) {
        apiLog = await ApiLog.findById(logId);
        if (apiLog) {
          console.log(`[ApiLogger] Found log by ID: ${logId}`);
        } else {
          console.warn(`[ApiLogger] WARNING: ID ${logId} was provided but NOT found. Checking by content...`);
        }
      }

      // 2. Fallback to Booking/Container lookup if no log yet found (prevents duplicates from high-level race conditions)
      if (!apiLog && (moduleName === "VGM_SUBMISSION" || moduleName === "VGM_STATUS")) {
        const bookNo = requestData.body?.bookNo?.toString().trim();
        const cntnrNo = requestData.body?.cntnrNo?.toString().trim();

        if (bookNo && cntnrNo) {
          console.log(`[ApiLogger] Searching for existing record by content: ${bookNo} / ${cntnrNo}`);
          apiLog = await ApiLog.findOne({
            moduleName: "VGM_SUBMISSION",
            "request.body.bookNo": { $regex: new RegExp(`^\\s*${bookNo}\\s*$`, "i") },
            "request.body.cntnrNo": { $regex: new RegExp(`^\\s*${cntnrNo}\\s*$`, "i") },
          }).sort({ createdAt: -1 });

          if (apiLog) {
            console.log(`[ApiLogger] Found existing log ${apiLog._id} via content match`);
          }
        }
      }

      // 3. Last resort: Create new log
      if (!apiLog) {
        if (logId) {
          console.error(`[ApiLogger] CRITICAL: Reached record creation even though logId ${logId} was provided. This usually means a record was deleted or ID is malformed.`);
        }
        console.log(`[ApiLogger] Creating a FRESH log entry`);
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

      // Update log with error
      if (currentLogId) {
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

    return await ApiLog.find({ moduleName })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }
}
