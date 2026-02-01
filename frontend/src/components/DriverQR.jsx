export default function DriverQR({ amount }) {
  return (
    <div className="border p-4 text-center bg-white">
      <p className="font-bold">Scan & Pay</p>
      <p>Amount: ₹{amount}</p>
      <div className="mt-2 p-6 bg-gray-200">
        QR CODE
      </div>
    </div>
  );
}
