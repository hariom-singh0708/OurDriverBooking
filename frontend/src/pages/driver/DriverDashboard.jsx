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

  /* ================== POLL RIDE REQUEST ================== */
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
      setRide({
        ...ride,
        status: "ACCEPTED",
        otp: res.data?.data?.otp,
      });
    } catch {
      alert("Failed to accept ride");
    }
  };

  /* ================== REJECT RIDE ================== */
  const handleReject = async () => {
    await rejectRide(ride._id);
    setRide(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold text-gray-800">
          Driver Dashboard
        </h1>

        <button
          onClick={() => navigate("/driver/history")}
          className="text-sm font-semibold text-gray-700 hover:text-black"
        >
          Ride History →
        </button>
      </div>

      {/* KYC ALERT */}
      {kycStatus !== "approved" && (
        <div className="mb-6 rounded-xl border border-yellow-300 bg-yellow-100 p-5 shadow">
          <p className="font-semibold text-yellow-800">
            ⚠ Complete your KYC to earn money and get rides
          </p>
          <button
            onClick={() => navigate("/driver/kyc")}
            className="mt-3 rounded-lg bg-black px-5 py-2 text-white hover:bg-gray-900"
          >
            Complete KYC
          </button>
        </div>
      )}

      {/* STATUS CARD */}
      <div className="mb-6 rounded-xl bg-white p-6 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Current Status</p>
            <p
              className={`text-xl font-bold ${
                online ? "text-green-600" : "text-red-600"
              }`}
            >
              {online ? "ONLINE" : "OFFLINE"}
            </p>
          </div>

          <button
            disabled={loading}
            onClick={toggleStatus}
            className={`rounded-full px-6 py-2 font-semibold text-white transition ${
              online
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Please wait..." : online ? "Go Offline" : "Go Online"}
          </button>
        </div>
      </div>

      {/* RIDE FLOW */}
      {ride && ride.status === "REQUESTED" && (
        <div className="animate-fade-in">
          <RideRequestCard
            ride={ride}
            onAccept={handleAccept}
            onReject={handleReject}
          />
        </div>
      )}

      {ride && ride.status === "ACCEPTED" && (
        <div className="animate-fade-in">
          <DriverRideStart ride={ride} />
        </div>
      )}

      {!ride && online && (
        <div className="rounded-xl bg-white p-6 text-center text-gray-500 shadow">
          Waiting for ride requests…
        </div>
      )}
    </div>
  );
}
