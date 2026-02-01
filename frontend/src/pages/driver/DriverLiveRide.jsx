import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import { SocketContext } from "../../context/SocketContext";

import DriverWaiting from "./DriverWaiting";
import ChatBox from "../../components/ChatBox";
import SOSButton from "../../components/SOSButton";
import CompleteRideButton from "../../components/CompleteRideButton";

export default function DriverLiveRide() {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);

  const [sendingLocation, setSendingLocation] = useState(false);

  /* ================= JOIN RIDE ================= */
  useEffect(() => {
    if (!socket) return;
    socket.emit("join_ride", rideId);
  }, [socket, rideId]);

  
  /* ================= LOCATION STREAM ================= */
  useEffect(() => {
    setSendingLocation(true);

    const interval = setInterval(() => {
      axios.post(
        "http://localhost:5000/driver/location",
        {
          rideId,
          lat: 28.6 + Math.random() / 100,
          lng: 77.2 + Math.random() / 100,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
    }, 3000);

    return () => {
      clearInterval(interval);
      setSendingLocation(false);
    };
  }, [rideId]);

  /* ================= SOS LISTENER ================= */
  useEffect(() => {
    if (!socket) return;

    socket.on("sos_triggered", () => {
      alert("🚨 SOS ALERT RECEIVED!");
    });

    return () => socket.off("sos_triggered");
  }, [socket]);

  /* ================= UI ================= */
  return (
    <div className="p-6 space-y-4 bg-gray-100 min-h-screen">
      <h2 className="text-xl font-bold">Ride in Progress</h2>

      {/* LOCATION STATUS */}
      <div className="bg-white p-3 rounded">
        <p>
          Live Location:
          <span className="ml-2 text-green-600">
            {sendingLocation ? "Sending" : "Stopped"}
          </span>
        </p>
      </div>

      {/* WAITING CONTROL */}
      <DriverWaiting rideId={rideId} />

      {/* CHAT */}
      <ChatBox rideId={rideId} userId="driver" />

      {/* ACTIONS */}
      <div className="flex gap-3">
        <SOSButton rideId={rideId} />
        <CompleteRideButton
          rideId={rideId}
          onComplete={() => navigate("/driver/history")}
        />
      </div>
    </div>
  );
}
