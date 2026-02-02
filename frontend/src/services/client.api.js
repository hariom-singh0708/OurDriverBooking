import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/client",
});

export const getClientProfile = () =>
  API.get("/profile", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

export const getClientRides = () =>
  API.get("/rides", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

export const uploadProfilePhoto = (formData) =>
  API.put("/profile/photo", formData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "multipart/form-data",
    },
  });

/* ✅ FIXED ENDPOINT */
export const updateSavedAddresses = (data) =>
  API.put("/profile/addresses", data, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

export const updateClientProfile = (data) =>
  API.put("/profile", data, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  /* ================= RATE DRIVER ================= */
export const rateDriver = (data) =>
  API.post("/rate-driver", data, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
