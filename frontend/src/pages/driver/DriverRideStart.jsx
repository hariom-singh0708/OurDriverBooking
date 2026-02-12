import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { markArrived, verifyRideOTP } from "../../services/rideOtp.api";
import { getDriverActiveRide } from "../../services/ride.api";

import OTPBox from "../../components/OTPBox";
import ChatBox from "../../components/ChatBox";
import DriverMapView from "../../components/DriverMapView";

import { SocketContext } from "../../context/SocketContext";
import { ActiveRideContext } from "../../context/ActiveRideContext";

import toast from "react-hot-toast";

export default function DriverRideStart() {
  const navigate = useNavigate();
  const { rideId } = useParams();

  const { socket } = useContext(SocketContext);
  const { activeRide, setActiveRide } = useContext(ActiveRideContext);

  const [checkingRide, setCheckingRide] = useState(true);
  const [arrived, setArrived] = useState(false);
  const [loading, setLoading] = useState(false);
  const [driverLocation, setDriverLocation] = useState(null);


  useEffect(() => {
  console.log("FULL ACTIVE RIDE:", activeRide);
  console.log("CLIENT OBJECT:", activeRide?.clientId);
}, [activeRide]);

  /* ================= RESTORE RIDE ================= */
  useEffect(() => {
  const loadRide = async () => {
    try {
      const res = await getDriverActiveRide();
      console.log("API RESPONSE:", res.data.data); // check here
      setActiveRide(res.data.data);
      setArrived(res.data.data.status === "DRIVER_ARRIVED");
    } catch {
      navigate("/driver");
    } finally {
      setCheckingRide(false);
    }
  };

  loadRide();
}, []);


  /* ================= AUTO JOIN ROOM ================= */
  useEffect(() => {
    if (socket && activeRide?._id) {
      socket.emit("join_ride", activeRide._id);
    }
  }, [socket, activeRide]);

  /* ================= SOCKET CANCEL ================= */
  useEffect(() => {
    if (!socket || !activeRide?._id) return;

    const onRideCancelled = (data) => {
      if (data?.rideId !== activeRide._id) return;

      toast.error("Ride cancelled by client");
      setActiveRide(null);
      navigate("/driver");
    };

    socket.on("ride_cancelled", onRideCancelled);
    return () => socket.off("ride_cancelled", onRideCancelled);
  }, [socket, activeRide]);

  /* ================= LIVE LOCATION ================= */
  useEffect(() => {
    if (!socket || !activeRide?._id || !navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const loc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        setDriverLocation(loc);

        socket.emit("driver_location", {
          rideId: activeRide._id,
          ...loc,
        });
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [socket, activeRide]);

  /* ================= ARRIVED ================= */
  const handleArrived = async () => {
    try {
      setLoading(true);
      await markArrived(activeRide._id);
      setArrived(true);

      setActiveRide((prev) => ({
        ...prev,
        status: "DRIVER_ARRIVED",
      }));
    } catch (err) {
      toast.error("Failed to confirm arrival");
    } finally {
      setLoading(false);
    }
  };

  /* ================= VERIFY OTP ================= */
  const handleOTPSubmit = async (otp) => {
    if (!otp || otp.length !== 4) {
      toast.error("Enter valid OTP");
      return;
    }

    try {
      setLoading(true);
      await verifyRideOTP(activeRide._id, otp);
      navigate(`/driver/live/${activeRide._id}`);
    } catch {
      toast.error("Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOADING SCREEN ================= */
  if (checkingRide) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200">
        <div className="animate-pulse text-center">
          <div className="text-4xl mb-3">🚕</div>
          <p className="font-bold text-slate-600">Restoring Active Ride...</p>
        </div>
      </div>
    );
  }

  if (!activeRide) return null;

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-3 md:p-6">

      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-4 bg-white/80 backdrop-blur-xl border border-white rounded-3xl shadow-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">

        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-black text-white rounded-2xl flex items-center justify-center text-xl shadow-lg">
            🚕
          </div>
          <div>
            <h2 className="font-black text-lg">
              Trip ID #{activeRide._id.slice(-6).toUpperCase()}
            </h2>
            <p className="text-sm text-slate-500">
              {activeRide.clientId?.name || "Client"}
            </p>
          </div>
        </div>

        <a
          href={`tel:${activeRide.clientId?.mobile || ""}`}
          className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-bold shadow-md transition"
        >
          Call Client
        </a>
      </div>

      {/* MAIN GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* MAP */}
        <div className="lg:col-span-8 bg-white rounded-3xl shadow-xl overflow-hidden h-[350px] lg:h-[600px]">
          <DriverMapView
            driverLocation={driverLocation}
            pickupLocation={activeRide.pickupLocation}
            rideStatus={activeRide.status}
            style={{ height: "100%", width: "100%" }}
          />
        </div>

        {/* RIGHT PANEL */}
        <div className="lg:col-span-4 flex flex-col gap-5">

          {/* PICKUP CARD */}
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
              Pickup Location
            </h3>

            <p className="text-sm font-semibold text-slate-800 leading-relaxed">
              {activeRide.pickupLocation?.address}
            </p>

            <div className="mt-6">
              {!arrived ? (
                <button
                  onClick={handleArrived}
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-black text-white font-bold uppercase tracking-widest text-sm hover:bg-slate-900 transition active:scale-95"
                >
                  {loading ? "Processing..." : "Confirm Arrival"}
                </button>
              ) : (
                <div>
                  <p className="text-xs font-black uppercase text-green-600 text-center mb-3">
                    Enter Client OTP
                  </p>
                  <div className="flex justify-center">
                    <OTPBox onSubmit={handleOTPSubmit} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CHAT */}
          <div className="bg-white rounded-3xl shadow-xl flex-1 overflow-hidden">
            <ChatBox
              rideId={activeRide._id}
              userId="driver"
              clientPhone={activeRide.clientId?.mobile}
            />
          </div>

        </div>
      </div>
    </div>
  );
}
