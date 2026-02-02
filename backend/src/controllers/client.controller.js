import User from "../models/User.model.js";
import Ride from "../models/Ride.model.js";
import cloudinary from "../config/cloudinary.js";

/**
 * GET /client/profile
 */
export const getClientProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  res.json({
    success: true,
    data: user,
  });
};

/**
 * GET /client/rides
 */
export const getClientRides = async (req, res) => {
  const rides = await Ride.find({ clientId: req.user._id });

  res.json({
    success: true,
    data: rides,
  });
};

/* ===================================================== */
/* ✅ ADD: UPDATE PROFILE PHOTO */
/* ===================================================== */
export const updateProfilePhoto = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No image uploaded" });
  }

  const result = await cloudinary.uploader.upload(req.file.path, {
    folder: "user_profiles",
  });

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { profileImage: result.secure_url },
    { new: true }
  ).select("-password");

  res.json({
    success: true,
    message: "Profile photo updated",
    data: user,
  });
};

/* ===================================================== */
/* ✅ ADD: UPDATE SAVED ADDRESSES */
/* ===================================================== */
export const updateSavedAddresses = async (req, res) => {
  const { addresses } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { savedAddresses: addresses },
    { new: true }
  ).select("-password");

  res.json({
    success: true,
    message: "Saved addresses updated",
    data: user,
  });
};

// PUT /client/profile
export const updateClientProfile = async (req, res) => {
  const updated = await User.findByIdAndUpdate(
    req.user._id,
    req.body,
    { new: true }
  ).select("-password");

  res.json({
    success: true,
    data: updated,
  });
};

/* ===================================================== */
/* ✅ RATE DRIVER (AFTER RIDE COMPLETED) */
/* ===================================================== */
export const rateDriver = async (req, res) => {
  const { rideId, rating, feedback } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      message: "Rating must be between 1 and 5",
    });
  }

  const ride = await Ride.findById(rideId);

  if (!ride) {
    return res.status(404).json({
      success: false,
      message: "Ride not found",
    });
  }

  if (ride.clientId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized",
    });
  }

  if (ride.status !== "COMPLETED") {
    return res.status(400).json({
      success: false,
      message: "Ride not completed yet",
    });
  }

  if (ride.clientRating?.rating) {
    return res.status(400).json({
      success: false,
      message: "Ride already rated",
    });
  }

  /* SAVE RATING IN RIDE */
  ride.clientRating = {
    rating,
    feedback,
    ratedAt: new Date(),
  };
  await ride.save();

  /* UPDATE CLIENT AVERAGE RATING */
  const user = await User.findById(req.user._id);

  const total = user.rating?.totalRatings || 0;
  const avg = user.rating?.average || 0;

  const newTotal = total + 1;
  const newAverage =
    (avg * total + rating) / newTotal;

  user.rating = {
    average: Number(newAverage.toFixed(1)),
    totalRatings: newTotal,
  };

  await user.save();

  res.json({
    success: true,
    message: "Rating submitted successfully",
    data: {
      averageRating: user.rating.average,
      totalRatings: user.rating.totalRatings,
    },
  });
};
