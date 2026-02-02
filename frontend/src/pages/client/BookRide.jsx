import { useState } from "react";
import {
  createRide,
  createPaymentOrder,
  verifyPayment,
} from "../../services/ride.api";
import { useNavigate } from "react-router-dom";

export default function BookRide() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [ride, setRide] = useState(null);

  const [form, setForm] = useState({
    bookingType: "distance_based",
    distance: "",
    bookingDuration: "",
    pickupAddress: "",
    dropAddress: "",
    rideType: "one-way",
    waitingTime: "",
    paymentMode: "pay_after_ride",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);

      const payload = {
        bookingType: form.bookingType,
        distance:
          form.bookingType === "distance_based"
            ? Number(form.distance)
            : undefined,
        bookingDuration:
          form.bookingType === "time_based"
            ? Number(form.bookingDuration)
            : undefined,
        pickupLocation: {
          address: form.pickupAddress,
          lat: 28.6139,
          lng: 77.209,
        },
        dropLocation: {
          address: form.dropAddress,
          lat: 28.7041,
          lng: 77.1025,
        },
        rideType: form.rideType,
        waitingTime:
          form.rideType === "two-way"
            ? Number(form.waitingTime)
            : 0,
        paymentMode: form.paymentMode,
      };

      // 1️⃣ CREATE RIDE
      const res = await createRide(payload);
      const createdRide = res.data.data;

      // PAY AFTER RIDE → OLD FLOW
      if (form.paymentMode === "pay_after_ride") {
        navigate(`/client/live/${createdRide._id}`);
        return;
      }

      // PAY NOW → OPEN POPUP
      setRide(createdRide);
      setShowPayment(true);
    } catch (err) {
      console.error(err);
      alert("Ride booking failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= RAZORPAY ================= */
  const handlePayment = async () => {
    if (!ride) return;

    if (!window.Razorpay) {
      alert("Razorpay SDK not loaded");
      return;
    }

    try {
      const orderRes = await createPaymentOrder(ride._id);
      const { orderId, amount, key } = orderRes.data.data;

      const rzp = new window.Razorpay({
        key,
        amount: amount * 100,
        currency: "INR",
        name: "Driver Booking",
        description: "Ride Payment",
        order_id: orderId,

        handler: async (response) => {
          await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          setShowPayment(false);
          navigate(`/client/live/${ride._id}`);
        },

        modal: {
          ondismiss: () => {
            setShowPayment(false);
            alert("Payment cancelled");
          },
        },

        theme: { color: "#4f46e5" },
      });

      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Payment failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#020617] p-6">
      <div className="max-w-xl mx-auto relative rounded-3xl p-[1px] bg-gradient-to-r from-indigo-600/60 to-cyan-500/60">
        <div className="bg-[#020617] rounded-3xl p-8 shadow-2xl">
          <h2 className="text-3xl font-extrabold text-white mb-6">
            🚗 Book a Driver
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <select
              name="bookingType"
              onChange={handleChange}
              className="w-full rounded-xl bg-white/5 border border-white/10 text-white p-3"
            >
              <option value="distance_based">Distance Based</option>
              <option value="time_based">Time Based</option>
            </select>

            {form.bookingType === "distance_based" && (
              <input
                name="distance"
                placeholder="Distance (km)"
                className="w-full rounded-xl bg-white/5 border border-white/10 text-white p-3"
                required
                onChange={handleChange}
              />
            )}

            {form.bookingType === "time_based" && (
              <input
                name="bookingDuration"
                placeholder="Booking Duration (hours)"
                className="w-full rounded-xl bg-white/5 border border-white/10 text-white p-3"
                required
                onChange={handleChange}
              />
            )}

            <input
              name="pickupAddress"
              placeholder="Pickup Address"
              className="w-full rounded-xl bg-white/5 border border-white/10 text-white p-3"
              required
              onChange={handleChange}
            />

            <input
              name="dropAddress"
              placeholder="Drop Address"
              className="w-full rounded-xl bg-white/5 border border-white/10 text-white p-3"
              required
              onChange={handleChange}
            />

            <select
              name="rideType"
              onChange={handleChange}
              className="w-full rounded-xl bg-white/5 border border-white/10 text-white p-3"
            >
              <option value="one-way">One Way</option>
              <option value="two-way">Two Way</option>
            </select>

            {form.rideType === "two-way" && (
              <input
                name="waitingTime"
                placeholder="Waiting Time (minutes)"
                className="w-full rounded-xl bg-white/5 border border-white/10 text-white p-3"
                required
                onChange={handleChange}
              />
            )}

            <select
              name="paymentMode"
              onChange={handleChange}
              className="w-full rounded-xl bg-white/5 border border-white/10 text-white p-3"
            >
              <option value="pay_after_ride">Pay After Ride</option>
              <option value="pay_now">Pay Now</option>
            </select>

            <button
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 py-3 text-white font-bold hover:opacity-90"
            >
              {loading ? "Booking..." : "Confirm Ride"}
            </button>
          </form>
        </div>
      </div>

      {/* ================= PAYMENT POPUP ================= */}
      {showPayment && ride && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#020617] border border-white/10 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold text-white mb-4">
              Complete Payment
            </h3>

            <p className="text-gray-400 text-sm mb-2">
              Pickup: {form.pickupAddress}
            </p>
            <p className="text-gray-400 text-sm mb-4">
              Drop: {form.dropAddress}
            </p>

            <div className="flex justify-between text-white font-semibold mb-6">
              <span>Total</span>
              <span>₹ {ride.fareBreakdown?.totalFare}</span>
            </div>

            <button
              onClick={handlePayment}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 py-3 text-white font-bold"
            >
              Pay ₹{ride.fareBreakdown?.totalFare}
            </button>

            <button
              onClick={() => setShowPayment(false)}
              className="w-full mt-3 text-sm text-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
