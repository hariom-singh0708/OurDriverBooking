import { useEffect, useState, useContext, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { SocketContext } from "../../context/SocketContext";
import { rateDriver } from "../../services/client.api";
import { getRideById, cancelRide } from "../../services/ride.api";
import { createPaymentOrder, verifyPayment } from "../../services/payment.api";

import MapView from "../../components/MapView";
import LiveFare from "../../components/LiveFare";
import ChatBox from "../../components/ChatBox";
import SOSButton from "../../components/SOSButton";
import CancelModal from "./CancelModal";
import RatingModal from "./RatingModal";

export default function LiveRide() {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);

  /* ================= CORE STATES ================= */
  const [ride, setRide] = useState(null);
  const [showChatModal, setShowChatModal] = useState(null);
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

  /* ================= AUTO CANCEL MODAL ================= */
  const [showAutoCancel, setShowAutoCancel] = useState(false);
  const [payLoading, setPayLoading] = useState(false);

  /* ✅ Cancel allowed only until DRIVER_ARRIVED (and not on ride/completed) */
  const canCancel = useMemo(() => {
    return !["DRIVER_ARRIVED", "ON_RIDE", "COMPLETED", "CANCELLED_AUTO"].includes(rideStatus);
  }, [rideStatus]);

  /* ✅ rating object fix */
  const ratingAvg = useMemo(() => {
    const v =
      driver?.rating?.average ??
      driver?.ratingAvg ??
      driver?.avgRating ??
      driver?.rating ??
      0;
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }, [driver]);

  const ratingCount = useMemo(() => {
    const v = driver?.rating?.totalRatings ?? driver?.totalRatings ?? 0;
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }, [driver]);

  /* ================= INITIAL LOAD ================= */

  useEffect(() => {
    if (!rideId) return;

    const loadRide = async () => {
      try {
        const res = await getRideById(rideId);
        const data = res.data.data;

        setRide(data);
        setPickup(data.pickupLocation);
        setDrop(data.dropLocation);
        setRideStatus(data.status);
        setDriver(data.driverId || data.driver || null);
        setOtp(data.otp || null);
      } catch (err) {
        toast.error("Ride not found");
        navigate("/client");
      }
    };

    loadRide();
  }, [rideId]); // 👈 clean dependency

  /* ================= SOCKET ================= */
  useEffect(() => {
    if (!socket || !rideId) return;

    socket.emit("join_ride", rideId);

    const onRideDetails = (data) => {
      setRide(data);
      setPickup(data.pickupLocation);
      setDrop(data.dropLocation);
      setRideStatus(data.status);

      if (data.driverId || data.driver) setDriver(data.driverId || data.driver);
      if (data.otp) setOtp(data.otp);
    };

    const onDriverAssigned = (data) => {
      setDriver(data.driverId || data.driver || null);
      setRideStatus("ACCEPTED");
    };

    const onDriverLocation = ({ lat, lng }) => {
      setDriverLocation({ lat, lng });
    };

    const onRideStatus = (data) => {
      setRideStatus(data.status);

      if (data.pickupLocation) setPickup(data.pickupLocation);
      if (data.dropLocation) setDrop(data.dropLocation);
      if (data.driverId || data.driver) setDriver(data.driverId || data.driver);

      if (data.otp) setOtp(data.otp);

      // ✅ arrived hote hi cancel modal open hai to close
      if (data.status === "DRIVER_ARRIVED") {
        setShowCancel(false);
      }

      if (data.status === "COMPLETED") {
        setShowRating(true);
      }

      if (data.status === "CANCELLED_BY_DRIVER") {
        toast.error("❌ Ride cancelled by driver");
        navigate("/client");
      }

      if (data.status === "CANCELLED_AUTO") {
        setShowAutoCancel(true);
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
      toast.error("Please select a reason");
      return;
    }

    try {
      setCancelLoading(true);
      const res = await cancelRide(rideId, { reason: cancelReason });

      toast.success(
        `Ride cancelled${res.data.penalty ? ` (Penalty ₹${res.data.penalty})` : ""
        }`
      );

      navigate("/client");
    } catch (err) {
      toast.error(err.response?.data?.message || "Cancel failed");
    } finally {
      setCancelLoading(false);
      setShowCancel(false);
    }
  };

  const handlePayNow = async () => {
    if (!ride || !window.Razorpay) return;

    try {
      setPayLoading(true);

      const orderRes = await createPaymentOrder(ride._id);
      const { orderId, amount, key } = orderRes.data.data;

      const rzp = new window.Razorpay({
        key,
        amount: amount * 100,
        currency: "INR",
        name: "DriverBook",
        order_id: orderId,

        handler: async (response) => {
          await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          toast.success("Payment Successful ✅");

          // Refresh ride
          const updated = await getRideById(ride._id);
          setRide(updated.data.data);
        },

        theme: { color: "#2D1B18" },
      });

      rzp.open();
    } catch (err) {
      toast.error("Payment failed");
    } finally {
      setPayLoading(false);
    }
  };


  /* ================= SUBMIT RATING ================= */
  const submitRating = async () => {
    try {
      await rateDriver({
        rideId,
        rating,
        feedback: feedback.trim(),
      });

      toast.success("Thanks for rating ⭐");
      setShowRating(false);
      navigate("/client");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit rating");
    }
  };

  /* ================= STATUS TEXT ================= */
  const statusText = {
    WAITING: "Looking for nearby driver...",
    REQUESTED: "Looking for nearby driver...",
    ACCEPTED: "🚕 Driver is coming to pickup",
    DRIVER_ARRIVED: "Driver arrived. Share OTP",
    ON_RIDE: "On the way to destination",
    COMPLETED: "Ride completed",
    CANCELLED_AUTO: "❌ No driver accepted the ride",
  };

  return (
    <div className="w-full bg-[#FAF8F6] flex flex-col lg:flex-row overflow-hidden font-sans text-[#2D1B18]">
      {/* LEFT COLUMN */}
      <div className="w-full lg:w-1/2 h-full flex flex-col border-r border-[#EBD9D0] bg-white z-20 shadow-xl relative">
        {/* HEADER STRIP */}
        <div className="bg-[#2D1B18] px-6 py-4 flex items-center justify-between shrink-0 z-50">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-brand rounded-xl flex items-center justify-center text-sm shadow-lg text-white">
              🚕
            </div>
            <div>
              <h1 className="text-[10px] font-black uppercase tracking-tighter text-white">
                Live Tracking
              </h1>
              <p className="text-[8px] font-bold text-brand uppercase tracking-widest mt-0.5">
                #{rideId.slice(-6).toUpperCase()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <SOSButton rideId={rideId} />
          </div>
        </div>

        {/* SCROLLABLE DATA PANEL */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-slate-50/30">
          {/* STATUS BADGE */}
          <div className="flex justify-center">
            <span className="px-4 py-1 bg-white border border-[#EBD9D0] rounded-full text-[9px] font-black uppercase tracking-widest text-brand shadow-sm flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {statusText[rideStatus] || rideStatus}
            </span>
          </div>

          {/* OTP ALERT */}
          {otp && rideStatus === "DRIVER_ARRIVED" && (
            <div className="bg-[#FFF1EC] border-2 border-dashed border-brand/30 p-6 rounded-[2.5rem] text-center">
              <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-2">
                Ride Verification OTP
              </p>
              <p className="text-5xl font-black tracking-[0.3em] text-[#2D1B18]">
                {otp}
              </p>
            </div>
          )}

          {/* DRIVER CARD */}
          {driver && (
            <div className="bg-white border border-[#F4E9E2] p-5 rounded-[2.5rem] shadow-sm flex items-center gap-4">

              <img
                src={driver.profileImage || driver.photo}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-brand/10"
                alt={driver.name}
              />

              <div className="flex-1">
                <h4 className="text-xs font-black uppercase tracking-tight">
                  {driver.name}
                </h4>

                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  ⭐ {ratingAvg ? ratingAvg.toFixed(1) : "—"}
                  {ratingCount ? ` (${ratingCount})` : ""}
                </p>
              </div>

              {/* 📞 CALL BUTTON */}
              {driver.mobile && (
                <a
                  href={`tel:${driver.mobile}`}
                  className="px-4 py-3 bg-[#2D1B18] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-brand transition-all active:scale-95"
                >
                  📞 Call Driver
                </a>
              )}

            </div>
          )}


          {/* LOGISTICS */}
          {ride && (
            <div className="bg-white border border-[#F4E9E2] p-5 rounded-[2.5rem] shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-[9px] font-black uppercase tracking-widest text-brand">
                  Route{" "}
                </h3>
              </div>

              <div className="flex gap-3">
                <div className="flex flex-col items-center pt-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-brand"></div>
                  <div className="w-[1px] h-8 bg-slate-200"></div>
                  <div className="h-1.5 w-1.5 rounded-full border border-slate-300"></div>
                </div>

                <div className="flex-1 space-y-3">
                  <p className="text-[10px] font-bold text-[#2D1B18] leading-tight line-clamp-1">
                    {ride.pickupLocation?.address}
                  </p>
                  <p className="text-[10px] font-bold text-[#2D1B18] leading-tight line-clamp-1">
                    {ride.dropLocation?.address}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-50">
                <div className="text-center">
                  <p className="text-[8px] font-black text-slate-400 uppercase">
                    Total Fare
                  </p>
                  <p className="text-sm font-black text-brand">
                    ₹{ride.fareBreakdown?.totalFare ?? ride.totalFare ?? "—"}
                  </p>
                </div>

                <div className="text-center space-y-2">
                  <p className="text-[8px] font-black text-slate-400 uppercase">
                    Payment
                  </p>

                  <p className="text-[10px] font-black uppercase tracking-tighter">
                    {(ride.paymentMode || "—").replace("_", " ")}
                  </p>

                  {ride.paymentStatus === "UNPAID" &&
                    ride.paymentMode === "pay_after_ride" && (
                      <button
                        onClick={handlePayNow}
                        disabled={payLoading}
                        className="mt-2 px-4 py-2 bg-[#2D1B18] text-white text-[9px] font-black uppercase rounded-xl shadow-md hover:bg-brand transition active:scale-95 disabled:opacity-60"
                      >
                        {payLoading ? "Processing..." : "Pay Now"}
                      </button>
                    )}

                  {ride.paymentStatus === "PAID" && (
                    <p className="text-[9px] font-black text-emerald-600 uppercase">
                      Paid Online ✅
                    </p>
                  )}
                </div>


                {canCancel && (
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => setShowCancel(true)}
                      className="px-5 py-2 text-[9px] font-black uppercase text-red-500 bg-red-50 rounded-xl border border-red-100 active:scale-95 transition"
                    >
                      Cancel Trip
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* DESKTOP CHAT */}
          <div className="hidden lg:flex bg-white border border-[#F4E9E2] rounded-[2.5rem] h-[290px] flex-col overflow-hidden">
            <ChatBox rideId={rideId} userId="client" clientPhone={driver?.mobile}

            />
          </div>
        </div>

        {/* MOBILE CHAT BUTTON */}
        <button
          onClick={() => setShowChatModal(true)}
          className="lg:hidden fixed bottom-6 right-6 h-14 w-14 bg-[#2D1B18] text-white rounded-full shadow-2xl flex items-center justify-center z-[60] border-4 border-white active:scale-90 transition-all"
        >
          <span className="text-xl">💬</span>
        </button>
      </div>

      {/* RIGHT COLUMN: MAP */}
      <div className="w-full lg:w-1/2 h-[50vh] lg:h-full relative bg-slate-200 z-10 border-l border-[#EBD9D0]">
        {!["COMPLETED", "CANCELLED_AUTO"].includes(rideStatus) && (
          <MapView
            driverLocation={driverLocation}
            pickup={pickup}
            drop={drop}
            rideStatus={rideStatus}
          />
        )}
        {fare && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-500">
            <LiveFare fare={fare} />
          </div>
        )}

        <div className="absolute top-6 right-6 hidden lg:block z-20">
          <div className="bg-[#2D1B18]/90 backdrop-blur-md px-5 py-3 rounded-2xl text-white shadow-2xl border border-white/10">
            <p className="text-[8px] font-black text-brand uppercase tracking-[0.4em]">
              Signal Active
            </p>
          </div>
        </div>
      </div>

      {/* MOBILE CHAT MODAL */}
      {showChatModal && (
        <div className="lg:hidden fixed inset-0 z-[100] flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowChatModal(false)}
          ></div>
          <div className="relative w-full bg-white rounded-t-[2.5rem] h-[80vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-full duration-500">
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto my-3 shrink-0"></div>
            <div className="px-6 py-2 border-b border-slate-50 flex justify-between items-center">
              <p className="text-[10px] font-black text-brand uppercase tracking-widest">
                Chat with Driver
              </p>
              <button
                onClick={() => setShowChatModal(false)}
                className="text-xs font-black text-slate-400"
              >
                CLOSE
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatBox rideId={rideId} userId="client" />
            </div>
          </div>
        </div>
      )}

      <CancelModal
        showCancel={showCancel}
        setShowCancel={setShowCancel}
        cancelReason={cancelReason}
        setCancelReason={setCancelReason}
        confirmCancel={confirmCancel}
        cancelLoading={cancelLoading}
      />

      <RatingModal
        showRating={showRating}
        setShowRating={setShowRating}
        driver={driver}
        rating={rating}
        setRating={setRating}
        feedback={feedback}
        setFeedback={setFeedback}
        submitRating={submitRating}
        navigate={navigate}
      />

    </div>
  );
}
