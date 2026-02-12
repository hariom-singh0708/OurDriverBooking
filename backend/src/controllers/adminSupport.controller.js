import SupportTicket from "../models/SupportTicket.model.js";
import { sendEmail } from "../utils/sendEmail.js";

/* ================= LIST ALL SUPPORT TICKETS ================= */
export const listSupportTickets = async (req, res) => {
  try {
    const list = await SupportTicket.find()
      .populate("userId", "name mobile email role")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      data: list,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to load support tickets",
    });
  }
};

/* ================= RESOLVE SUPPORT TICKET ================= */
export const resolveSupportTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate("userId", "name email");

    if (!ticket) {
      return res.status(404).json({ message: "Support ticket not found" });
    }

    if (ticket.status === "RESOLVED") {
      return res.json({
        success: true,
        message: "Ticket already resolved",
      });
    }

    // ✅ mark resolved
    ticket.status = "RESOLVED";
    await ticket.save();

    /* ================= EMAIL TO USER ================= */
    if (ticket.userId?.email) {
      await sendEmail({
        to: ticket.userId.email,
        subject: "Your Support Request Has Been Resolved",
        html: `
          <h3>Hello ${ticket.userId.name},</h3>

          <p>Your support request has been 
            <b style="color:green">RESOLVED</b>.
          </p>

          <p><b>Category:</b> ${ticket.category}</p>
          <p><b>Your Message:</b><br/>${ticket.message}</p>

          <br/>

          <p>If you still face the issue, you can raise a new request anytime.</p>

          <br/>
          <p>Thanks,<br/>Driver Booking Team</p>
        `,
      });
    }

    res.json({
      success: true,
      message: "Support ticket resolved & user notified",
    });
  } catch (err) {
    console.error("Resolve support error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to resolve support ticket",
    });
  }
};

