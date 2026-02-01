export default function RideRequestCard({ ride, onAccept, onReject }) {
  return (
    <div className="border p-4 rounded bg-white space-y-2">
      <h3 className="font-bold">New Ride Request</h3>

      <p><b>Pickup:</b> {ride.pickupLocation.address}</p>
      <p><b>Drop:</b> {ride.dropLocation.address}</p>
      <p><b>Fare:</b> ₹{ride.fareBreakdown.totalFare}</p>

      <div className="flex gap-3">
        <button
          onClick={onAccept}
          className="bg-green-600 text-white px-4 py-1"
        >
          Accept
        </button>
        <button
          onClick={onReject}
          className="bg-red-600 text-white px-4 py-1"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
