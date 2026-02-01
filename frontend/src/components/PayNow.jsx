import { createOrder, verifyPayment } from "../services/payment.api";

export default function PayNow({ rideId }) {
  const pay = async () => {
    const res = await createOrder(rideId);
    const { orderId, amount, key } = res.data.data;

    const options = {
      key,
      amount: amount * 100,
      currency: "INR",
      order_id: orderId,
      handler: async (response) => {
        await verifyPayment(response);
        alert("Payment Successful");
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <button
      onClick={pay}
      className="bg-green-600 text-white px-4 py-2"
    >
      Pay Now
    </button>
  );
}
