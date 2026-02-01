import axios from "axios";

const API_BASE = "http://localhost:5000";

const auth = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const getAllSOS = async () => {
  const { data } = await axios.get(`${API_BASE}/admin/sos`, auth());
  return data; // { success, data }
};

export const resolveSOS = async (id) => {
  const { data } = await axios.patch(`${API_BASE}/admin/sos/${id}/resolve`, {}, auth());
  return data;
};
