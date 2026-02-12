import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

import { SocketContext } from "../../context/SocketContext";
import { ActiveRideContext } from "../../context/ActiveRideContext";
import toast from "react-hot-toast";

import {
  toggleDriverStatus,
  getRideRequest,
  acceptRide,
  rejectRide,
  getDriverAnalytics,
} from "../../services/driver.api";

import { getKYCStatus } from "../../services/kyc.api";
import RideRequestCard from "../../components/RideRequestCard";
import DriverRideStart from "./DriverRideStart";
import { DriverStatusContext } from "../../context/DriverStatusContext";

/* ===== Refined Stat Card ===== */
const StatCard = ({ title, value, color = "text-slate-800" }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
    <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">{title}</p>
    <p className={`text-xl md:text-2xl font-black mt-1 ${color}`}>
      {value ?? "--"}
    </p>
  </div>
);

export default function DriverDashboard() {
  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);
  const { activeRide, setActiveRide } = useContext(ActiveRideContext);
  const [rideRequests, setRideRequests] = useState([]);

  const { driverOnline: online, setDriverOnline: setOnline } =
    useContext(DriverStatusContext); const [kycStatus, setKycStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [analytics, setAnalytics] = useState(null);
  const [period, setPeriod] = useState("today");


  /* Logic preserved exactly as per original code... */
  useEffect(() => {
    getDriverAnalytics(period).then((res) => setAnalytics(res.data.data));
  }, [period]);

  useEffect(() => {
    getKYCStatus().then((res) => setKycStatus(res.data.data?.status));
  }, []);

  /* ================= SOCKET ONLINE / OFFLINE ================= */
  useEffect(() => {
    if (!socket || online === null) return;

    if (online === true) socket.emit("driver_online");
    if (online === false) socket.emit("driver_offline");
  }, [online, socket]);

  /* ================= SOCKET RIDE EVENTS ================= */
 useEffect(() => {
  if (!socket) return;

  const onNewRide = (ride) => {
    setRideRequests((prev) => {
      if (prev.find((r) => r._id === ride._id)) return prev;
      return [...prev, ride];
    });
  };

  const onRideTaken = ({ rideId }) => {
    setRideRequests((prev) =>
      prev.filter((r) => r._id !== rideId)
    );
  };

  const onRideCancelled = ({ rideId }) => {
    setRideRequests((prev) =>
      prev.filter((r) => r._id !== rideId)
    );

    // agar driver accepted ride pe tha
    if (activeRide?._id === rideId) {
      setActiveRide(null);
      navigate("/driver");
    }

    toast.error("Ride cancelled");
  };

  socket.on("new_ride", onNewRide);
  socket.on("ride_taken", onRideTaken);
  socket.on("ride_cancelled", onRideCancelled);

  return () => {
    socket.off("new_ride", onNewRide);
    socket.off("ride_taken", onRideTaken);
    socket.off("ride_cancelled", onRideCancelled);
  };
}, [socket, activeRide, navigate]);


  /* ================= POLL RIDES (FALLBACK) ================= */
  useEffect(() => {
    if (online !== true || activeRide) return;

    const interval = setInterval(async () => {
      try {
        const res = await getRideRequest();
        if (res.data.data && res.data.data.status === "REQUESTED") {
          setRideRequests((prev) => {
            if (prev.find((r) => r._id === res.data.data._id)) return prev;
            return [...prev, res.data.data];
          });
        }

      } catch (err) {
        console.error("Ride polling failed:", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [online, activeRide, setActiveRide]);

  /* ================= TOGGLE ONLINE ================= */
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

  /* ================= ACTIONS ================= */
  // const handleAccept = async (ride) => {
  //   try {
  //     const res = await acceptRide(ride._id);

  //     const updatedRide = {
  //       ...ride,
  //       status: "ACCEPTED",
  //       otp: res.data?.data?.otp,
  //     };

  //     setActiveRide(updatedRide); // keep existing behaviour

  //     // remove from list
  //     setRideRequests((prev) =>
  //       prev.filter((r) => r._id !== ride._id)
  //     );

  //     socket.emit("join_ride", ride._id);

  //     navigate(`/driver/start/${ride._id}`);
  //   } catch (err) {
  //     if (err.response?.status === 409) {
  //       setRideRequests((prev) =>
  //         prev.filter((r) => r._id !== ride._id)
  //       );
  //       alert("❌ Ride already taken by another driver");
  //       return;
  //     }

  //     alert(err.response?.data?.message || "Failed to accept ride");
  //   }
  // };


  const handleAccept = async (ride) => {
  try {
    const res = await acceptRide(ride._id);

    // 🔥 Use backend populated ride
    setActiveRide(res.data.data);

    setRideRequests((prev) =>
      prev.filter((r) => r._id !== ride._id)
    );

    socket.emit("join_ride", ride._id);

    navigate(`/driver/start/${ride._id}`);
  } catch (err) {
    if (err.response?.status === 409) {
      setRideRequests((prev) =>
        prev.filter((r) => r._id !== ride._id)
      );
      alert("❌ Ride already taken by another driver");
      return;
    }

    alert(err.response?.data?.message || "Failed to accept ride");
  }
};



  const handleReject = async (ride) => {
    await rejectRide(ride._id);
    setRideRequests((prev) =>
      prev.filter((r) => r._id !== ride._id)
    );
  };


  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* 1. TOP STATUS CONTROL */}
        <div className="bg-white border border-slate-200 rounded-[2rem] p-4 md:p-6 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-xl shadow-inner ${online ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              {online ? "📡" : "💤"}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Current Status</p>
              <h2 className={`text-xl font-black ${online ? 'text-green-600' : 'text-red-600'}`}>
                {online === null ? "Loading..." : online ? "You are Online" : "You are Offline"}
              </h2>
            </div>
          </div>

          <button
            disabled={loading || online === null || kycStatus !== "approved"}
            onClick={toggleStatus}
            className={`w-full md:w-auto h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-lg
              ${online
                ? "bg-slate-100 text-slate-600 hover:bg-slate-200 shadow-slate-200"
                : "bg-brand text-white hover:bg-brand shadow-[#D27D56]/30"
              } disabled:opacity-50`}
          >
            {loading ? "Syncing..." : online ? "Go Offline" : "Go Online"}
          </button>
        </div>

        {/* 2. DASHBOARD HEADER & HISTORY */}
        <div className="flex items-end justify-between px-2">
          <div>
            <h1 className="text-3xl font-black text-[#a8663dc7] tracking-tight">Dashboard</h1>
            <p className="text-sm text-slate-500">Welcome back, Captain</p>
          </div>
          <button
            onClick={() => navigate("/driver/history")}
            className="h-10 px-4 rounded-xl border border-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-600 bg-white hover:bg-slate-50 transition-colors"
          >
            Ride History →
          </button>
        </div>

        {/* 3. KYC WARNING */}
        {kycStatus !== "approved" && (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-bold text-amber-800">KYC Verification Pending</p>
                <p className="text-xs text-amber-700">Complete your profile to start receiving rides.</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/driver/kyc")}
              className="w-full sm:w-auto px-6 py-3 bg-amber-600 hover:bg-amber-700 rounded-xl text-white text-[10px] font-bold uppercase tracking-widest"
            >
              Start KYC
            </button>
          </div>
        )}


        {/* 5. ACTIVE WORKFLOW (Ride Request / Ongoing Ride) */}
        <div className="relative">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-xs font-bold text-center animate-shake">
              {error}
            </div>
          )}

          {rideRequests.length > 0 && (
            <div className="space-y-6">
              {rideRequests.map((ride) => (
                <div key={ride._id} className="animate-in zoom-in duration-300">
                  <RideRequestCard
                    ride={ride}
                    onAccept={() => handleAccept(ride)}
                    onReject={() => handleReject(ride)}
                  />
                </div>
              ))}
            </div>
          )}


          {!activeRide && online && (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-brand/20 rounded-full animate-ping"></div>
                <div className="relative bg-white p-6 rounded-full shadow-lg text-2xl">📡</div>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400">
                Scanning for Rides...
              </p>
            </div>
          )}
        </div>

        {/* 4. PERFORMANCE ANALYTICS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand">Performance Overview</p>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-white border border-slate-200 text-[10px] font-bold uppercase rounded-xl px-4 py-2 outline-none focus:ring-2 ring-[#D27D56]/20"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <StatCard title="Accepted" value={analytics?.rides.accepted} />
            <StatCard title="Rejected" value={analytics?.rides.rejected} color="text-red-400" />
            <StatCard title="Completed" value={analytics?.rides.completed} color="text-green-400" />
            <StatCard title="Total Earnings ₹" value={analytics?.earnings.driverEarning} color="text-emerald-400" />
            <StatCard title="Cash Collected ₹" value={`-₹${analytics?.earnings.cashCollected ?? 0}`} color="text-yellow-400" />
            <StatCard title="Received Payout ₹" value={`₹${analytics?.earnings.receivedPayout ?? 0}`} color="text-yellow-400" />
            <StatCard title="Pending Payout ₹" value={`₹${analytics?.earnings.pendingPayout ?? 0}`} color="text-yellow-400" />
          </div>
        </div>


      </div>
    </div>
  );
}