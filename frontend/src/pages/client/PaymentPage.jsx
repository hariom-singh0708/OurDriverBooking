import PayNow from "../../components/PayNow";

export default function PaymentPage({ ride }) {
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">Complete Payment</h2>
      <p>Total Fare: ₹{ride.fareBreakdown.totalFare}</p>

      <PayNow rideId={ride._id} />
    </div>
  );
}
