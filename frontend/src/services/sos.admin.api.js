import axios from "axios";

const API = "http://localhost:5000/admin";

const auth = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const getSOSList = async () => {
  const { data } = await axios.get(`${API}/sos`, auth());
  return data;
};

export const resolveSOS = async (id) => {
  const { data } = await axios.patch(`${API}/sos/${id}/resolve`, {}, auth());
  return data;
};
