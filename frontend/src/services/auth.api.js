import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/auth`,
});
export const signupEmail = (email) =>
  API.post("/signup", { email });

export const verifySignupOTP = (data) =>
  API.post("/verify-otp", data);

export const loginUser = (data) =>
  API.post("/login", data);

export const getMe = (token) =>
  API.get("/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const sendLoginOTP = (email) =>
  API.post("/login-otp", { email });
