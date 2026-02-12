import ContactMessage from "../models/ContactMessage.model.js";
import { sendEmail } from "../utils/sendEmail.js";

/* ================= SEND CONTACT MESSAGE ================= */
export const sendContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body || {};

    /* ---------- BASIC VALIDATION ---------- */
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    /* ---------- SAVE MESSAGE IN DB ---------- */
    const contact = await ContactMessage.create({
      name,
      email,
      subject,
      message,
    });

    /* ---------- EMAIL TO ADMIN ---------- */
    if (process.env.ADMIN_EMAIL) {
      try {
        await sendEmail({
          to: process.env.ADMIN_EMAIL,
          subject: `📩 New Contact Message: ${subject}`,
          html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>New Contact Message</title>
</head>

<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 0;">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 5px 20px rgba(0,0,0,0.08);">

<!-- HEADER -->
<tr>
<td style="background:#111827;padding:20px;text-align:center;color:white;">
<h2 style="margin:0;font-size:20px;">🚗 Driver Booking Admin</h2>
<p style="margin:5px 0 0;font-size:13px;opacity:0.8;">New Contact Message Received</p>
</td>
</tr>

<!-- CONTENT -->
<tr>
<td style="padding:30px;">

<table width="100%" cellpadding="8" cellspacing="0" style="font-size:14px;color:#374151;">
<tr>
<td><strong>Name:</strong></td>
<td>${name}</td>
</tr>

<tr style="background:#f9fafb;">
<td><strong>Email:</strong></td>
<td>${email}</td>
</tr>

<tr>
<td><strong>Subject:</strong></td>
<td>${subject}</td>
</tr>
</table>

<div style="margin-top:20px;padding:15px;background:#f3f4f6;border-radius:8px;">
<p style="margin:0;font-weight:bold;">Message:</p>
<p style="margin-top:8px;color:#4b5563;">${message}</p>
</div>

</td>
</tr>

<!-- FOOTER -->
<tr>
<td style="background:#f9fafb;text-align:center;padding:15px;font-size:12px;color:#9ca3af;">
This message was submitted from your Driver Booking website.
</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`,
        });
      } catch (mailErr) {
        console.error("Admin email failed:", mailErr.message);
        // ❗ intentionally not failing request
      }
    } else {
      console.warn("ADMIN_EMAIL not configured");
    }

    /* ---------- AUTO REPLY TO USER ---------- */
    if (email) {
      try {
        await sendEmail({
          to: email,
          subject: "We received your message ✔",
          html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Message Received</title>
</head>

<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 0;">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 5px 20px rgba(0,0,0,0.08);">

<!-- HEADER -->
<tr>
<td style="background:#16a34a;padding:25px;text-align:center;color:white;">
<h2 style="margin:0;">🚗 Driver Booking</h2>
<p style="margin:8px 0 0;font-size:14px;opacity:0.9;">We've Received Your Message ✔</p>
</td>
</tr>

<!-- CONTENT -->
<tr>
<td style="padding:30px;">

<p style="font-size:16px;margin-top:0;">Hi ${name},</p>

<p style="color:#4b5563;line-height:1.6;">
Thank you for reaching out to <strong>Driver Booking</strong>.
Our support team has received your message and will respond within
<strong>24 hours</strong>.
</p>

<div style="margin-top:20px;padding:15px;background:#f3f4f6;border-radius:8px;">
<p style="margin:0;font-weight:bold;">Your Message:</p>
<p style="margin-top:8px;color:#4b5563;">${message}</p>
</div>

<!-- CTA BUTTON -->
<div style="text-align:center;margin-top:30px;">
<a href="https://yourwebsite.com"
style="
display:inline-block;
padding:12px 25px;
background:#16a34a;
color:white;
text-decoration:none;
border-radius:6px;
font-weight:bold;
font-size:14px;
">
Book a Ride
</a>
</div>

</td>
</tr>

<!-- FOOTER -->
<tr>
<td style="background:#f9fafb;text-align:center;padding:20px;font-size:12px;color:#9ca3af;">
<p style="margin:0;">Driver Booking Support Team</p>
<p style="margin:5px 0 0;">support@yourwebsite.com</p>
</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`,
        });
      } catch (mailErr) {
        console.error("User auto-reply failed:", mailErr.message);
      }
    }

    /* ---------- FINAL RESPONSE ---------- */
    res.status(200).json({
      success: true,
      message: "Message sent successfully",
      data: contact,
    });
  } catch (err) {
    console.error("Contact controller error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to send contact message",
    });
  }
};

/* ================= LIST CONTACT MESSAGES (ADMIN) ================= */
export const listContactMessages = async (req, res) => {
  try {
    const list = await ContactMessage.find()
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      data: list,
    });
  } catch (err) {
    console.error("List contact error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load contact messages",
    });
  }
};
