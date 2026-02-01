import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { triggerSOS } from "../controllers/sos.controller.js";

const router = express.Router();

router.post("/", protect, triggerSOS);

export default router;
