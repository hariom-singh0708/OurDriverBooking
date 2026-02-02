import axios from "axios";

const API = "http://localhost:5000/admin";

export const getPayoutHistory = () =>
  axios.get(`${API}/payouts`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });
