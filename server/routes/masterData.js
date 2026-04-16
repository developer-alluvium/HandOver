import express from "express";
import { getShippingLines, getHauliers, getCFSCodes } from "../controllers/masterDataController.js";

const router = express.Router();

router.get("/shipping-lines", getShippingLines);
router.get("/hauliers", getHauliers);
router.get("/cfs-codes", getCFSCodes);

export default router;
