import KYC from "../models/KYC.model.js";
import UserModel from "../models/User.model.js";
import { sendEmail } from "../utils/sendEmail.js";
// View driver's full KYC
export const getDriverKYC = async (req, res) => {
  const { driverId } = req.params;

  const kyc = await KYC.findOne({ userId: driverId }).populate(
    "userId",
    "name email mobile"
  );

  if (!kyc) return res.status(404).json({ message: "KYC not found" });

  res.json({ success: true, data: kyc });
};



export const updateDriverKYC = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    const kyc = await KYC.findOne({ userId: id }).populate("userId");

    if (!kyc) {
      return res.status(404).json({ message: "KYC not found" });
    }

    kyc.status = status;

    if (status === "rejected") {
      kyc.rejectReason = reason;
    }

    await kyc.save();

    const driver = await UserModel.findById(id);

    if (status === "approved") {
      await sendEmail({
        to: driver.email,
        subject: "KYC Approved",
        html: `
          <h3>Hello ${driver.name},</h3>
          <p>Your KYC has been <b style="color:green">APPROVED</b> successfully.</p>
          <p>You can now access all driver features.</p>
          <br/>
          <p>Thanks,<br/>Driver Booking Team</p>
        `,
      });
    }

    if (status === "rejected") {
        try {
            await sendEmail({
              to: driver.email,
              subject: "KYC Rejected",
              html: `
                <h3>Hello ${driver.name},</h3>
                <p>Your KYC has been <b style="color:red">REJECTED</b>.</p>
                <p><b>Reason:</b> ${reason}</p>
                <p>Please update your documents and resubmit.</p>
                <br/>
                <p>Thanks,<br/>Driver Booking Team</p>
              `,
            });
            
        } catch (error) {
            console.log(error)
        }
    }
    res.json({ success: true });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


