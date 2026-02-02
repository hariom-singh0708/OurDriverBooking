import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { SocketContext } from "../../context/SocketContext";
import { rateDriver } from "../../services/client.api";

import MapView from "../../components/MapView";
import LiveFare from "../../components/LiveFare";
import ChatBox from "../../components/ChatBox";
import CallButton from "../../components/CallButton";
import SOSButton from "../../components/SOSButton";

export default function LiveRide() {
  const { rideId } = useParams();
  const { socket } = useContext(SocketContext);

  const [driverLocation, setDriverLocation] = useState(null);
  const [fare, setFare] = useState(null);
  const [rideStatus, setRideStatus] = useState("WAITING");
  const [otp, setOtp] = useState(null);

  /* ⭐ RATING STATE */
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");

  /* ================= SOCKET SETUP ================= */
  useEffect(() => {
    if (!socket) return;

    socket.emit("join_ride", rideId);

    socket.on("driver_location_update", (data) => {
      setDriverLocation({ lat: data.lat, lng: data.lng });
    });

    socket.on("ride_status_update", (data) => {
      setRideStatus(data.status);
      if (data.otp) setOtp(data.otp);

      /* ⭐ SHOW RATING POPUP */
      if (data.status === "COMPLETED") {
        setShowRating(true);
      }
    });

    socket.on("waiting_time_update", (data) => {
      setFare(data.updatedFare);
    });

    socket.on("sos_triggered", () => {
      alert("🚨 SOS triggered!");
    });

    return () => {
      socket.off("driver_location_update");
      socket.off("ride_status_update");
      socket.off("waiting_time_update");
      socket.off("sos_triggered");
    };
  }, [socket, rideId]);

  /* ================= SUBMIT RATING ================= */
  const submitRating = async () => {
    await rateDriver({
      rideId,
      rating,
      feedback,
    });

    setShowRating(false);
    alert("Thanks for rating the driver ⭐");
  };

  return (
    <div className="p-6 space-y-4 bg-gray-100 min-h-screen">
      <h2 className="text-xl font-bold">Live Ride Tracking</h2>

      <div className="bg-white p-3 rounded">
        <b>Status:</b> {rideStatus}
      </div>

      {otp && rideStatus !== "ON_RIDE" && (
        <div className="bg-yellow-100 p-4 rounded text-center">
          <p className="font-bold">Your Ride OTP</p>
          <p className="text-3xl">{otp}</p>
        </div>
      )}

      <MapView driverLocation={driverLocation} />
      {fare && <LiveFare fare={fare} />}
      <ChatBox rideId={rideId} userId="client" />

      <div className="flex gap-3">
        <CallButton phone="7896541230" />
        <SOSButton rideId={rideId} />
      </div>

      {/* ⭐ RATING POPUP */}
      {showRating && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm">
            <h3 className="text-lg font-bold mb-3">Rate your Driver</h3>

            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full border p-2 rounded mb-3"
            >
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>
                  {r} ⭐
                </option>
              ))}
            </select>

            <textarea
              placeholder="Feedback (optional)"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full border p-2 rounded mb-4"
            />

            <button
              onClick={submitRating}
              className="w-full bg-indigo-600 text-white py-2 rounded"
            >
              Submit Rating
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
