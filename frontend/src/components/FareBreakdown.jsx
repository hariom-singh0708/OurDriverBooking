export default function FareBreakdown({ fare }) {
  if (!fare) return null;

  return (
    <div className="border p-4 rounded bg-white space-y-2">
      <h3 className="font-bold text-lg">Fare Breakdown</h3>

      <div className="flex justify-between">
        <span>Base Fare</span>
        <span>₹{fare.baseFare}</span>
      </div>

      {fare.distanceFare > 0 && (
        <div className="flex justify-between">
          <span>Distance Fare</span>
          <span>₹{fare.distanceFare}</span>
        </div>
      )}

      {fare.timeFare > 0 && (
        <div className="flex justify-between">
          <span>Time Fare</span>
          <span>₹{fare.timeFare}</span>
        </div>
      )}

      {fare.waitingCharge > 0 && (
        <div className="flex justify-between">
          <span>Waiting Charge</span>
          <span>₹{fare.waitingCharge}</span>
        </div>
      )}

      <hr />

      <div className="flex justify-between font-bold">
        <span>Total</span>
        <span>₹{fare.totalFare}</span>
      </div>
    </div>
  );
}
