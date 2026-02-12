import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/kyc`,
});

/* ================= SUBMIT KYC ================= */
export const submitKYC = (formData) =>
  API.post("/", formData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

/* ================= GET KYC STATUS ================= */
export const getKYCStatus = () =>
  API.get("/", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
