import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/fare",
});

export const getFareEstimate = (data) =>
  API.post("/estimate", data, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
