import { confirmOfflinePayment } from "../services/payment.api";

export default function ConfirmPayment({ rideId }) {
  const confirm = async () => {
    await confirmOfflinePayment(rideId);
    alert("Payment confirmed. Ride completed.");
  };

  return (
    <button
      onClick={confirm}
      className="bg-black text-white px-4 py-2"
    >
      Confirm Payment
    </button>
  );
}
