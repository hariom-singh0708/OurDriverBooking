import SupportTicket from "../models/SupportTicket.model.js";

/**
 * Create support ticket (Driver / Client)
 */
export const createSupportTicket = async (req, res) => {
  try {
    const { category, message } = req.body;

    if (!category || !message) {
      return res.status(400).json({
        success: false,
        message: "Category and message are required",
      });
    }

    const ticket = await SupportTicket.create({
      userId: req.user._id,
      role: req.user.role,
      category,
      message,
    });

    return res.status(201).json({
      success: true,
      message: "Support ticket created successfully",
      data: ticket,
    });
  } catch (error) {
    console.error("Create Support Ticket Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create support ticket",
    });
  }
};

/**
 * Get logged-in user's tickets (Driver / Client)
 */
export const getMySupportTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({
      userId: req.user._id,
      role: req.user.role,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Support tickets fetched",
      data: tickets,
    });
  } catch (error) {
    console.error("Get Support Tickets Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch support tickets",
    });
  }
};

/**
 * Admin: Get all tickets
 */
export const getAllSupportTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "All support tickets fetched",
      data: tickets,
    });
  } catch (error) {
    console.error("Admin Get Tickets Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch support tickets",
    });
  }
};

/**
 * Admin: Resolve ticket
 */
export const resolveSupportTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await SupportTicket.findByIdAndUpdate(
      ticketId,
      { status: "RESOLVED" },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Support ticket not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Support ticket resolved",
      data: ticket,
    });
  } catch (error) {
    console.error("Resolve Ticket Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to resolve support ticket",
    });
  }
};
