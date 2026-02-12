import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

const {
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS,
  NODE_ENV,
} = process.env;

if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS) {
  console.warn("⚠️ Email service not fully configured");
}

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: Number(EMAIL_PORT),
  secure: Number(EMAIL_PORT) === 465, // 465 = true, 587 = false
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // 🔥 prevents Gmail TLS close issue
  },
  connectionTimeout: 10000,
});

/* ❌ REMOVE VERIFY (Not needed in production) */
// Gmail often closes idle verify connection

export const sendEmail = async ({ to, subject, html }) => {
  if (!to || !subject || !html) {
    throw new Error("Invalid email parameters");
  }

  try {
    const info = await transporter.sendMail({
      from: `"Driver Booking" <${EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    if (NODE_ENV === "development") {
      console.log("📧 Mail sent:", info.messageId);
    }

    return info;
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    throw error;
  }
};
