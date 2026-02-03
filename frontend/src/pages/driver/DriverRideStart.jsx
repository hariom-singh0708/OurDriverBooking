import { useState, useEffect, useContext } from "react";
import { markArrived, verifyRideOTP } from "../../services/rideOtp.api";
import OTPBox from "../../components/OTPBox";
import ChatBox from "../../components/ChatBox";
import { useNavigate } from "react-router-dom";
import { SocketContext } from "../../context/SocketContext";

export default function DriverRideStart({ ride }) {
  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);

  const [arrived, setArrived] = useState(
    ride?.status === "DRIVER_ARRIVED"
  );
  const [loading, setLoading] = useState(false);

  /* ================= SOCKET: RIDE CANCELLED ================= */
  useEffect(() => {
    if (!socket || !ride?._id) return;

    const onRideCancelled = (data) => {
      if (data?.rideId !== ride._id) return;

      alert(`❌ Ride cancelled by client\nReason: ${data.reason}`);
      navigate("/driver");
    };

    socket.on("ride_cancelled", onRideCancelled);

    return () => {
      socket.off("ride_cancelled", onRideCancelled);
    };
  }, [socket, ride, navigate]);

  /* ================= LIVE LOCATION (PRE-OTP) ================= */
  useEffect(() => {
    if (!socket || !ride?._id) return;
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        socket.emit("driver_location", {
          rideId: ride._id,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        console.error("GPS error:", err.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 10000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [socket, ride]);

  /* ================= MARK ARRIVED ================= */
  const handleArrived = async () => {
    try {
      setLoading(true);
      await markArrived(ride._id);
      setArrived(true);
      alert("✅ Arrived marked. Ask client for OTP.");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to mark arrival");
    } finally {
      setLoading(false);
    }
  };

  /* ================= VERIFY OTP ================= */
  const handleOTPSubmit = async (otp) => {
    if (!otp || otp.length !== 4) {
      alert("Enter valid 4-digit OTP");
      return;
    }

    try {
      setLoading(true);
      await verifyRideOTP(ride._id, otp);
      alert("🚗 Ride Started Successfully");
      navigate(`/driver/live/${ride._id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-5 text-gray-200">
      <h2 className="font-semibold text-lg flex items-center gap-2">
        📍 Pickup Location
      </h2>

      {/* MARK ARRIVED */}
      {!arrived && (
        <button
          disabled={loading}
          onClick={handleArrived}
          className={`w-full py-2 rounded-lg font-semibold transition ${
            loading
              ? "bg-gray-700 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Marking..." : "Mark Arrived"}
        </button>
      )}

      {/* OTP */}
      {arrived && (
        <div className="space-y-2">
          <p className="text-sm text-gray-400">
            Enter OTP from client to start ride
          </p>
          <OTPBox onSubmit={handleOTPSubmit} />
        </div>
      )}

      {/* CHAT */}
      <div className="pt-3 border-t border-gray-800">
        <ChatBox rideId={ride._id} userId="driver" />
      </div>
    </div>
  );
}
