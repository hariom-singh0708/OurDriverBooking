import DriverQR from "../../components/DriverQR";
import ConfirmPayment from "../../components/ConfirmPayment";

export default function DriverPayment({ ride }) {
  return (
    <div className="p-6 space-y-4">
      <DriverQR amount={ride.fareBreakdown.totalFare} />
      <ConfirmPayment rideId={ride._id} />
    </div>
  );
}
