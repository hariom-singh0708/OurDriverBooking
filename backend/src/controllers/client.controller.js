import User from "../models/User.model.js";
import Ride from "../models/Ride.model.js";
import cloudinary from "../config/cloudinary.js";

/**
 * GET /client/profile
 */
export const getClientProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  // 🔥 REAL-TIME CLIENT RATING (from rides)
  const ratedRides = await Ride.find({
    clientId: req.user._id,
    "clientRating.rating": { $gt: 0 },
  });

  const totalRatings = ratedRides.length;

  const average =
    totalRatings === 0
      ? 0
      : ratedRides.reduce(
          (sum, r) => sum + r.clientRating.rating,
          0
        ) / totalRatings;

  res.json({
    success: true,
    data: {
      ...user.toObject(),
      rating: {
        average: Number(average.toFixed(1)),
        totalRatings,
      },
    },
  });
};


/**
 * GET /client/rides
 */
export const getClientRides = async (req, res) => {
  const rides = await Ride.find({ clientId: req.user._id })
    .sort({ createdAt: -1 }); // 🔥 newest first

  res.json({
    success: true,
    data: rides,
  });
};

/* ===================================================== */
/* ✅ ADD: UPDATE PROFILE PHOTO */
/* ===================================================== */
export const updateProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        profileImage: req.file.path,        // ✅ Cloudinary URL
        profileImageId: req.file.filename,  // ✅ public_id (important for delete)
      },
      { new: true }
    ).select("-password");

    res.json({
      success: true,
      message: "Profile photo updated",
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
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
  try {
    const { rideId, rating, feedback } = req.body;

    /* ✅ BASIC VALIDATION */
    if (!rideId || !rating) {
      return res.status(400).json({
        success: false,
        message: "RideId and rating are required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    /* ✅ FIND RIDE */
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found",
      });
    }

    /* ✅ ONLY CLIENT CAN RATE */
    if (ride.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    /* ✅ RIDE MUST BE COMPLETED */
    if (ride.status !== "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "Ride not completed yet",
      });
    }

    /* ✅ PREVENT DOUBLE RATING */
    if (ride.clientRating?.rating) {
      return res.status(400).json({
        success: false,
        message: "Ride already rated",
      });
    }

    /* ✅ SAVE RATING IN RIDE */
    ride.clientRating = {
      rating,
      feedback: feedback?.trim() || "",
      ratedAt: new Date(),
    };
    await ride.save();

    /* ✅ UPDATE DRIVER RATING (SAFE WAY ❗) */
    const driver = await User.findById(ride.driverId);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    const totalRatings = driver.rating?.totalRatings || 0;
    const avgRating = driver.rating?.average || 0;

    const newTotal = totalRatings + 1;
    const newAverage =
      (avgRating * totalRatings + rating) / newTotal;

    // 🔥 SAFE UPDATE (NO FULL VALIDATION)
    await User.findByIdAndUpdate(
      ride.driverId,
      {
        $set: {
          rating: {
            average: Number(newAverage.toFixed(1)),
            totalRatings: newTotal,
          },
        },
      },
      { new: true }
    );

    return res.json({
      success: true,
      message: "Rating submitted successfully",
      data: {
        rating: Number(newAverage.toFixed(1)),
        totalRatings: newTotal,
      },
    });

  } catch (error) {
    console.error("RATE DRIVER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

/* ===================================================== */
/* ❌ DELETE CLIENT ACCOUNT (WIPE DATA) */
/* ===================================================== */
export const deleteClientAccount = async (req, res) => {
  try {
    const clientId = req.user._id;

    // 🔐 SAFETY: Block if active ride exists
    const activeRide = await Ride.findOne({
      clientId,
      status: { $in: ["PENDING", "ACCEPTED", "ON_RIDE", "DRIVER_ARRIVED"] },
    });

    if (activeRide) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete account with an active ride",
      });
    }

    // ☁️ DELETE PROFILE IMAGE FROM CLOUDINARY (IF EXISTS)
    const user = await User.findById(clientId);

    if (user?.profileImageId) {
      try {
        await cloudinary.uploader.destroy(user.profileImageId);
      } catch (err) {
        console.warn("Cloudinary delete failed:", err.message);
      }
    }

    // ❌ DELETE USER (CLIENT)
    await User.findByIdAndDelete(clientId);

    return res.json({
      success: true,
      message: "Client account deleted permanently",
    });
  } catch (error) {
    console.error("CLIENT DELETE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete account",
    });
  }
};
