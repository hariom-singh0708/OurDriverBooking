export const BASE_FARE = 100;
export const PER_KM_RATE = 15;
export const PER_HOUR_RATE = 120;
export const WAITING_RATE_PER_MIN = 2;

export const calculateFare = ({
  bookingType,
  distance,
  bookingDuration,
  rideType,
  waitingTime,
}) => {
  let fare = BASE_FARE;

  let breakdown = {
    baseFare: BASE_FARE,
    distanceFare: 0,
    timeFare: 0,
    waitingCharge: 0,
    totalFare: 0,
  };

  if (bookingType === "distance_based") {
    breakdown.distanceFare = distance * PER_KM_RATE;
    fare += breakdown.distanceFare;
  }

  if (bookingType === "time_based") {
    breakdown.timeFare = bookingDuration * PER_HOUR_RATE;
    fare += breakdown.timeFare;
  }

  if (rideType === "two-way" && waitingTime) {
    breakdown.waitingCharge = waitingTime * WAITING_RATE_PER_MIN;
    fare += breakdown.waitingCharge;
  }

  breakdown.totalFare = fare;
  return breakdown;
};
