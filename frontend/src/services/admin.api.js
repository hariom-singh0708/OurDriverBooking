import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const getAdminStats = async () => {
  const { data } = await axios.get(`${API_BASE}/admin/stats`, authHeaders());
  return data; // {success, data}
};

export const getAdminDrivers = async (params = {}) => {
  const { data } = await axios.get(`${API_BASE}/admin/drivers`, {
    ...authHeaders(),
    params,
  });
  return data; // {success, data, pagination}
};

export const getAdminRides = async (params = {}) => {
  const { data } = await axios.get(`${API_BASE}/admin/rides`, {
    ...authHeaders(),
    params,
  });
  return data;
};

export const blockUnblockDriver = async (driverId, payload) => {
  const { data } = await axios.patch(
    `${API_BASE}/admin/drivers/${driverId}/block`,
    payload,
    authHeaders()
  );
  return data;
};

export const getAdminProfile = () =>
  axios.get(`${API_BASE}/admin/profile`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
