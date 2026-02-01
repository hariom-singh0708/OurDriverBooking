import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/history",
});

export const getClientHistory = () =>
  API.get("/client", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

export const getDriverHistory = () =>
  API.get("/driver", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
