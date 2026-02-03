import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import { SocketContext } from "../../context/SocketContext";
import { rateDriver } from "../../services/client.api";
import { cancelRide } from "../../services/ride.api";

import MapView from "../../components/MapView";
import LiveFare from "../../components/LiveFare";
import ChatBox from "../../components/ChatBox";
import CallButton from "../../components/CallButton";
import SOSButton from "../../components/SOSButton";

export default function LiveRide() {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);

  /* ================= CORE STATES ================= */
  const [ride, setRide] = useState(null);
  const [rideStatus, setRideStatus] = useState("WAITING");
  const [driverLocation, setDriverLocation] = useState(null);
  const [otp, setOtp] = useState(null);
  const [fare, setFare] = useState(null);

  /* ================= LOCATIONS ================= */
  const [pickup, setPickup] = useState(null);
  const [drop, setDrop] = useState(null);

  /* ================= DRIVER ================= */
  const [driver, setDriver] = useState(null);

  /* ================= CANCEL ================= */
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);

  /* ================= RATING ================= */
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    const loadRide = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/rides/${rideId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const data = res.data.data;
        setRide(data);
        setPickup(data.pickupLocation);
        setDrop(data.dropLocation);
        setRideStatus(data.status);
        setDriver(data.driver || null);
        setOtp(data.otp || null);
      } catch {
        alert("Ride not found");
      }
    };

    loadRide();
  }, [rideId]);

  /* ================= SOCKET ================= */
  useEffect(() => {
    if (!socket || !rideId) return;

    socket.emit("join_ride", rideId);

    const onRideDetails = (data) => {
      setRide(data);
      setPickup(data.pickupLocation);
      setDrop(data.dropLocation);
      setRideStatus(data.status);
    };

    const onDriverAssigned = (data) => {
  setDriver(data.driver);
  setRideStatus("ACCEPTED"); // ✅ CORRECT
};


    const onDriverLocation = ({ lat, lng }) => {
      setDriverLocation({ lat, lng });
    };

    const onRideStatus = (data) => {
      setRideStatus(data.status);

      if (data.pickupLocation) setPickup(data.pickupLocation);
      if (data.dropLocation) setDrop(data.dropLocation);
      if (data.otp) setOtp(data.otp);

      if (data.status === "COMPLETED") {
        setShowRating(true);
      }

      if (data.status === "CANCELLED_BY_DRIVER") {
        alert("❌ Ride cancelled by driver");
        navigate("/client");
      }
    };

    const onFareUpdate = (data) => {
      setFare(data.updatedFare);
    };

    socket.on("ride_details", onRideDetails);
    socket.on("driver_assigned", onDriverAssigned);
    socket.on("driver_location_update", onDriverLocation);
    socket.on("ride_status_update", onRideStatus);
    socket.on("waiting_time_update", onFareUpdate);

    return () => {
      socket.off("ride_details", onRideDetails);
      socket.off("driver_assigned", onDriverAssigned);
      socket.off("driver_location_update", onDriverLocation);
      socket.off("ride_status_update", onRideStatus);
      socket.off("waiting_time_update", onFareUpdate);
    };
  }, [socket, rideId, navigate]);

  /* ================= CANCEL RIDE ================= */
  const confirmCancel = async () => {
    if (!cancelReason.trim()) {
      alert("Please select a reason");
      return;
    }

    try {
      setCancelLoading(true);
      const res = await cancelRide(rideId, { reason: cancelReason });

      alert(
        `Ride cancelled${res.data.penalty ? ` (Penalty ₹${res.data.penalty})` : ""
        }`
      );

      navigate("/client");
    } catch (err) {
      alert(err.response?.data?.message || "Cancel failed");
    } finally {
      setCancelLoading(false);
      setShowCancel(false);
    }
  };

  /* ================= SUBMIT RATING ================= */
  const submitRating = async () => {
    await rateDriver({ rideId, rating, feedback });
    setShowRating(false);
    alert("Thanks for rating ⭐");
    navigate("/client");
  };

  /* ================= STATUS TEXT ================= */
  const statusText = {
  REQUESTED: "Looking for nearby driver...",
  ACCEPTED: "🚕 Driver is coming to pickup",
  DRIVER_ARRIVED: "Driver arrived. Share OTP",
  ON_RIDE: "On the way to destination",
  COMPLETED: "Ride completed",
};


  /* ================= UI ================= */
  return (
    <div className="p-6 space-y-4 bg-gray-100 min-h-screen">
      <h2 className="text-xl font-bold">Live Ride Tracking</h2>

      {/* STATUS */}
      <div className="bg-white p-3 rounded font-semibold">
        {statusText[rideStatus]}
      </div>

      {/* OTP */}
      {otp && rideStatus === "DRIVER_ARRIVED" && (
        <div className="bg-yellow-100 p-4 rounded text-center">
          <p className="font-bold">Your Ride OTP</p>
          <p className="text-3xl">{otp}</p>
        </div>
      )}

      {/* MAIN RIDE UI (HIDE AFTER COMPLETE) */}
      {rideStatus !== "COMPLETED" && (
        <>
          <MapView
            driverLocation={driverLocation}
            pickup={pickup}
            drop={drop}
            rideStatus={rideStatus}
          />

          {ride && (
            <div className="bg-white p-4 rounded space-y-3">
              <h3 className="text-lg font-semibold">Trip Details</h3>
              <p><b>Pickup:</b> {ride.pickupLocation.address}</p>
              <p><b>Drop:</b> {ride.dropLocation.address}</p>
              <p><b>Ride Type:</b> {ride.rideType}</p>
              <p><b>Payment:</b> {ride.paymentMode}</p>

              <div className="flex justify-between font-semibold">
                <span>Fare</span>
                <span>₹{ride.fareBreakdown?.totalFare}</span>
              </div>
            </div>
          )}

          {fare && <LiveFare fare={fare} />}

          {driver && (
            <div className="bg-white p-3 rounded flex gap-3 items-center">
              <img src={driver.photo} className="w-12 h-12 rounded-full" />
              <div>
                <p className="font-bold">{driver.name}</p>
                <p className="text-sm text-gray-500">
                  ⭐ {driver.rating} • {driver.vehicleNumber}
                </p>
              </div>
            </div>
          )}

          <ChatBox rideId={rideId} userId="client" />

          <div className="flex gap-3">
            <CallButton phone={driver?.phone} />
            <SOSButton rideId={rideId} />

            {["REQUESTED", "ACCEPTED", "DRIVER_ARRIVED"].includes(rideStatus) && (
              <button
                onClick={() => setShowCancel(true)}
                className="flex-1 bg-red-600 text-white py-2 rounded"
              >
                Cancel Ride
              </button>
            )}

          </div>
        </>
      )}

      {/* CANCEL MODAL */}
      {showCancel && (
        <div className="fixed inset-0 bg-black/60 flex items-end z-50">
          <div className="bg-white w-full p-5 rounded-t-2xl space-y-4">
            <h3 className="font-semibold text-lg">Cancel Ride</h3>

            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="">Select reason</option>
              <option value="Change of plans">Change of plans</option>
              <option value="Driver is late">Driver is late</option>
              <option value="Booked by mistake">Booked by mistake</option>
            </select>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancel(false)}
                className="flex-1 border py-2 rounded"
              >
                Back
              </button>
              <button
                onClick={confirmCancel}
                disabled={cancelLoading}
                className="flex-1 bg-red-600 text-white py-2 rounded"
              >
                {cancelLoading ? "Cancelling..." : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⭐ ENHANCED RATING MODAL */}
      {showRating && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm text-center">
            <h3 className="text-xl font-bold mb-1">Ride Completed 🎉</h3>
            <p className="text-gray-500 mb-4">Rate your experience</p>

            {driver && (
              <div className="flex flex-col items-center mb-4">
                <img
                  src={driver.photo}
                  className="w-16 h-16 rounded-full mb-2"
                />
                <p className="font-semibold">{driver.name}</p>
              </div>
            )}

            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-3xl transition ${star <= rating
                      ? "text-yellow-400 scale-110"
                      : "text-gray-300"
                    }`}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              placeholder="Write feedback (optional)"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full border rounded-lg p-3 mb-4"
            />

            <button
              onClick={submitRating}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold"
            >
              Submit Rating ⭐
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
