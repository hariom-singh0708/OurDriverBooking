import { useEffect, useState } from "react";
import { getDriverHistory } from "../../services/history.api";
import RideSummary from "../common/RideSummary";

export default function DriverHistory() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDriverHistory()
      .then((res) => setRides(res.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-6 space-y-5">
      <h1 className="text-2xl font-bold">📜 Completed Rides</h1>

      {/* LOADING */}
      {loading && (
        <p className="text-gray-400">Loading ride history...</p>
      )}

      {/* EMPTY STATE */}
      {!loading && rides.length === 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center text-gray-400">
          No completed rides yet
        </div>
      )}

      {/* RIDE LIST */}
      <div className="space-y-4">
        {rides.map((ride) => (
          <RideSummary key={ride._id} ride={ride} />
        ))}
      </div>
    </div>
  );
}
