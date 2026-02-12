import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/payments`,
});

/* ================= CREATE ORDER ================= */
export const createPaymentOrder = (rideId) =>
  API.post(
    "/create-order",
    { rideId },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

/* ================= VERIFY PAYMENT ================= */
export const verifyPayment = (data) =>
  API.post("/verify", data, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });


