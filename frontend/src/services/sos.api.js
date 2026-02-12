import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/sos`,
});

/* ================= TRIGGER SOS ================= */
export const triggerSOS = (rideId) =>
  API.post(
    "/",
    { rideId },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
