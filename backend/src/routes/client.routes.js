import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js"; // ✅ Cloudinary

import {
  getClientProfile,
  getClientRides,
  updateProfilePhoto,
  updateSavedAddresses,
  updateClientProfile,
  rateDriver,
  deleteClientAccount,
} from "../controllers/client.controller.js";

const router = express.Router();

/* ================= GET ================= */
router.get("/profile", protect, getClientProfile);
router.get("/rides", protect, getClientRides);

/* ================= UPDATE ================= */

/* ✅ PROFILE PHOTO (Now Cloudinary) */
router.put(
  "/profile/photo",
  protect,
  upload.single("photo"),   // ✅ now uploads to Cloudinary
  updateProfilePhoto
);

/* ✅ SAVED ADDRESSES */
router.put("/profile/addresses", protect, updateSavedAddresses);

/* ✅ EXTRA PROFILE DETAILS */
router.put("/profile", protect, updateClientProfile);

/* ✅ RATE DRIVER */
router.post("/rate-driver", protect, rateDriver);

// ❌ DELETE CLIENT ACCOUNT
router.delete("/account", protect, deleteClientAccount);

export default router;
