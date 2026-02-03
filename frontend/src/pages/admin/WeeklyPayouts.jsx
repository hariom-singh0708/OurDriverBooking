// WeeklyPayouts.jsx
import { useEffect, useMemo, useRef, useState } from "react";
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

// ✅ helper: current week Monday
function getThisMonday() {
  const now = new Date();
  const day = now.getDay(); // 0 Sun ... 6 Sat
  const diffToMon = (day + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diffToMon);
  monday.setHours(0, 0, 0, 0);
  return toISODateInput(monday);
}

export default function WeeklyPayouts() {
  // ✅ default week = this monday, so page open होते ही data दिखे
  const [week, setWeek] = useState(() => getThisMonday());

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [err, setErr] = useState("");

  // ✅ avoid duplicate load on fast changes
  const loadReqId = useRef(0);

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
    const reqId = ++loadReqId.current;

    try {
      setLoading(true);
      setErr("");

      const res = await axios.get(`${API}/payouts/weekly`, {
        ...auth(),
        params: week ? { start: week } : {},
      });

      // ✅ if newer request came, ignore old response
      if (reqId !== loadReqId.current) return;

      setRows(res?.data?.data?.drivers || []);
    } catch (e) {
      if (reqId !== loadReqId.current) return;

      console.log(
        "WEEKLY PAYOUT LOAD ERROR:",
        e?.response?.status,
        e?.response?.data,
        e?.message
      );
      setErr(e?.response?.data?.message || e?.message || "Failed to load payouts");
      setRows([]);
    } finally {
      if (reqId === loadReqId.current) setLoading(false);
    }
  };

  // ✅ AUTO refresh when week changes
  useEffect(() => {
    if (!week) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [week]);

  const totals = useMemo(() => {
    const rides = rows.reduce((a, x) => a + Number(x?.rides || 0), 0);
    const gross = rows.reduce((a, x) => a + Number(x?.gross || 0), 0);
    const payable = rows.reduce((a, x) => a + Number(x?.payable || 0), 0);

    const payableDrivers = rows.filter((d) => Number(d?.payable || 0) > 0).length;
    const zeroDrivers = rows.filter((d) => Number(d?.payable || 0) <= 0).length;

    return { rides, gross, payable, payableDrivers, zeroDrivers };
  }, [rows]);

  const payThisWeek = async () => {
    if (!startDate || !endDate) {
      alert("Please select week start date (Monday).");
      return;
    }

    if (!rows.length) {
      alert("No drivers found for this week.");
      return;
    }

    const payableDrivers = rows.filter((d) => Number(d?.payable || 0) > 0);
    if (!payableDrivers.length) {
      alert("No payable drivers (all have 0 rides).");
      return;
    }

    const ok = window.confirm(
      `Pay weekly payout?\nWeek: ${toISODateInput(startDate)} → ${toISODateInput(endDate)}\nDrivers to pay: ${
        payableDrivers.length
      }`
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

      alert("✅ Weekly payouts marked as PAID");
      await load(); // ✅ refresh list after pay
    } catch (e) {
      console.log("WEEKLY PAY ERROR:", e?.response?.status, e?.response?.data, e?.message);
      alert(e?.response?.data?.message || e?.message || "Failed to pay weekly payouts");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Weekly Driver Payouts</h1>
          <p className="text-sm text-gray-500 mt-1">
            Driver gets <b>50%</b> of completed ride fare (weekly).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
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

      {/* Week selector */}
      <div className="bg-white border rounded-xl p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
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

        <div className="text-sm text-gray-700">
          Drivers to pay: <b>{totals.payableDrivers}</b> &nbsp;|&nbsp; No rides:{" "}
          <b>{totals.zeroDrivers}</b>
        </div>
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
          <div className="text-2xl font-extrabold text-green-700">
            {formatMoney(totals.payable)}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl shadow-sm overflow-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-3 text-left">Driver</th>
              <th className="p-3 text-center">Rides</th>
              <th className="p-3 text-center">Gross Fare</th>
              <th className="p-3 text-center">Driver 50%</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((d) => {
              const payable = Number(d?.payable || 0);
              return (
                <tr key={d.driverId} className="border-b last:border-b-0">
                  <td className="p-3">
                    <div className="font-bold">{d?.driver?.name || "—"}</div>
                    <div className="text-xs text-gray-500">
                      {d?.driver?.mobile || d?.driver?.email || ""}
                    </div>
                  </td>

                  <td className="p-3 text-center">{d?.rides ?? 0}</td>

                  <td className="p-3 text-center">{formatMoney(d?.gross)}</td>

                  <td className="p-3 text-center">
                    {payable > 0 ? (
                      <div className="text-green-700 font-extrabold">
                        {formatMoney(payable)}
                        <div className="text-[11px] text-green-600 font-semibold">
                          Will be paid
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-400 text-xs">No rides</div>
                    )}
                  </td>
                </tr>
              );
            })}

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
