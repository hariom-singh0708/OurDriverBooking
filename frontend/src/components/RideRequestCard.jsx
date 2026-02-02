export default function RideRequestCard({ ride, onAccept, onReject }) {
  if (!ride) return null;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4 text-gray-200">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        🚕 New Ride Request
      </h3>

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

      {/* FARE */}
      <div className="flex justify-between items-center pt-2 border-t border-gray-800">
        <span className="text-gray-400 text-sm">Fare</span>
        <span className="text-xl font-bold text-green-400">
          ₹{ride.fareBreakdown.totalFare}
        </span>
      </div>

      {/* ACTIONS */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onAccept}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition"
        >
          Accept
        </button>

        <button
          onClick={onReject}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
