import express from "express";
import { getShippingLines, getHauliers, getCFSCodes, getPODCodes } from "../controllers/masterDataController.js";

const router = express.Router();

router.get("/shipping-lines", getShippingLines);
router.get("/hauliers", getHauliers);
router.get("/cfs-codes", getCFSCodes);
router.get("/pod-codes", getPODCodes);

export default router;
