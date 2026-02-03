import KYC from "../models/KYC.model.js";

/**
 * Submit / Update KYC
 */
export const submitKYC = async (req, res) => {
  const data = {
    userId: req.user._id,
    aadhaarNumber: req.body.aadhaarNumber,
    panNumber: req.body.panNumber,
    licenseNumber: req.body.licenseNumber,
        licenseExpiry: req.body.licenseExpiry || null,
    criminalOffence: req.body.criminalOffence || "None",
    address: req.body.address,

    aadhaarImage: req.files.aadhaarImage?.[0]?.path,
    panImage: req.files.panImage?.[0]?.path,
    licenseImage: req.files.licenseImage?.[0]?.path,
    driverPhoto: req.files.driverPhoto?.[0]?.path,

    status: "submitted",
  };

  const kyc = await KYC.findOneAndUpdate(
    { userId: req.user._id },
    data,
    { upsert: true, new: true }
  );

  res.json({
    success: true,
    message: "KYC submitted successfully",
    data: kyc,
  });
};

/**
 * Get KYC Status
 */
export const getKYCStatus = async (req, res) => {
  const kyc = await KYC.findOne({ userId: req.user._id });

  res.json({
    success: true,
    data: kyc,
  });
};
