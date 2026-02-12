// src/services/driver.api.js
import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/driver`,
});

/**
 * 🔐 Attach JWT token to every request automatically
 */
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (!token) {
      return Promise.reject("No token found");
    }

    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);


/* ================== DRIVER APIs ================== */

export const toggleDriverStatus = (data) =>
  API.post("/toggle-status", data);

export const getDriverStatus = () =>
  API.get("/status");

export const getRideRequest = () =>
  API.get("/ride-request");

export const acceptRide = (rideId) =>
  API.put(`/ride/${rideId}/accept`);

export const rejectRide = (rideId) =>
  API.put(`/ride/${rideId}/reject`);

export const getDriverAnalytics = (type) =>
  API.get(`/analytics?type=${type}`);

export const getDriverProfile = () =>
  API.get("/profile");

export const updateDriverProfile = (data) =>
  API.put("/profile", data);

export const updateDriverBankDetails = (data) =>
  API.put("/bank-details", data);

// 🆘 DRIVER SUPPORT
export const sendDriverSupport = (data) =>
  API.post("/support", data);

export const uploadDriverProfilePhoto = (formData) =>
  API.put("/profile/photo", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

/* ================== ❌ DANGER ZONE ================== */
/**
 * 🗑 Permanently delete driver account
 * This will wipe profile, bank data, access tokens
 */
export const deleteDriverAccount = () =>
  API.delete("/account");
