const otpStore = new Map();

export const generateOTP = (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email, otp);

  setTimeout(() => otpStore.delete(email), 5 * 60 * 1000); // 5 min expiry
  console.log("OTP:", otp); // (Email service later)
  return otp;
};

export const verifyOTP = (email, otp) => {
  return otpStore.get(email) === otp;
};
