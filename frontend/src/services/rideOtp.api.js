import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/rides",
});

export const markArrived = (rideId) =>
  API.put(
    `/${rideId}/arrived`,
    {},
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

export const verifyRideOTP = (rideId, otp) =>
  API.put(
    `/${rideId}/verify-otp`,
    { otp },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
