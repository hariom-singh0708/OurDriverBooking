import Razorpay from "razorpay";
import User from "../models/User.model.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function getOrCreateFundAccount(driverDoc) {
  // fresh copy (to save ids)
  const driver = await User.findById(driverDoc._id);

  if (!driver.payout) driver.payout = {};
  if (!driver.payout.bank) driver.payout.bank = {};
  if (!driver.payout.upi) driver.payout.upi = {};

  // 1) Contact create/reuse
  if (!driver.payout.razorpayContactId) {
    const contact = await razorpay.contacts.create({
      name: driver.name,
      type: "employee",
      contact: driver.mobile,
      email: driver.email,
    });
    driver.payout.razorpayContactId = contact.id;
  }

  const contactId = driver.payout.razorpayContactId;

  // 2) Bank fund account (if bank exists)
  const hasBank =
    !!driver.payout.bank.accountNumber && !!driver.payout.bank.ifsc && !!driver.payout.bank.name;

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

  // 3) UPI fund account (if upi exists)
  const hasUpi = !!driver.payout.upi.vpa;

  if (hasUpi && !driver.payout.razorpayFundAccountIdVpa) {
    const faVpa = await razorpay.fundAccount.create({
      contact_id: contactId,
      account_type: "vpa",
      vpa: { address: driver.payout.upi.vpa },
    });
    driver.payout.razorpayFundAccountIdVpa = faVpa.id;
  }

  await driver.save();

  // return best option (bank preferred)
  if (driver.payout.razorpayFundAccountIdBank) {
    return { id: driver.payout.razorpayFundAccountIdBank, account_type: "bank_account" };
  }
  if (driver.payout.razorpayFundAccountIdVpa) {
    return { id: driver.payout.razorpayFundAccountIdVpa, account_type: "vpa" };
  }

  throw new Error("No bank/UPI details found for driver");
}

export default razorpay;
