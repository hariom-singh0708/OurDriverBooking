import axios from "axios";

const API = `${import.meta.env.VITE_API_BASE_URL}/admin`;

const auth = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

/* ================= GET SOS LIST ================= */
export const getSOSList = async () => {
  const { data } = await axios.get(`${API}/sos`, auth());
  return data;
};

/* ================= RESOLVE SOS ================= */
export const resolveSOS = async (id) => {
  const { data } = await axios.patch(
    `${API}/sos/${id}/resolve`,
    {},
    auth()
  );
  return data;
};
