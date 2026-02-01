import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/chat",
});

export const sendMessage = (data) =>
  API.post("/", data, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

export const getChatHistory = (rideId) =>
  API.get(`/${rideId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
