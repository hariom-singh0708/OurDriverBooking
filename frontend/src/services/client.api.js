import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/client`,
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

export const rateDriver = (data) =>
  API.post("/rate-driver", data, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

// ❌ DELETE CLIENT ACCOUNT
export const deleteClientAccount = () =>
  API.delete("/account", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });