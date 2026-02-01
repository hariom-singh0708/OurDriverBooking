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
