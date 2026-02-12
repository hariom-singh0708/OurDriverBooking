import { useState } from "react";
import { markArrived, verifyRideOTP } from "../../services/rideOtp.api";
import OTPBox from "../../components/OTPBox";
import toast from "react-hot-toast";

export default function DriverRideStart({ ride }) {
  const [arrived, setArrived] = useState(false);
  const [starting, setStarting] = useState(false);

  /* ================= MARK ARRIVED ================= */
  const handleArrived = async () => {
    try {
      setStarting(true);
      await markArrived(ride._id);
      setArrived(true);
      toast.error("✅ Arrived marked. Ask client for OTP.");
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Failed to mark arrival"
      );
    } finally {
      setStarting(false);
    }
  };

  /* ================= VERIFY OTP ================= */
  const handleOTPSubmit = async (otp) => {
    try {
      setStarting(true);

      if (!otp || otp.length !== 4) {
        toast.error("Enter valid 4-digit OTP");
        return;
      }

      await verifyRideOTP(ride._id, otp);

      toast.success("🚗 Ride Started Successfully");
      // NEXT: live tracking / waiting / payment flow
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Invalid OTP"
      );
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="border p-4 space-y-4 bg-white rounded">
      <h2 className="font-bold text-lg">
        Pickup Location Reached
      </h2>

      {/* ARRIVED BUTTON */}
      {!arrived && (
        <button
          disabled={starting}
          onClick={handleArrived}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {starting ? "Marking..." : "Mark Arrived"}
        </button>
      )}

      {/* OTP SECTION */}
      {arrived && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Enter OTP from client to start ride
          </p>
          <OTPBox onSubmit={handleOTPSubmit} />
        </div>
      )}
    </div>
  );
}
