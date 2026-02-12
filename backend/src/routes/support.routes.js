import express from "express";
import {
  createSupportTicket,
  getMySupportTickets,
  getAllSupportTickets,
  resolveSupportTicket,
} from "../controllers/support.controller.js";

import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

/* ================= DRIVER ================= */
router.post("/driver", protect, createSupportTicket);
router.get("/driver", protect, getMySupportTickets);

/* ================= CLIENT ================= */
router.post("/client", protect, createSupportTicket);
router.get("/client", protect, getMySupportTickets);

/* ================= ADMIN ================= */
router.get("/admin", protect, getAllSupportTickets);
router.patch("/admin/:ticketId/resolve", protect, resolveSupportTicket);

export default router;
