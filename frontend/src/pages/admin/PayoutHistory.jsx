import { useEffect, useState } from "react";
import { getPayoutHistory } from "../../services/admin.payouts";

function money(n) {
  return "₹" + Number(n || 0).toLocaleString("en-IN");
}

export default function PayoutHistory() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    getPayoutHistory().then(res => {
      setRows(res.data.data || []);
    });
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">💳 Driver Payment History</h1>

      <div className="bg-white rounded-xl shadow border overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-3">Driver</th>
              <th className="p-3">Week</th>
              <th className="p-3">Rides</th>
              <th className="p-3">Gross</th>
              <th className="p-3">Driver Pay</th>
              <th className="p-3">Status</th>
              <th className="p-3">Paid At</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(p => (
              <tr key={p._id} className="border-b">
                <td className="p-3">
                  <div className="font-bold">{p.driverId?.name}</div>
                  <div className="text-xs text-gray-500">{p.driverId?.mobile}</div>
                </td>
                <td className="p-3">
                  {new Date(p.weekStart).toLocaleDateString()} →{" "}
                  {new Date(p.weekEnd).toLocaleDateString()}
                </td>
                <td className="p-3 text-center">{p.rides}</td>
                <td className="p-3">{money(p.gross)}</td>
                <td className="p-3 font-bold text-green-700">
                  {money(p.payable)}
                </td>
                <td className="p-3">
                  {p.status === "PAID" ? (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                      PAID
                    </span>
                  ) : (
                    <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs">
                      PENDING
                    </span>
                  )}
                </td>
                <td className="p-3 text-xs">
                  {p.paidAt ? new Date(p.paidAt).toLocaleString() : "—"}
                </td>
              </tr>
            ))}

            {!rows.length && (
              <tr>
                <td colSpan="7" className="p-6 text-center text-gray-500">
                  No payouts yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
