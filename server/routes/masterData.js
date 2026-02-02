// server/routes/masterData.js
import express from "express";
import { getShippingLines } from "../controllers/masterDataController.js";

const router = express.Router();

router.get("/shipping-lines", getShippingLines);

export default router;
