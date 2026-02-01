import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/payment",
});

export const createOrder = (rideId) =>
  API.post(
    "/create-order",
    { rideId },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

export const verifyPayment = (data) =>
  API.post("/verify", data, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

export const confirmOfflinePayment = (rideId) =>
  API.post(
    "/offline-confirm",
    { rideId },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
