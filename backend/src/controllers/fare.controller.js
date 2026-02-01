import { calculateFare } from "../services/fare.service.js";

export const getFareEstimate = async (req, res) => {
  const {
    bookingType,
    distance,
    bookingDuration,
    rideType,
    waitingTime,
  } = req.body;

  const fare = calculateFare({
    bookingType,
    distance,
    bookingDuration,
    rideType,
    waitingTime,
  });

  res.json({
    success: true,
    message: "Fare calculated successfully",
    data: fare,
  });
};
