import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const authHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

/* ================= ADMIN DASHBOARD ================= */

export const toggleSurge = async (type) => {
  const { data } = await axios.post(
    `${API_BASE}/admin/toggle-surge`,
    { type },
    authHeaders()
  );
  return data;
};

export const getSurgeStatus = async () => {
  const { data } = await axios.get(
    `${API_BASE}/admin/surge-status`,
    authHeaders()
  );
  return data;
};


export const getAdminStats = async () => {
  const { data } = await axios.get(
    `${API_BASE}/admin/stats`,
    authHeaders()
  );
  return data;
};

export const getAdminDrivers = async (params = {}) => {
  const { data } = await axios.get(
    `${API_BASE}/admin/drivers`,
    {
      ...authHeaders(),
      params,
    }
  );
  return data;
};

export const getAdminRides = async (params = {}) => {
  const { data } = await axios.get(
    `${API_BASE}/admin/rides`,
    {
      ...authHeaders(),
      params,
    }
  );
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

export const getAdminProfile = async () => {
  const { data } = await axios.get(
    `${API_BASE}/admin/profile`,
    authHeaders()
  );
  return data;
};

/* ================= ADMIN KYC ================= */

// ✅ Get driver KYC
export const getDriverKYC = async (driverId) => {
  const { data } = await axios.get(
    `${API_BASE}/admin/drivers/${driverId}/kyc`,
    authHeaders()
  );
  return data;
};

// ✅ Update KYC status (approve / reject)
export const updateDriverKYC = async (driverId, payload) => {
  const { data } = await axios.patch(
    `${API_BASE}/admin/drivers/${driverId}/kyc`,
    payload,
    authHeaders()
  );
  return data;
};


export const getAdminSupportRequests = async () => {
  const { data } = await axios.get(
    `${API_BASE}/admin/support`,
    authHeaders()
  );
  return data;
};

export const resolveSupportTicket = async (id) => {
  const { data } = await axios.patch(
    `${API_BASE}/admin/support/${id}/resolve`,
    {},
    authHeaders()
  );
  return data;
};

