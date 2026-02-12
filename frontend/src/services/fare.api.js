import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/fare`,
});

/* ================= FARE ESTIMATE ================= */
export const getFareEstimate = (data) =>
  API.post("/estimate", data, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
