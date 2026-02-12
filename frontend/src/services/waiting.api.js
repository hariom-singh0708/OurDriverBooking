import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/waiting`,
});

/* ================= START WAITING ================= */
export const startWaiting = (rideId) =>
  API.post(
    "/start",
    { rideId },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

/* ================= END WAITING ================= */
export const endWaiting = (rideId) =>
  API.post(
    "/end",
    { rideId },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
