import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/history`,
});

/* ================= CLIENT HISTORY ================= */
export const getClientHistory = () =>
  API.get("/client", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

/* ================= DRIVER HISTORY ================= */
export const getDriverHistory = () =>
  API.get("/driver", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
