import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/admin";

const auth = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

function formatMoney(n) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));
}

function toISODateInput(d) {
  if (!d) return "";
  const x = new Date(d);
  const yyyy = x.getFullYear();
  const mm = String(x.getMonth() + 1).padStart(2, "0");
  const dd = String(x.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function WeeklyPayouts() {
  const [week, setWeek] = useState(""); // week start date (recommended: Monday)
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [err, setErr] = useState("");

  const { startDate, endDate } = useMemo(() => {
    if (!week) return { startDate: null, endDate: null };
    const s = new Date(week);
    s.setHours(0, 0, 0, 0);
    const e = new Date(s);
    e.setDate(s.getDate() + 6);
    e.setHours(23, 59, 59, 999);
    return { startDate: s, endDate: e };
  }, [week]);

  const load = async () => {
    try {
      setLoading(true);
      setErr("");

      const res = await axios.get(`${API}/payouts/weekly`, {
        ...auth(),
        params: week ? { start: week } : {},
      });

      setRows(res?.data?.data?.drivers || []);
    } catch (e) {
      console.log("WEEKLY PAYOUT LOAD ERROR:", e?.response?.status, e?.response?.data, e?.message);
      setErr(e?.response?.data?.message || e?.message || "Failed to load payouts");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const payThisWeek = async () => {
    if (!startDate || !endDate) {
      alert("Please select week start date (Monday).");
      return;
    }

    const ok = window.confirm(
      `Pay all drivers for this week?\n${toISODateInput(startDate)} to ${toISODateInput(endDate)}`
    );
    if (!ok) return;

    try {
      setPaying(true);
      setErr("");

      await axios.post(
        `${API}/payouts/weekly/pay`,
        {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          note: `Weekly payout ${toISODateInput(startDate)} - ${toISODateInput(endDate)}`,
        },
        auth()
      );

      alert("✅ Weekly payouts paid successfully");
      await load();
    } catch (e) {
      console.log("WEEKLY PAY ERROR:", e?.response?.status, e?.response?.data, e?.message);
      alert(e?.response?.data?.message || e?.message || "Failed to pay weekly payouts");
    } finally {
      setPaying(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totals = useMemo(() => {
    const rides = rows.reduce((a, x) => a + Number(x?.rides || 0), 0);
    const gross = rows.reduce((a, x) => a + Number(x?.gross || 0), 0);
    const payable = rows.reduce((a, x) => a + Number(x?.payable || 0), 0);
    return { rides, gross, payable };
  }, [rows]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Weekly Driver Payouts</h1>
          <p className="text-sm text-gray-500 mt-1">
            Driver gets <b>50%</b> of completed ride fare (weekly).
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={load}
            disabled={loading}
            className={`px-4 py-2 rounded-lg font-semibold ${
              loading ? "bg-gray-300 text-gray-700" : "bg-black text-white"
            }`}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>

          <button
            onClick={payThisWeek}
            disabled={!week || paying || loading}
            className={`px-4 py-2 rounded-lg font-semibold ${
              !week || paying || loading
                ? "bg-green-200 text-green-900 cursor-not-allowed"
                : "bg-green-700 text-white hover:bg-green-800"
            }`}
          >
            {paying ? "Paying..." : "Pay This Week"}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="text-sm font-semibold text-gray-700">Week start (Monday)</div>
        <input
          type="date"
          value={week}
          onChange={(e) => setWeek(e.target.value)}
          className="border rounded px-3 py-2"
        />
        {startDate && endDate && (
          <div className="text-sm text-gray-600">
            Range: <b>{toISODateInput(startDate)}</b> → <b>{toISODateInput(endDate)}</b>
          </div>
        )}
      </div>

      {/* Error */}
      {err && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
          {err}
        </div>
      )}

      {/* Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border rounded-xl p-4">
          <div className="text-xs font-semibold text-gray-500">Total Rides</div>
          <div className="text-2xl font-extrabold">{totals.rides}</div>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <div className="text-xs font-semibold text-gray-500">Gross Fare</div>
          <div className="text-2xl font-extrabold">{formatMoney(totals.gross)}</div>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <div className="text-xs font-semibold text-gray-500">Total Payable (50%)</div>
          <div className="text-2xl font-extrabold text-green-700">{formatMoney(totals.payable)}</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl shadow-sm overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-3 text-left">Driver</th>
              <th className="p-3 text-center">Rides</th>
              <th className="p-3 text-center">Gross Fare</th>
              <th className="p-3 text-center">Driver 50%</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d) => (
              <tr key={d.driverId} className="border-b last:border-b-0">
                <td className="p-3">
                  <div className="font-bold">{d?.driver?.name || "—"}</div>
                  <div className="text-xs text-gray-500">
                    {d?.driver?.mobile || d?.driver?.email || ""}
                  </div>
                </td>
                <td className="p-3 text-center">{d?.rides ?? 0}</td>
                <td className="p-3 text-center">{formatMoney(d?.gross)}</td>
                <td className="p-3 text-center font-extrabold text-green-700">
                  {formatMoney(d?.payable)}
                </td>
              </tr>
            ))}

            {!rows.length && (
              <tr>
                <td colSpan="4" className="p-8 text-center text-gray-500">
                  {loading ? "Loading..." : "No data for this week"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
