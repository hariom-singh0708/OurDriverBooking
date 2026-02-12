import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getRideById,
  markRidePaymentReceived,
  completeRideByDriver,
} from "../../services/ride.api";
import toast from "react-hot-toast";

import { SocketContext } from "../../context/SocketContext";

import ChatBox from "../../components/ChatBox";
import SOSButton from "../../components/SOSButton";
import CompleteRideButton from "../../components/CompleteRideButton";
import DriverMapView from "../../components/DriverMapView";
import qrImage from "../../assets/qr.jpeg";
import { ActiveRideContext } from "../../context/ActiveRideContext";

export default function DriverLiveRide() {
  const navigate = useNavigate();
  const { rideId } = useParams(); // ✅ URL IS SOURCE OF TRUTH
  const { socket } = useContext(SocketContext);
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sendingLocation, setSendingLocation] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [driverLocation, setDriverLocation] = useState(null);

  const token = localStorage.getItem("token");
  const { setActiveRide } = useContext(ActiveRideContext);

  /* ================= FETCH EXACT RIDE ================= */
  useEffect(() => {
  const fetchRide = async () => {
    try {
      const res = await getRideById(rideId);
      setRide(res.data.data);
    } catch (err) {
        toast.error("Ride not found or already completed");
      navigate("/driver");
    } finally {
      setLoading(false);
    }
  };

  if (rideId) fetchRide();
}, [rideId, navigate]);

  /* ================= SOCKET JOIN ================= */
  useEffect(() => {
    if (!socket || !rideId) return;
    socket.emit("join_ride", rideId);
  }, [socket, rideId]);

  /* ================= RIDE CANCELLED ================= */
  useEffect(() => {
    if (!socket || !rideId) return;

    const onCancelled = (data) => {
      if (data?.rideId !== rideId) return;
      toast.error(`Ride cancelled by client\nReason: ${data.reason}`);
      navigate("/driver");
    };

    socket.on("ride_cancelled", onCancelled);
    return () => socket.off("ride_cancelled", onCancelled);
  }, [socket, rideId, navigate]);

  /* ================= LIVE GPS → SOCKET ================= */
  useEffect(() => {
    if (!socket || !rideId || !navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const loc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        setDriverLocation(loc);
        socket.emit("driver_location", {
          rideId,
          ...loc,
        });

        setSendingLocation(true);
      },
      (err) => {
        console.error("GPS error:", err);
        setSendingLocation(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 10000,
      },
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      setSendingLocation(false);
    };
  }, [socket, rideId]);

  /* ================= SOCKET UPDATES ================= */
  useEffect(() => {
    if (!socket) return;

    const onPayment = () => {
      setRide((prev) => (prev ? { ...prev, paymentStatus: "PAID" } : prev));
    };

    const onStatus = ({ status }) => {
      setRide((prev) => (prev ? { ...prev, status } : prev));
    };

    socket.on("payment_received", onPayment);
    socket.on("ride_status_update", onStatus);

    return () => {
      socket.off("payment_received", onPayment);
      socket.off("ride_status_update", onStatus);
    };
  }, [socket]);

  /* ================= PAYMENT ================= */
  const markPaymentReceived = async () => {
  await markRidePaymentReceived(ride._id, {
    method: paymentMethod,
  });

  setRide((prev) => ({
    ...prev,
    paymentStatus: "PAID",
    paymentMethod,
  }));
};


  /* ================= COMPLETE RIDE ================= */
const completeRide = async () => {
  try {
    await completeRideByDriver(ride._id);

      // 🔥 clear active ride
      setActiveRide(null);

      navigate("/driver");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to complete ride");
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
    paymentMode === "pay_after_ride" && paymentStatus !== "PAID";

  /* ================= UI ================= */// 

return (
  <div className="h-screen bg-[#F8FAFC] flex flex-col overflow-hidden">

    {/* ================= HEADER ================= */}
    <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex items-center justify-between shrink-0 z-50">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 bg-brand rounded-lg flex items-center justify-center text-sm text-white shadow-md">
          🚕
        </div>
        <div>
          <h1 className="text-xs md:text-sm font-black uppercase text-[#2D1B18]">
            Operations Command
          </h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            #{ride._id.slice(-6).toUpperCase()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div
          className={`h-2 w-2 rounded-full ${
            sendingLocation ? "bg-green-500 animate-pulse" : "bg-red-500"
          }`}
        />
        <span className="text-[10px] font-bold uppercase text-slate-500">
          GPS
        </span>
      </div>
    </div>

    {/* ================= MAIN ================= */}
    <div className="flex flex-col lg:flex-row flex-1 min-h-0">

      {/* ================= LEFT (MAP SECTION) ================= */}
      <div className="w-full lg:w-1/2 flex flex-col min-h-0">

        {/* MAP */}
        <div className="relative h-[55vh] sm:h-[60vh] lg:h-auto lg:flex-1 min-h-0">
          <DriverMapView
            driverLocation={driverLocation}
            pickupLocation={ride.pickupLocation}
            dropLocation={ride.dropLocation}
            rideStatus={ride.status}
          />

          {/* DESTINATION CARD */}
          <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl">
            <p className="text-[10px] font-black text-brand uppercase mb-1">
              Destination
            </p>
            <p className="text-sm font-bold text-[#2D1B18] truncate">
              {ride.dropLocation.address}
            </p>
          </div>
        </div>

        {/* ACTION BUTTONS (Mobile fixed style feel) */}
        <div className="bg-white border-t border-slate-200 p-4 shrink-0">
          <div className="flex gap-3">
            <div className="flex-1">
              <SOSButton rideId={ride._id} />
            </div>
            <div className="flex-[2]">
              <CompleteRideButton
                rideId={ride._id}
                disabled={isPaymentRequired}
                onComplete={completeRide}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================= RIGHT PANEL ================= */}
      <div className="w-full lg:w-1/2 flex flex-col min-h-0 bg-white">

        {/* REVENUE SECTION */}
        <div className="p-4 md:p-6 border-b border-slate-200 shrink-0">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-black uppercase text-brand">
              Revenue
            </h3>
            <p className="text-xl md:text-2xl font-black text-[#2D1B18]">
              ₹{ride.fareBreakdown.totalFare}
            </p>
          </div>

          {paymentMode === "pay_after_ride" &&
          paymentStatus !== "PAID" ? (
            <div className="flex flex-col gap-4">

              {/* METHOD SELECT */}
              <div className="flex gap-3">
                <button
                  onClick={() => setPaymentMethod("UPI")}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase ${
                    paymentMethod === "UPI"
                      ? "bg-[#2D1B18] text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  QR
                </button>

                <button
                  onClick={() => setPaymentMethod("CASH")}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase ${
                    paymentMethod === "CASH"
                      ? "bg-brand text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  Cash
                </button>
              </div>

              {/* PAYMENT BOX */}
              {paymentMethod === "UPI" ? (
                <div className="flex justify-center py-4 bg-slate-50 rounded-2xl">
                  <img
                    src={qrImage}
                    alt="QR"
                    className="w-28 h-28 rounded-lg shadow-sm"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center py-6 bg-amber-50 rounded-2xl">
                  <span className="text-2xl mb-1">💵</span>
                  <p className="text-xs font-bold uppercase text-amber-800">
                    Collect Cash
                  </p>
                </div>
              )}

              <button
                onClick={markPaymentReceived}
                className="w-full bg-[#2D1B18] text-white py-3 rounded-xl text-xs font-black uppercase active:scale-95 transition"
              >
                Confirm Payment
              </button>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-100 py-6 rounded-2xl flex flex-col items-center">
              <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center text-green-500 shadow mb-2">
                ✓
              </div>
              <span className="text-green-600 font-black text-xs uppercase tracking-widest">
                Payment Settled
              </span>
            </div>
          )}
        </div>

        {/* CHAT (Scrollable on small screens) */}
        <div className="flex-1 min-h-100 p-4">
          <div className="h-full border border-slate-200 rounded-3xl overflow-hidden">
            <ChatBox
              rideId={ride._id}
              userId="driver"
              clientPhone={ride.clientId?.mobile}
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);

}