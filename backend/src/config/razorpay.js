import Razorpay from "razorpay";
import User from "../models/User.model.js";

/* ================= ENV VALIDATION ================= */

const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  throw new Error("❌ Razorpay keys are missing in environment variables");
}

/* ================= INSTANCE ================= */

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

/* ================= FUND ACCOUNT LOGIC ================= */

export async function getOrCreateFundAccount(driverDoc) {
  try {
    if (!driverDoc?._id) {
      throw new Error("Invalid driver document");
    }

    // Always fetch fresh copy
    const driver = await User.findById(driverDoc._id);
    if (!driver) {
      throw new Error("Driver not found");
    }

    driver.payout ??= {};
    driver.payout.bank ??= {};
    driver.payout.upi ??= {};

    /* ===== 1️⃣ Contact Create / Reuse ===== */

    if (!driver.payout.razorpayContactId) {
      const contact = await razorpay.contacts.create({
        name: driver.name || "Driver",
        type: "employee",
        contact: driver.mobile,
        email: driver.email,
      });

      driver.payout.razorpayContactId = contact.id;
    }

    const contactId = driver.payout.razorpayContactId;

    /* ===== 2️⃣ Bank Fund Account ===== */

    const hasBank =
      driver.payout.bank.accountNumber &&
      driver.payout.bank.ifsc &&
      driver.payout.bank.name;

    if (hasBank && !driver.payout.razorpayFundAccountIdBank) {
      const faBank = await razorpay.fundAccount.create({
        contact_id: contactId,
        account_type: "bank_account",
        bank_account: {
          name: driver.payout.bank.name,
          ifsc: driver.payout.bank.ifsc,
          account_number: driver.payout.bank.accountNumber,
        },
      });

      driver.payout.razorpayFundAccountIdBank = faBank.id;
    }

    /* ===== 3️⃣ UPI Fund Account ===== */

    const hasUpi = driver.payout.upi.vpa;

    if (hasUpi && !driver.payout.razorpayFundAccountIdVpa) {
      const faVpa = await razorpay.fundAccount.create({
        contact_id: contactId,
        account_type: "vpa",
        vpa: { address: driver.payout.upi.vpa },
      });

      driver.payout.razorpayFundAccountIdVpa = faVpa.id;
    }

    await driver.save();

    /* ===== Return Priority ===== */

    if (driver.payout.razorpayFundAccountIdBank) {
      return {
        id: driver.payout.razorpayFundAccountIdBank,
        account_type: "bank_account",
      };
    }

    if (driver.payout.razorpayFundAccountIdVpa) {
      return {
        id: driver.payout.razorpayFundAccountIdVpa,
        account_type: "vpa",
      };
    }

    throw new Error("No bank/UPI details found for driver");

  } catch (error) {
    console.error("❌ Razorpay fund account error:", error.message);
    throw error; // Let controller handle response
  }
}

export default razorpay;
