import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { SocketContext } from "../../context/SocketContext";

import ChatBox from "../../components/ChatBox";
import SOSButton from "../../components/SOSButton";
import CompleteRideButton from "../../components/CompleteRideButton";
import qrImage from "../../assets/qr.jpeg";

export default function DriverLiveRide() {
  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);

  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sendingLocation, setSendingLocation] = useState(false);
const [paymentMethod, setPaymentMethod] = useState("UPI");

  const token = localStorage.getItem("token");

  /* ================= FETCH ACTIVE RIDE ================= */
  useEffect(() => {
    const fetchRide = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/rides/driver/active",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setRide(res.data.data);
      } catch {
        setRide(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRide();
  }, []);

  /* ================= SOCKET JOIN ================= */
  useEffect(() => {
    if (!socket || !ride?._id) return;
    socket.emit("join_ride", ride._id);
  }, [socket, ride]);

  /* ================= LIVE LOCATION ================= */
  useEffect(() => {
    if (!ride?._id) return;

    setSendingLocation(true);

    const interval = setInterval(() => {
      axios.post(
        "http://localhost:5000/driver/location",
        {
          rideId: ride._id,
          lat: 28.6 + Math.random() / 100,
          lng: 77.2 + Math.random() / 100,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }, 3000);

    return () => {
      clearInterval(interval);
      setSendingLocation(false);
    };
  }, [ride]);

  /* ================= SOCKET EVENTS ================= */
  useEffect(() => {
    if (!socket) return;

    socket.on("payment_received", () => {
      setRide((prev) =>
        prev ? { ...prev, paymentStatus: "PAID" } : prev
      );
    });

    socket.on("ride_status_update", ({ status }) => {
      setRide((prev) =>
        prev ? { ...prev, status } : prev
      );
    });

    return () => {
      socket.off("payment_received");
      socket.off("ride_status_update");
    };
  }, [socket]);

  /* ================= PAYMENT ================= */
  const markPaymentReceived = async () => {
  await axios.post(
    `http://localhost:5000/rides/${ride._id}/payment-received`,
    { method: paymentMethod },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  setRide((prev) => ({
    ...prev,
    paymentStatus: "PAID",
    paymentMethod,
  }));
};


  /* ================= COMPLETE RIDE ================= */
 const completeRide = async () => {
  try {
    await axios.post(
      `http://localhost:5000/rides/${ride._id}/complete`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    navigate("/driver"); // ✅ instant redirect
  } catch (err) {
    alert(
      err.response?.data?.message ||
      "Failed to complete ride"
    );
  }
};


  /* ================= UI STATES ================= */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-400 p-6">
        Loading ride...
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-400 p-6">
        No active ride
      </div>
    );
  }

  const paymentStatus = ride.paymentStatus;
  const paymentMode = ride.paymentMode;

  const isPaymentRequired =
    paymentMode === "pay_after_ride" &&
    paymentStatus !== "PAID";

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-6 space-y-5">
      <h2 className="text-2xl font-bold">🚗 Live Ride</h2>

      {/* LOCATION */}
      <div className="bg-gray-800 p-4 rounded flex justify-between">
        <span>Live Location</span>
        <span
          className={`font-semibold ${
            sendingLocation ? "text-green-400" : "text-red-400"
          }`}
        >
          {sendingLocation ? "Sending" : "Stopped"}
        </span>
      </div>

      {/* TRIP DETAILS */}
      <div className="bg-gray-800 p-4 rounded space-y-3">
        <h3 className="text-lg font-semibold">Trip Details</h3>

        <p><b>Pickup:</b> {ride.pickupLocation.address}</p>
        <p><b>Drop:</b> {ride.dropLocation.address}</p>
        <p><b>Ride Type:</b> {ride.rideType}</p>

        <p className="text-xl font-bold">
          ₹{ride.fareBreakdown.totalFare}
        </p>

        {/* PAYMENT STATUS */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">
              Payment Status:
            </span>

            {paymentStatus === "PAID" ? (
              <span className="px-3 py-1 bg-green-900 text-green-300 rounded text-sm font-semibold">
                PAID
              </span>
            ) : (
              <span className="px-3 py-1 bg-red-900 text-red-300 rounded text-sm font-semibold">
                UNPAID
              </span>
            )}
          </div>

          {/* QR + MARK PAYMENT */}
          {paymentMode === "pay_after_ride" &&
 paymentStatus === "UNPAID" && (
  <div className="space-y-4">

    {/* PAYMENT METHOD SELECT */}
    <div className="flex gap-3">
      <button
        onClick={() => setPaymentMethod("UPI")}
        className={`flex-1 py-2 rounded ${
          paymentMethod === "UPI"
            ? "bg-blue-600"
            : "bg-gray-700"
        }`}
      >
        UPI / QR
      </button>

      <button
        onClick={() => setPaymentMethod("CASH")}
        className={`flex-1 py-2 rounded ${
          paymentMethod === "CASH"
            ? "bg-yellow-600"
            : "bg-gray-700"
        }`}
      >
        Cash
      </button>
    </div>

    {/* QR ONLY FOR UPI */}
    {paymentMethod === "UPI" && (
      <div className="border border-gray-700 p-3 rounded text-center">
        <p className="text-sm mb-2 text-gray-400">
          Show this QR to customer
        </p>
        <img src={qrImage} alt="UPI QR" className="mx-auto w-40" />
      </div>
    )}

    <button
      onClick={markPaymentReceived}
      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
    >
      Mark Payment Received
    </button>
  </div>
)}

        </div>
      </div>

      {/* CHAT */}
      <ChatBox rideId={ride._id} userId="driver" />

      {/* ACTIONS */}
      <div className="flex gap-3">
        <SOSButton rideId={ride._id} />

        <CompleteRideButton
          rideId={ride._id}
          disabled={isPaymentRequired}
          onComplete={completeRide}
        />
      </div>
    </div>
  );
}
