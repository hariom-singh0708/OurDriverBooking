import express from "express";
import {
  sendContactMessage,
  listContactMessages,
} from "../controllers/contact.controller.js";

const router = express.Router();

router.post("/", sendContactMessage);

/* 🔐 admin ke liye (auth middleware laga sakte ho) */
router.get("/", listContactMessages);

export default router;
