import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import {
  submitKYC,
  getKYCStatus,
} from "../controllers/kyc.controller.js";

const router = express.Router();

router.post(
  "/",
  protect,
  upload.fields([
    { name: "aadhaarImage" },
    { name: "panImage" },
    { name: "licenseImage" },
    { name: "driverPhoto" },
  ]),
  submitKYC
);

router.get("/", protect, getKYCStatus);

export default router;
