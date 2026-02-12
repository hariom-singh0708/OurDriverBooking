import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/rides`,
});

/* ================= MARK ARRIVED ================= */
export const markArrived = (rideId) =>
  API.put(
    `/${rideId}/arrived`,
    {},
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

/* ================= VERIFY OTP ================= */
export const verifyRideOTP = (rideId, otp) =>
  API.put(
    `/${rideId}/verify-otp`,
    { otp },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
