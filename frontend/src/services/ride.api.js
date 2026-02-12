import axios from "axios";

/* ================= BASE INSTANCE ================= */
const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/rides`,
});

/* ================= TOKEN INTERCEPTOR ================= */
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ================= GET SINGLE RIDE ================= */
export const getRideById = (rideId) =>
  API.get(`/${rideId}`);

/* ================= CREATE RIDE ================= */
export const createRide = (data) =>
  API.post("/", data);

/* ================= CANCEL RIDE ================= */
export const cancelRide = (rideId, payload = {}) =>
  API.put(`/${rideId}/cancel`, payload);

/* ================= DRIVER ACTIVE RIDE (🔥 IMPORTANT) ================= */
export const getDriverActiveRide = () =>
  API.get("/driver/active");

export const previewFare = (data) =>
  API.post("/preview-fare", data);


/*
Backend route example:
GET /rides/driver/active
*/

/* ================= DRIVER LIVE RIDE ================= */

// ✅ Mark payment received
export const markRidePaymentReceived = (rideId, payload) =>
  API.post(`/${rideId}/payment-received`, payload);

// ✅ Complete ride
export const completeRideByDriver = (rideId) =>
  API.post(`/${rideId}/complete`);

/* ================= PAYMENTS ================= */

const PAYMENT_API = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/payments`,
});

PAYMENT_API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const createPaymentOrder = (rideId) =>
  PAYMENT_API.post("/create-order", { rideId });

export const verifyPayment = (data) =>
  PAYMENT_API.post("/verify", data);
