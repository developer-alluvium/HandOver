import express from "express";
import { getShippingLines, getHauliers, getCFSCodes, getPODCodes, getFpodCodes, getShippers } from "../controllers/masterDataController.js";

const router = express.Router();

router.get("/shipping-lines", getShippingLines);
router.get("/hauliers", getHauliers);
router.get("/cfs-codes", getCFSCodes);
router.get("/pod-codes", getPODCodes);
router.get("/fpod-codes", getFpodCodes);
router.get("/shippers", getShippers);

export default router;

