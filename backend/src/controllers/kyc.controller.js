import KYC from "../models/KYC.model.js";
import { sendEmail } from "../utils/sendEmail.js";
import User from "../models/User.model.js";

/**
 * Submit / Update KYC
 */
export const submitKYC = async (req, res) => {
  try {
    const userId = req.user._id;

    /* ================= BASIC VALIDATION ================= */

    const {
      aadhaarNumber,
      panNumber,
      licenseNumber,
      licenseExpiry,
      hasCriminalRecord,
      criminalOffenceDetails,
      address,
    } = req.body;

    if (!aadhaarNumber || !panNumber || !licenseNumber || !address) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled",
      });
    }

    // Aadhaar: 12 digits
    if (!/^\d{12}$/.test(aadhaarNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Aadhaar number",
      });
    }

    // PAN: 5 letters + 4 digits + 1 letter
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid PAN number",
      });
    }

    /* ================= DUPLICATE CHECK ================= */

    const existingKYC = await KYC.findOne({
      $or: [{ aadhaarNumber }, { panNumber }],
      userId: { $ne: userId },
    });

    if (existingKYC) {
      return res.status(400).json({
        success: false,
        message: "Aadhaar or PAN already registered",
      });
    }

    /* ================= PREVENT OVERWRITE IF APPROVED ================= */

    const current = await KYC.findOne({ userId });

    if (current?.status === "approved") {
      return res.status(400).json({
        success: false,
        message: "Approved KYC cannot be modified",
      });
    }

    /* ================= PREPARE UPDATE DATA ================= */

    const updateData = {
      userId,
      aadhaarNumber,
      panNumber,
      licenseNumber,
      licenseExpiry: licenseExpiry || null,
      hasCriminalRecord: hasCriminalRecord || "no",
      criminalOffenceDetails:
        hasCriminalRecord === "yes" ? criminalOffenceDetails : "",
      address,
      status: "submitted",
      submittedAt: new Date(),
    };

    // Only update images if uploaded
    if (req.files?.aadhaarImage?.[0]?.path)
      updateData.aadhaarImage = req.files.aadhaarImage[0].path;

    if (req.files?.panImage?.[0]?.path)
      updateData.panImage = req.files.panImage[0].path;

    if (req.files?.licenseImage?.[0]?.path)
      updateData.licenseImage = req.files.licenseImage[0].path;

    if (req.files?.driverPhoto?.[0]?.path)
      updateData.driverPhoto = req.files.driverPhoto[0].path;

    const kyc = await KYC.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { upsert: true, new: true }
    );

    /* ================= ADMIN EMAIL (NON-BLOCKING) ================= */

    (async () => {
      try {
        const driver = await User.findById(userId);

        await sendEmail({
          to: process.env.ADMIN_EMAIL,
          subject: "🚨 New / Updated Driver KYC Submission",
          html: getAdminKYCTemplate(driver, updateData),
        });
      } catch (mailErr) {
        console.error("⚠️ Admin mail failed:", mailErr.message);
      }
    })();

    return res.json({
      success: true,
      message: "KYC submitted successfully",
      data: kyc,
    });
  } catch (err) {
    console.error("❌ KYC SUBMIT ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "KYC submission failed",
    });
  }
};

/**
 * Get KYC Status
 */
export const getKYCStatus = async (req, res) => {
  try {
    const kyc = await KYC.findOne({ userId: req.user._id });
    return res.json({ success: true, data: kyc });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch KYC status",
    });
  }
};


const getAdminKYCTemplate = (driver, data) => `
  <div style="font-family:Arial;padding:20px;background:#f4f6f9">
    <div style="max-width:600px;margin:auto;background:#fff;padding:25px;border-radius:10px">

      <h2 style="color:#111">🚗 Driver KYC Submitted</h2>

      <table style="width:100%;margin-top:20px;border-collapse:collapse">
        <tr>
          <td><strong>Name:</strong></td>
          <td>${driver?.name}</td>
        </tr>
        <tr>
          <td><strong>Email:</strong></td>
          <td>${driver?.email}</td>
        </tr>
        <tr>
          <td><strong>License:</strong></td>
          <td>${data.licenseNumber}</td>
        </tr>
        <tr>
          <td><strong>Aadhaar:</strong></td>
          <td>${data.aadhaarNumber}</td>
        </tr>
        <tr>
          <td><strong>PAN:</strong></td>
          <td>${data.panNumber}</td>
        </tr>
        <tr>
          <td><strong>Criminal Record:</strong></td>
          <td>${
            data.hasCriminalRecord === "yes"
              ? data.criminalOffenceDetails
              : "No"
          }</td>
        </tr>
      </table>

      <p style="margin-top:20px">
        Status automatically set to <b>SUBMITTED</b>.  
        Please review and approve/reject in admin panel.
      </p>

    </div>
  </div>
`;
