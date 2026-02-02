export default function RideSummary({ ride }) {
  if (!ride) return null;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4 text-gray-200">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        🧾 Ride Summary
      </h2>

      {/* LOCATIONS */}
      <div className="space-y-1 text-sm">
        <p>
          <span className="text-gray-400">Pickup:</span>{" "}
          <span className="font-medium">
            {ride.pickupLocation.address}
          </span>
        </p>
        <p>
          <span className="text-gray-400">Drop:</span>{" "}
          <span className="font-medium">
            {ride.dropLocation.address}
          </span>
        </p>
      </div>

      {/* DIVIDER */}
      <div className="border-t border-gray-800" />

      {/* FARE */}
      <div className="flex justify-between items-center">
        <span className="text-gray-400">Total Fare</span>
        <span className="text-xl font-bold text-green-400">
          ₹{ride.fareBreakdown.totalFare}
        </span>
      </div>

      {/* STATUS */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-400">Status</span>
        <span
          className={`px-2 py-1 rounded text-xs font-semibold
            ${
              ride.status === "COMPLETED"
                ? "bg-green-900 text-green-300"
                : "bg-yellow-900 text-yellow-300"
            }`}
        >
          {ride.status.replaceAll("_", " ")}
        </span>
      </div>

      {/* COMPLETED AT */}
      {ride.completedAt && (
        <div className="text-sm text-gray-400">
          Completed at{" "}
          <span className="text-gray-300">
            {new Date(ride.completedAt).toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}
