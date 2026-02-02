import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import multer from "multer";

import {
  getClientProfile,
  getClientRides,
  updateProfilePhoto,
  updateSavedAddresses,
  updateClientProfile,
  rateDriver, // ✅ NEW IMPORT
} from "../controllers/client.controller.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

/* ================= GET ================= */
router.get("/profile", protect, getClientProfile);
router.get("/rides", protect, getClientRides);

/* ================= UPDATE ================= */

/* ✅ PROFILE PHOTO */
router.put(
  "/profile/photo",
  protect,
  upload.single("photo"),
  updateProfilePhoto
);

/* ✅ SAVED ADDRESSES */
router.put(
  "/profile/addresses",
  protect,
  updateSavedAddresses
);

/* ✅ EXTRA PROFILE DETAILS (NEW) */
router.put(
  "/profile",
  protect,
  updateClientProfile
);
/* ✅ RATE DRIVER */
router.post(
  "/rate-driver",
  protect,
  rateDriver
);


export default router;
