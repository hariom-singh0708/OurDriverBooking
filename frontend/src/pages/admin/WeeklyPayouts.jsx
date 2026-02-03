import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Calendar, RefreshCw, CreditCard, Users, TrendingUp, CheckCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

function getThisMonday() {
  const now = new Date();
  const day = now.getDay();
  const diffToMon = (day + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diffToMon);
  monday.setHours(0, 0, 0, 0);
  return toISODateInput(monday);
}

export default function WeeklyPayouts() {
  const [week, setWeek] = useState(() => getThisMonday());
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [err, setErr] = useState("");
  const loadReqId = useRef(0);
  const navigate=useNavigate();
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
      if (reqId !== loadReqId.current) return;
      setRows(res?.data?.data?.drivers || []);
    } catch (e) {
      if (reqId !== loadReqId.current) return;
      setErr(e?.response?.data?.message || e?.message || "Failed to load payouts");
      setRows([]);
    } finally {
      if (reqId === loadReqId.current) setLoading(false);
    }
  };

  useEffect(() => {
    if (!week) return;
    load();
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
      `Pay weekly payout?\nWeek: ${toISODateInput(startDate)} → ${toISODateInput(endDate)}\nDrivers to pay: ${payableDrivers.length}`
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
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || "Failed to pay weekly payouts");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 bg-[#FBF9F6] min-h-screen space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between border-b border-stone-200 pb-8">
        <div>
          <span className="text-[#C05D38] text-[10px] font-black uppercase tracking-[0.4em]">Financial Settlement</span>
          <h1 className="text-3xl font-black text-stone-900 tracking-tighter uppercase mt-1">Weekly Payouts</h1>
          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-2">
            Revenue Share: <span className="text-stone-900">50% Partner Commission</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin/payouts/history")}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-stone-200 text-stone-600 font-black text-[10px] uppercase tracking-widest hover:bg-stone-50 transition-all shadow-sm hover:cursor-pointer"
          >
            <Clock size={14} />
            Payout History
          </button>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-stone-200 text-stone-600 font-black text-[10px] uppercase tracking-widest hover:bg-stone-50 transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            {loading ? "Syncing..." : "Sync Logs"}
          </button>

          <button
            onClick={payThisWeek}
            disabled={!week || paying || loading}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-stone-900 text-white font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-stone-800 transition-all disabled:opacity-30 active:scale-95"
          >
            {paying ? "Processing..." : "Authorize Payouts"}
          </button>
        </div>
      </div>

      {/* Week Selector & Metadata */}
      <div className="bg-white border border-stone-100 rounded-3xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="space-y-1">
            <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-1">Select Billing Week</p>
            <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C05D38]" size={16} />
                <input
                    type="date"
                    value={week}
                    onChange={(e) => setWeek(e.target.value)}
                    className="bg-[#F9F6F0] border-none rounded-xl pl-10 pr-4 py-3 text-xs font-bold text-stone-700 outline-none focus:ring-2 focus:ring-[#C05D38]/20"
                />
            </div>
          </div>
          {startDate && endDate && (
            <div className="bg-[#F9F6F0] px-5 py-3 rounded-2xl border border-stone-100">
                <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest">Active Cycle</p>
                <p className="text-[11px] font-bold text-stone-700">
                    {toISODateInput(startDate)} <span className="text-[#C05D38] mx-1">→</span> {toISODateInput(endDate)}
                </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-6 divide-x divide-stone-100">
          <div className="text-center">
            <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Payable Drivers</p>
            <p className="text-xl font-black text-stone-900">{totals.payableDrivers}</p>
          </div>
          <div className="text-center pl-6">
            <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Inactive Partners</p>
            <p className="text-xl font-black text-stone-400">{totals.zeroDrivers}</p>
          </div>
        </div>
      </div>

      {err && (
        <div className="bg-[#FFF5F2] border border-[#C05D38]/20 text-[#C05D38] p-5 rounded-2xl flex items-center gap-3 animate-pulse">
          <TrendingUp className="rotate-180" size={18} />
          <p className="text-xs font-bold uppercase tracking-tight">{err}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-stone-100 rounded-3xl p-6 shadow-sm">
          <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3">Total Fleet Volume</p>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-black text-stone-900 tracking-tighter">{totals.rides}</p>
            <Users className="text-stone-200" size={24} />
          </div>
          <p className="text-[9px] font-bold text-stone-400 uppercase mt-2">Completed Rides</p>
        </div>

        <div className="bg-white border border-stone-100 rounded-3xl p-6 shadow-sm">
          <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3">Gross Fare Revenue</p>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-black text-stone-900 tracking-tighter">{formatMoney(totals.gross)}</p>
            <TrendingUp className="text-stone-200" size={24} />
          </div>
          <p className="text-[9px] font-bold text-stone-400 uppercase mt-2">Total System Billing</p>
        </div>

        <div className="bg-white border border-stone-100 rounded-3xl p-6 shadow-lg shadow-stone-100 border-t-4 border-t-[#C05D38]">
          <p className="text-[10px] font-black text-[#C05D38] uppercase tracking-widest mb-3">Net Partner Payout</p>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-black text-stone-900 tracking-tighter">{formatMoney(totals.payable)}</p>
            <CreditCard className="text-[#C05D38]/30" size={24} />
          </div>
          <p className="text-[9px] font-bold text-stone-400 uppercase mt-2">Disbursement Estimate</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-stone-100 rounded-[2rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F9F6F0]/50 border-b border-stone-50">
                <th className="py-5 px-8 text-[10px] font-black text-stone-400 uppercase tracking-widest">Driver Partner</th>
                <th className="py-5 px-6 text-center text-[10px] font-black text-stone-400 uppercase tracking-widest">Ride Count</th>
                <th className="py-5 px-6 text-center text-[10px] font-black text-stone-400 uppercase tracking-widest">Gross Booking</th>
                <th className="py-5 px-8 text-right text-[10px] font-black text-stone-400 uppercase tracking-widest">Commission (50%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {rows.map((d) => {
                const payable = Number(d?.payable || 0);
                return (
                  <tr key={d.driverId} className="group hover:bg-[#F9F6F0]/20 transition-colors">
                    <td className="py-6 px-8">
                      <div className="font-black text-stone-900 uppercase tracking-tight text-sm">
                        {d?.driver?.name || "—"}
                      </div>
                      <div className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-0.5">
                        {d?.driver?.mobile || d?.driver?.email}
                      </div>
                    </td>
                    <td className="py-6 px-6 text-center">
                        <span className="bg-stone-100 text-stone-600 px-3 py-1 rounded-full text-[10px] font-black">
                            {d?.rides ?? 0}
                        </span>
                    </td>
                    <td className="py-6 px-6 text-center text-stone-500 font-bold text-sm">
                        {formatMoney(d?.gross)}
                    </td>
                    <td className="py-6 px-8 text-right">
                      {payable > 0 ? (
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-black text-stone-900">{formatMoney(payable)}</span>
                          <span className="flex items-center gap-1 text-[9px] font-black text-[#C05D38] uppercase tracking-tighter mt-1">
                            <CheckCircle size={10} /> Authorized
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">Zero Activity</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!rows.length && (
                <tr>
                  <td colSpan="4" className="py-20 text-center">
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em]">
                        {loading ? "Syncing Manifest..." : "No data discovered for this cycle"}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}