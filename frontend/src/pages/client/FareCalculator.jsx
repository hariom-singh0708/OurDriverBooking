import { useState, useEffect } from "react";
import { getFareEstimate } from "../../services/fare.api";
import FareBreakdown from "../../components/FareBreakdown";

export default function FareCalculator() {
  const [form, setForm] = useState({
    bookingType: "distance_based",
    distance: 0,
    bookingDuration: 0,
    rideType: "one-way",
    waitingTime: 0,
  });

  const [fare, setFare] = useState(null);

  useEffect(() => {
    getFareEstimate(form).then((res) => setFare(res.data.data));
  }, [form]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">Fare Calculator</h2>

      <select name="bookingType" onChange={handleChange} className="input">
        <option value="distance_based">Distance Based</option>
        <option value="time_based">Time Based</option>
      </select>

      {form.bookingType === "distance_based" && (
        <input
          name="distance"
          placeholder="Distance (km)"
          className="input"
          onChange={handleChange}
        />
      )}

      {form.bookingType === "time_based" && (
        <input
          name="bookingDuration"
          placeholder="Hours"
          className="input"
          onChange={handleChange}
        />
      )}

      <select name="rideType" onChange={handleChange} className="input">
        <option value="one-way">One Way</option>
        <option value="two-way">Two Way</option>
      </select>

      {form.rideType === "two-way" && (
        <input
          name="waitingTime"
          placeholder="Waiting time (min)"
          className="input"
          onChange={handleChange}
        />
      )}

      <FareBreakdown fare={fare} />
    </div>
  );
}
