// ================= FARE CONSTANTS =================
export const BASE_FARE = 100;
export const PER_KM_RATE = 12;
export const PER_MIN_RATE = 1.5;
export const PER_HOUR_RATE = 120;
export const WAITING_RATE_PER_MIN = 2;
export const MINIMUM_FARE = 120;
export const TWO_WAY_MULTIPLIER = 1.5;
export const ONE_WAY_MULTIPLIER = 1.25;

// ================= SURGE STATE (GLOBAL MEMORY) =================
let surgeState = {
  peakEnabled: false,
  festivalEnabled: false,
};

// ================= SURGE CONTROLS =================
export const setSurgeMode = (type) => {
  if (type === "peak") {
    surgeState.peakEnabled = !surgeState.peakEnabled;

    // Festival ko off kar do
    if (surgeState.peakEnabled) {
      surgeState.festivalEnabled = false;
    }
  }

  if (type === "festival") {
    surgeState.festivalEnabled = !surgeState.festivalEnabled;

    // Peak ko off kar do
    if (surgeState.festivalEnabled) {
      surgeState.peakEnabled = false;
    }
  }

  return surgeState;
};

export const getSurgeMode = () => surgeState;

// ================= HELPER =================
const round2 = (num) => Math.round(num * 100) / 100;

// ================= FARE CALCULATION =================
export const calculateFare = ({
  bookingType,
  distance = 0,
  duration = 0,
  bookingDuration = 0,
  rideType,
  waitingTime = 0,
}) => {

  distance = Number(distance) || 0;
  duration = Number(duration) || 0;
  bookingDuration = Number(bookingDuration) || 0;
  waitingTime = Number(waitingTime) || 0;

  let fare = BASE_FARE;

  let breakdown = {
    baseFare: round2(BASE_FARE),
    distanceFare: 0,
    timeFare: 0,
    waitingCharge: 0,
    surgeMultiplier: 1,
    totalFare: 0,
  };

  // -------- Distance Based --------
  if (bookingType === "distance_based") {
    breakdown.distanceFare = round2(distance * PER_KM_RATE);
    breakdown.timeFare = round2(duration * PER_MIN_RATE);
    fare += breakdown.distanceFare + breakdown.timeFare;
  }

  // -------- Time Based --------
  if (bookingType === "time_based") {
    breakdown.timeFare = round2(bookingDuration * PER_HOUR_RATE);
    fare += breakdown.timeFare;
  }

  // -------- Waiting --------
  if (waitingTime > 0) {
    breakdown.waitingCharge = round2(waitingTime * WAITING_RATE_PER_MIN);
    fare += breakdown.waitingCharge;
  }

  // -------- Ride Type --------
  if (rideType === "one-way") {
    fare *= ONE_WAY_MULTIPLIER;
  }

  if (rideType === "two-way") {
    fare *= TWO_WAY_MULTIPLIER;
  }

  // ================= APPLY SURGE (Peak or Festival) =================
  let surgeMultiplier = 1;

  if (surgeState.festivalEnabled) {
    surgeMultiplier = 1.5; // 50% increase
  } else if (surgeState.peakEnabled) {
    surgeMultiplier = 1.3; // 30% increase
  }

  fare *= surgeMultiplier;
  breakdown.surgeMultiplier = surgeMultiplier;

  fare = round2(fare);

  if (fare < MINIMUM_FARE) {
    fare = MINIMUM_FARE;
  }

  breakdown.totalFare = fare;

  return breakdown;
};
