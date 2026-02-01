import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOTPEmail = async (to, otp, purpose) => {
  await transporter.sendMail({
    from: `"Driver Booking App" <${process.env.EMAIL_USER}>`,
    to,
    subject: `${purpose} OTP`,
    html: `
      <h2>${purpose} Verification</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>Valid for 5 minutes</p>
    `,
  });
};
