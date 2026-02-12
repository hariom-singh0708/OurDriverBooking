import axios from "axios";

const API = `${import.meta.env.VITE_API_BASE_URL}/admin`;

export const getPayoutHistory = () =>
  axios.get(`${API}/payouts`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
