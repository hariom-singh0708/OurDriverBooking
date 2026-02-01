import { useState } from "react";
import { createRide } from "../../services/ride.api";
import { useNavigate } from "react-router-dom";

export default function BookRide() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

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

      console.log("📤 Booking payload:", payload);

      const res = await createRide(payload);

      const rideId = res.data?.data?._id;

      if (!rideId) {
        throw new Error("Ride ID not returned from server");
      }

      // ✅ REDIRECT TO LIVE RIDE PAGE
      navigate(`/client/live/${rideId}`);
    } catch (err) {
      console.error("❌ Booking failed:", err.response?.data || err);
      alert(
        err.response?.data?.message ||
          "Ride booking failed. Check console."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <h2 className="text-xl font-bold">Book Ride</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <select name="bookingType" onChange={handleChange} className="input">
          <option value="distance_based">Distance Based</option>
          <option value="time_based">Time Based</option>
        </select>

        {form.bookingType === "distance_based" && (
          <input
            name="distance"
            placeholder="Distance (km)"
            className="input"
            required
            onChange={handleChange}
          />
        )}

        {form.bookingType === "time_based" && (
          <input
            name="bookingDuration"
            placeholder="Booking Duration (hours)"
            className="input"
            required
            onChange={handleChange}
          />
        )}

        <input
          name="pickupAddress"
          placeholder="Pickup Address"
          className="input"
          required
          onChange={handleChange}
        />

        <input
          name="dropAddress"
          placeholder="Drop Address"
          className="input"
          required
          onChange={handleChange}
        />

        <select name="rideType" onChange={handleChange} className="input">
          <option value="one-way">One Way</option>
          <option value="two-way">Two Way</option>
        </select>

        {form.rideType === "two-way" && (
          <input
            name="waitingTime"
            placeholder="Waiting Time (minutes)"
            className="input"
            required
            onChange={handleChange}
          />
        )}

        <select name="paymentMode" onChange={handleChange} className="input">
          <option value="pay_after_ride">Pay After Ride</option>
          <option value="pay_now">Pay Now</option>
        </select>

        <button
          disabled={loading}
          className="w-full bg-black text-white p-2"
        >
          {loading ? "Booking..." : "Book Ride"}
        </button>
      </form>
    </div>
  );
}
