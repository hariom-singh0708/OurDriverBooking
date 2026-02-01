export default function LiveFare({ fare }) {
  return (
    <div className="border p-3 rounded bg-white">
      <h3 className="font-bold">Live Fare</h3>
      <p>Total: ₹{fare.totalFare}</p>
      <p>Waiting Charge: ₹{fare.waitingCharge}</p>
    </div>
  );
}
