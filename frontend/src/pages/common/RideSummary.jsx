export default function RideSummary({ ride }) {
  return (
    <div className="border p-4 rounded bg-white space-y-2">
      <h2 className="font-bold text-lg">Ride Summary</h2>

      <p><b>Pickup:</b> {ride.pickupLocation.address}</p>
      <p><b>Drop:</b> {ride.dropLocation.address}</p>

      <p><b>Total Fare:</b> ₹{ride.fareBreakdown.totalFare}</p>
      <p><b>Status:</b> {ride.status}</p>

      <p>
        <b>Completed At:</b>{" "}
        {new Date(ride.completedAt).toLocaleString()}
      </p>
    </div>
  );
}
