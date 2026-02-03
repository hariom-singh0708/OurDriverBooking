import { useEffect, useState, useContext  } from "react";
import { useNavigate } from "react-router-dom";
import { SocketContext } from "../../context/SocketContext";
import {
  toggleDriverStatus,
  getRideRequest,
  acceptRide,
  rejectRide,
  getDriverStatus,
  getDriverAnalytics,
} from "../../services/driver.api";

import { getKYCStatus } from "../../services/kyc.api";
import RideRequestCard from "../../components/RideRequestCard";
import DriverRideStart from "./DriverRideStart";

/* ===== Small Stat Card ===== */
const StatCard = ({ title, value, color = "text-white" }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
    <p className="text-sm text-slate-400">{title}</p>
    <p className={`text-2xl font-bold mt-1 ${color}`}>
      {value ?? "--"}
    </p>
  </div>
);

export default function DriverDashboard() {
  const navigate = useNavigate();

  const [online, setOnline] = useState(null);
  const [ride, setRide] = useState(null);
  const [kycStatus, setKycStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [analytics, setAnalytics] = useState(null);
  const [period, setPeriod] = useState("today");
const { socket } = useContext(SocketContext);

  /* ================= ANALYTICS ================= */
  useEffect(() => {
    getDriverAnalytics(period).then((res) =>
      setAnalytics(res.data.data)
    );
  }, [period]);

  /* ================= KYC ================= */
  useEffect(() => {
    getKYCStatus().then((res) =>
      setKycStatus(res.data.data?.status)
    );
  }, []);

  /* ================= DRIVER STATUS ================= */
  useEffect(() => {
    const loadStatus = async () => {
      try {
        const res = await getDriverStatus();
        setOnline(res.data.data.isOnline);
      } catch {
        setOnline(false);
      }
    };
    loadStatus();
  }, []);

  /* ================= TOGGLE ================= */
  const toggleStatus = async () => {
    setError("");
    try {
      setLoading(true);
      const res = await toggleDriverStatus({
        isOnline: !online,
        lat: 28.6,
        lng: 77.2,
      });
      setOnline(res.data.data.isOnline);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change status");
    } finally {
      setLoading(false);
    }
  };

  /* ================= POLL RIDES ================= */
  useEffect(() => {
    if (online !== true || ride) return;

    const interval = setInterval(async () => {
      const res = await getRideRequest();
      if (res.data.data) setRide(res.data.data);
    }, 5000);

    return () => clearInterval(interval);
  }, [online, ride]);

  /* ================= ACTIONS ================= */
  const handleAccept = async () => {
  const res = await acceptRide(ride._id);

  setRide({ 
    ...ride, 
    status: "ACCEPTED", 
    otp: res.data?.data?.otp 
  });

  // 🔥 JOIN ROOM
  socket.emit("join_ride", ride._id);

  // 🔥 SEND INITIAL LOCATION IMMEDIATELY
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((pos) => {
      socket.emit("driver_location", {
        rideId: ride._id,
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
    });
  }
};


  const handleReject = async () => {
    await rejectRide(ride._id);
    setRide(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-slate-950 text-white p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">🚖 Driver Dashboard</h1>

          <button
            onClick={() => navigate("/driver/history")}
            className="text-sm text-slate-400 hover:text-white"
          >
            Ride History →
          </button>
        </div>

        {/* KYC WARNING */}
        {kycStatus !== "approved" && (
          <div className="bg-yellow-900/30 border border-yellow-700 rounded-xl p-4 flex justify-between items-center">
            <div>
              <p className="font-medium text-yellow-400">
                KYC Pending
              </p>
              <p className="text-sm text-yellow-300">
                Complete KYC to receive rides
              </p>
            </div>
            <button
              onClick={() => navigate("/driver/kyc")}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-sm"
            >
              Complete KYC
            </button>
          </div>
        )}

        {/* ANALYTICS */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-400 text-sm">Performance</p>

            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-sm rounded-lg px-3 py-1"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Accepted" value={analytics?.rides.accepted} />
            <StatCard
              title="Rejected"
              value={analytics?.rides.rejected}
              color="text-red-400"
            />
            <StatCard
              title="Completed"
              value={analytics?.rides.completed}
              color="text-green-400"
            />
            <StatCard
              title="Earnings ₹"
              value={analytics?.earnings.driverEarning}
              color="text-emerald-400"
            />

            <StatCard
              title="Cash Collected ₹"
              value={`-₹${analytics?.earnings.cashCollected ?? 0}`}
              color="text-yellow-400"
            />

          </div>
        </div>

        {/* STATUS CARD */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Current Status</p>
            <span
              className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium
                ${online
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
                }`}
            >
              {online === null ? "Checking..." : online ? "Online" : "Offline"}
            </span>
          </div>

          <button
            disabled={loading || online === null || kycStatus !== "approved"}
            onClick={toggleStatus}
            className={`h-11 px-6 rounded-full font-medium transition
              ${online
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
              }
              disabled:opacity-50
            `}
          >
            {loading ? "Please wait..." : online ? "Go Offline" : "Go Online"}
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-400 p-3 rounded-lg">
            {error}
          </div>
        )}

        {/* RIDE REQUEST */}
        {ride && ride.status === "REQUESTED" && (
          <RideRequestCard
            ride={ride}
            onAccept={handleAccept}
            onReject={handleReject}
          />
        )}

        {/* ACCEPTED */}
        {ride && ride.status === "ACCEPTED" && (
          <DriverRideStart ride={ride} />
        )}
      </div>
    </div>
  );
}
