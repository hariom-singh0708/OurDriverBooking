import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/rides",
});

export const createRide = (data) =>
  API.post("/", data, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

export const cancelRide = (rideId) =>
  API.put(
    `/${rideId}/cancel`,
    {},
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
