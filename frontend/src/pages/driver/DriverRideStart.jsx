import { useState } from "react";
import { markArrived, verifyRideOTP } from "../../services/rideOtp.api";
import OTPBox from "../../components/OTPBox";
import ChatBox from "../../components/ChatBox";
import { useNavigate } from "react-router-dom";

export default function DriverRideStart({ ride }) {
  const navigate = useNavigate();

  const [arrived, setArrived] = useState(false);
  const [loading, setLoading] = useState(false);

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
    try {
      if (!otp || otp.length !== 4) {
        alert("Enter valid 4-digit OTP");
        return;
      }

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

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-5 text-gray-200">
      <h2 className="font-semibold text-lg flex items-center gap-2">
        📍 Pickup Location Reached
      </h2>

      {/* MARK ARRIVED BUTTON */}
      {!arrived && (
        <button
          disabled={loading}
          onClick={handleArrived}
          className={`w-full py-2 rounded-lg font-semibold transition
            ${
              loading
                ? "bg-gray-700 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          {loading ? "Marking..." : "Mark Arrived"}
        </button>
      )}

      {/* OTP BOX */}
      {arrived && (
        <div className="space-y-2">
          <p className="text-sm text-gray-400">
            Enter OTP from client to start ride
          </p>
          <OTPBox onSubmit={handleOTPSubmit} />
        </div>
      )}

      {/* 💬 CHAT BOX */}
      <div className="pt-3 border-t border-gray-800">
        <ChatBox rideId={ride._id} userId="driver" />
      </div>
    </div>
  );
}
