import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/driver",
});

export const toggleDriverStatus = (data) =>
  API.post("/status", data, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

export const getRideRequest = () =>
  API.get("/ride-request", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

export const acceptRide = (rideId) =>
  API.put(
    `/ride/${rideId}/accept`,
    {},
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

export const rejectRide = (rideId) =>
  API.put(
    `/ride/${rideId}/reject`,
    {},
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
