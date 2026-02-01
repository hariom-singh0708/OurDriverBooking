import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/sos",
});

export const triggerSOS = (rideId) =>
  API.post(
    "/",
    { rideId },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
