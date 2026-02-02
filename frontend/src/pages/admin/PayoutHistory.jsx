import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/admin";

const auth = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

function money(n) {
  return "₹" + Number(n || 0).toLocaleString("en-IN");
}

export default function PayoutHistory() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setErr("");

      const res = await axios.get(`${API}/payouts`, auth());

      // ✅ Correct mapping
      setRows(res.data?.data || []);
    } catch (e) {
      console.log("PAYOUT HISTORY ERROR:", e?.response?.status, e?.response?.data);
      setErr("Failed to load payout history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">💳 Driver Payment History</h1>
        <button
          onClick={load}
          className="bg-black text-white px-4 py-2 rounded-lg"
        >
          Refresh
        </button>
      </div>

      {err && (
        <div className="bg-red-100 text-red-700 border p-4 rounded-lg">
          {err}
        </div>
      )}

      <div className="bg-white rounded-xl shadow border overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-3 text-left">Driver</th>
              <th className="p-3">Week</th>
              <th className="p-3">Rides</th>
              <th className="p-3">Gross</th>
              <th className="p-3">Driver Pay</th>
              <th className="p-3">Status</th>
              <th className="p-3">Paid At</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((p) => (
              <tr key={p._id} className="border-b">
                <td className="p-3">
                  <div className="font-bold">{p.driverId?.name || "—"}</div>
                  <div className="text-xs text-gray-500">
                    {p.driverId?.mobile || ""}
                  </div>
                </td>

                <td className="p-3 text-center">
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
                  {p.paidAt
                    ? new Date(p.paidAt).toLocaleString()
                    : "—"}
                </td>
              </tr>
            ))}

            {!rows.length && !loading && (
              <tr>
                <td colSpan="7" className="p-6 text-center text-gray-500">
                  No payouts yet
                </td>
              </tr>
            )}

            {loading && (
              <tr>
                <td colSpan="7" className="p-6 text-center">
                  Loading...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
