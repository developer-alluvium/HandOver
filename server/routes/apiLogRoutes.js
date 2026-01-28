// server/src/routes/apiLogRoutes.js
import express from "express";
import {
  submitVGM,
  getVGMStatus,
  getAuthorization,
  editApiLog,
  updateApiLog,
  getLogById,
  getLogsByModule,
  getVGMRequests,
  updateVGMRequest,
  getVGMRequestById,
  logout,
  getCurrentUser,
} from "../controllers/apiLogController.js";

const router = express.Router();

// Third-party API endpoints
router.post("/vgm/submit", submitVGM);
router.get("/status/:vgmId", getVGMStatus);
router.post("/auth/login", getAuthorization);
router.post("/auth/logout", logout);
router.get("/auth/me", getCurrentUser);

// Log management endpoints
router.get("/logs/:logId", getLogById);
router.get("/logs/module/:moduleName", getLogsByModule);
router.patch("/logs/:logId/edit", editApiLog); // Edit specific fields
router.put("/logs/:logId/update", updateApiLog); // Complete update
router.get("/vgm/requests", getVGMRequests);
router.put("/vgm/requests/:vgmId", updateVGMRequest);
router.get("/vgm/requests/:vgmId", getVGMRequestById);

export default router;
