import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/kyc",
});

export const submitKYC = (formData) =>
  API.post("/", formData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

export const getKYCStatus = () =>
  API.get("/", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
