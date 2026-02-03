// src/services/driver.api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/driver",
});

/**
 * 🔐 Attach JWT token to every request automatically
 */
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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

/* ✅ FIXED */
export const getDriverAnalytics = (type) =>
  API.get(`/analytics?type=${type}`);


export const getDriverProfile = () =>
  API.get("/profile");

export const updateDriverProfile = (data) =>
  API.put("/profile", data);

export const updateDriverBankDetails = (data) =>
  API.put("/bank-details", data);

// ✅ DRIVER PROFILE PHOTO UPLOAD (NEW)
export const uploadDriverProfilePhoto = (formData) =>
  API.put("/profile/photo", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
