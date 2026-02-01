import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/waiting",
});

export const startWaiting = (rideId) =>
  API.post(
    "/start",
    { rideId },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

export const endWaiting = (rideId) =>
  API.post(
    "/end",
    { rideId },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
