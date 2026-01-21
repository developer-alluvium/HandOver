// server/routes/masterData.js
import express from "express";
import { getShippingLines, createShippingLine, seedShippingLines } from "../controllers/masterDataController.js";

const router = express.Router();

router.get("/shipping-lines", getShippingLines);
router.post("/shipping-lines", createShippingLine);
router.post("/shipping-lines/seed", seedShippingLines);

export default router;
