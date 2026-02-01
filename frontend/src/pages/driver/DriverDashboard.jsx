import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  toggleDriverStatus,
  getRideRequest,
  acceptRide,
  rejectRide,
} from "../../services/driver.api";

import { getKYCStatus } from "../../services/kyc.api";
import RideRequestCard from "../../components/RideRequestCard";
import DriverRideStart from "./DriverRideStart";

export default function DriverDashboard() {
  const navigate = useNavigate();

  const [online, setOnline] = useState(false);
  const [ride, setRide] = useState(null);
  const [kycStatus, setKycStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ================== KYC CHECK ================== */
  useEffect(() => {
    getKYCStatus().then((res) => {
      setKycStatus(res.data.data?.status);
    });
  }, []);

  /* ================== TOGGLE ONLINE ================== */
  const toggleStatus = async () => {
    if (kycStatus !== "approved") {
      alert("Complete & approve KYC to go online");
      return;
    }

    try {
      setLoading(true);
      const res = await toggleDriverStatus({
        isOnline: !online,
        lat: 28.6,
        lng: 77.2,
      });
      setOnline(res.data.data.isOnline);
    } catch (err) {
      alert(err.response?.data?.message || "Status change failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================== POLL RIDE REQUEST (ONLY IF NO ACTIVE RIDE) ================== */
  useEffect(() => {
    if (!online || ride) return;

    const interval = setInterval(async () => {
      const res = await getRideRequest();
      if (res.data.data) {
        setRide(res.data.data);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [online, ride]);

  /* ================== ACCEPT RIDE ================== */
  const handleAccept = async () => {
    try {
      const res = await acceptRide(ride._id);

      // lock ride in ACCEPTED state
      setRide({
        ...ride,
        status: "ACCEPTED",
        otp: res.data?.data?.otp, // future use
      });
    } catch (err) {
      alert("Failed to accept ride");
    }
  };

  /* ================== REJECT RIDE ================== */
  const handleReject = async () => {
    await rejectRide(ride._id);
    setRide(null);
  };

  /* ================== UI ================== */
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Driver Dashboard</h1>

      {/* KYC ALERT */}
      {kycStatus !== "approved" && (
        <div className="bg-yellow-100 p-4 rounded">
          <p className="font-semibold">
            Complete your KYC to earn money and get rides
          </p>
          <button
            onClick={() => navigate("/driver/kyc")}
            className="mt-2 bg-black text-white px-4 py-1"
          >
            Complete KYC
          </button>
        </div>
      )}

      {/* ONLINE / OFFLINE */}
      <button
        disabled={loading}
        onClick={toggleStatus}
        className={`px-4 py-2 text-white ${
          online ? "bg-red-600" : "bg-green-600"
        }`}
      >
        {online ? "Go Offline" : "Go Online"}
      </button>

      {/* HISTORY */}
      <button
        onClick={() => navigate("/driver/history")}
        className="border px-3 py-1"
      >
        Ride History
      </button>

      {/* RIDE FLOW */}
      {ride && ride.status === "REQUESTED" && (
        <RideRequestCard
          ride={ride}
          onAccept={handleAccept}
          onReject={handleReject}
        />
      )}

      {ride && ride.status === "ACCEPTED" && (
        <DriverRideStart ride={ride} />
      )}
    </div>
  );
}
