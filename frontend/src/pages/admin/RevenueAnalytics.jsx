import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { TrendingUp, ArrowUpRight, Download } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function formatINR(n) {
  const num = Number(n || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

function downloadCSV(filename, rows) {
  const escape = (v) => {
    const s = String(v ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n"))
      return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const csv = rows.map((r) => r.map(escape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function niceBucketLabel(range, key, fallbackLabel) {
  if (!key) return fallbackLabel || "—";
  if (range === "year") return key; // YYYY-MM
  return String(key).slice(5); // MM-DD
}

// ✅ Revenue page token helper (ONLY in this file)
function getRevenueToken() {
  let t = localStorage.getItem("token") || "";
  t = String(t).trim();
  // remove quotes if token saved like "eyJ..."
  t = t.replace(/^"(.+)"$/, "$1").trim();
  // remove Bearer if already included
  if (t.toLowerCase().startsWith("bearer ")) t = t.slice(7).trim();
  return t;
}

export default function RevenueAnalytics() {
  const [range, setRange] = useState("week"); // week | month | year
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({ from: "", to: "" });

  const [summary, setSummary] = useState({
    totalNetRevenue: 0,
    avgRideValue: 0,
    driverCommissions: 0,
    systemProfit: 0,
    changePct: 0,
    targetPct: 0,
    targetValue: 0,
    from: null,
    to: null,
    range: "week",
  });

  const [series, setSeries] = useState([]); // [{ label, value, key }]

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      // ✅ always read latest token right before request
      const token = getRevenueToken();

      if (!token) {
        setError("Token missing. Please login again.");
        setSeries([]);
        setLoading(false);
        return;
      }

      // ✅ quick JWT shape validation
      if (token.split(".").length !== 3) {
        setError("Invalid token format. Please logout and login again.");
        setLoading(false);
        return;
      }

      const res = await axios.get(`${API_BASE}/admin/analytics/revenue`, {
        params: {
          range,
          from: filters.from || undefined,
          to: filters.to || undefined,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = res?.data || {};
      const s = data?.summary || {};

      setSummary({
        totalNetRevenue: s.totalNetRevenue ?? 0,
        avgRideValue: s.avgRideValue ?? 0,
        driverCommissions: s.driverCommissions ?? 0,
        systemProfit: s.systemProfit ?? 0,
        changePct: s.changePct ?? 0,
        targetPct: s.targetPct ?? 0,
        targetValue: s.targetValue ?? 0,
        from: s.from || null,
        to: s.to || null,
        range: s.range || range,
      });

      setSeries(Array.isArray(data?.series) ? data.series : []);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        (e?.response?.status === 401 ? "Unauthorized. Please login again." : "") ||
        "Failed to load revenue analytics";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  const applyDates = () => fetchAnalytics();

  const bars = useMemo(() => {
    const values = series.map((s) => Number(s.value || 0));
    const max = Math.max(1, ...values);
    return series.map((s) => {
      const h = Math.round((Number(s.value || 0) / max) * 100);
      return { ...s, height: Math.max(0, Math.min(100, h)) };
    });
  }, [series]);

  const fiscalLabel = useMemo(() => {
    if (filters.from && filters.to) return `${filters.from} → ${filters.to}`;

    if (summary.from && summary.to) {
      try {
        const a = new Date(summary.from).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
        const b = new Date(summary.to).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
        return `${a} → ${b}`;
      } catch {}
    }

    const now = new Date();
    return now.toLocaleString("en-IN", { month: "long", year: "numeric" });
  }, [filters.from, filters.to, summary.from, summary.to]);

  const changeIsUp = Number(summary.changePct || 0) >= 0;

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-screen bg-[#FBF9F6]">
        <div className="animate-spin h-8 w-8 border-4 border-[#C05D38] border-t-transparent rounded-full mb-4" />
        <p className="text-stone-400 text-xs font-black uppercase tracking-[0.3em]">
          Loading Revenue Analytics...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 bg-[#FBF9F6] min-h-screen space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between border-b border-stone-200 pb-8 gap-6">
        <div>
          <span className="text-[#C05D38] text-[10px] font-black uppercase tracking-[0.4em]">
            Financial Intelligence
          </span>
          <h1 className="text-4xl font-black text-stone-900 tracking-tighter uppercase mt-1">
            Revenue Performance
          </h1>
          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-2">
            Fiscal Period: <span className="text-stone-900">{fiscalLabel}</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Range Tabs */}
          <div className="flex bg-white border border-stone-200 rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setRange("week")}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                range === "week"
                  ? "bg-stone-900 text-white"
                  : "text-stone-400 hover:text-stone-900"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setRange("month")}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                range === "month"
                  ? "bg-stone-900 text-white"
                  : "text-stone-400 hover:text-stone-900"
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setRange("year")}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                range === "year"
                  ? "bg-stone-900 text-white"
                  : "text-stone-400 hover:text-stone-900"
              }`}
            >
              Year
            </button>
          </div>

          {/* Date Filters */}
          <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-xl p-2 shadow-sm">
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest text-stone-400 px-2">
                Start
              </span>
              <input
                type="date"
                className="px-2 py-1 text-xs font-bold text-stone-700 outline-none bg-transparent"
                value={filters.from}
                onChange={(e) => setFilters((p) => ({ ...p, from: e.target.value }))}
              />
            </div>

            <div className="h-8 w-px bg-stone-200" />

            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest text-stone-400 px-2">
                End
              </span>
              <input
                type="date"
                className="px-2 py-1 text-xs font-bold text-stone-700 outline-none bg-transparent"
                value={filters.to}
                onChange={(e) => setFilters((p) => ({ ...p, to: e.target.value }))}
              />
            </div>

            <button
              onClick={applyDates}
              className="ml-2 px-3 py-2 rounded-lg bg-stone-900 text-white text-[10px] font-black uppercase tracking-widest active:scale-95"
            >
              Apply
            </button>
          </div>

          {/* Download */}
          <button
            onClick={() => {
              const rows = [
                ["bucket", "revenue"],
                ...(series || []).map((s) => [s.key || s.label, Number(s.value || 0)]),
              ];
              downloadCSV(`revenue_${range}.csv`, rows);
            }}
            className="p-3 rounded-xl bg-white border border-stone-200 text-stone-600 hover:text-[#C05D38] transition-all shadow-sm"
            title="Download CSV"
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* Error */}
      {error ? (
        <div className="bg-white border border-red-100 rounded-2xl p-6 text-red-600 text-sm font-bold">
          {error}
        </div>
      ) : null}

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* REVENUE CHART AREA */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-stone-100 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-12">
              <div>
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                  Total Net Revenue
                </p>
                <h2 className="text-4xl font-black text-stone-900 tracking-tighter mt-1">
                  {formatINR(summary.totalNetRevenue)}
                </h2>
              </div>

              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
                  changeIsUp ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"
                }`}
              >
                <ArrowUpRight
                  className={changeIsUp ? "text-green-600" : "text-red-600 rotate-90"}
                  size={14}
                />
                <span className={`text-[10px] font-black uppercase ${changeIsUp ? "text-green-600" : "text-red-600"}`}>
                  {Number(summary.changePct || 0).toFixed(1)}% vs Prev
                </span>
              </div>
            </div>

            {/* Chart */}
            <div className="h-[350px] w-full bg-[#F9F6F0]/50 rounded-3xl border border-stone-50 flex items-end p-8 gap-4">
              {bars.length ? (
                bars.map((b, i) => (
                  <div key={`${b.key || b.label}_${i}`} className="flex-1 group relative">
                    <div
                      className="w-full bg-stone-200 group-hover:bg-[#C05D38] transition-all duration-500 rounded-t-lg"
                      style={{ height: `${b.height}%` }}
                      title={`${niceBucketLabel(range, b.key, b.label)}: ${formatINR(b.value)}`}
                    />
                    <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[9px] font-black text-stone-400 uppercase whitespace-nowrap">
                      {niceBucketLabel(range, b.key, b.label)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs font-black uppercase tracking-widest">
                  No data for selected period
                </div>
              )}
            </div>
          </div>
        </div>

        {/* METRIC SIDEBAR */}
        <div className="lg:col-span-4 space-y-6">
          <MetricSmallCard label="Average Ride Value" value={formatINR(summary.avgRideValue)} change="—" />
          <MetricSmallCard label="Driver Commissions" value={formatINR(summary.driverCommissions)} change="—" />
          <MetricSmallCard label="System Profit" value={formatINR(summary.systemProfit)} change="—" isPrimary />

          <div className="bg-stone-900 rounded-[2rem] p-8 text-white space-y-6 shadow-xl">
            <div className="flex justify-between items-start">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">
                Target Pulse
              </p>
              <TrendingUp className="text-[#C05D38]" size={20} />
            </div>

            <div>
              <h3 className="text-2xl font-black tracking-tighter">
                {Number(summary.targetPct || 0) >= 100 ? "Goal Achieved" : "In Progress"}
              </h3>

              <div className="mt-4 h-2 w-full bg-stone-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#C05D38] rounded-full"
                  style={{ width: `${Math.max(0, Math.min(100, Number(summary.targetPct || 0)))}%` }}
                />
              </div>

              <div className="flex justify-between mt-2">
                <span className="text-[9px] font-black uppercase text-stone-500">
                  {Number(summary.targetPct || 0).toFixed(0)}% of Target
                </span>
                <span className="text-[9px] font-black uppercase text-white">
                  {summary.targetValue ? `${formatINR(summary.targetValue)} Target` : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-[10px] font-black uppercase tracking-widest text-stone-400">
        Buckets: <span className="text-stone-700">{series?.length || 0}</span>
      </div>
    </div>
  );
}

function MetricSmallCard({ label, value, change, isPrimary }) {
  const changeText = String(change ?? "—");
  const isPlus = changeText.startsWith("+");

  return (
    <div
      className={`p-6 rounded-3xl border shadow-sm transition-all hover:translate-x-2 ${
        isPrimary ? "bg-white border-[#C05D38]/20 shadow-lg shadow-[#C05D38]/5" : "bg-white border-stone-100"
      }`}
    >
      <div className="flex justify-between items-start">
        <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">{label}</p>

        <span
          className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
            changeText === "—"
              ? "text-stone-500 bg-stone-100"
              : isPlus
              ? "text-green-600 bg-green-50"
              : "text-red-600 bg-red-50"
          }`}
        >
          {changeText}
        </span>
      </div>

      <h4 className={`text-2xl font-black tracking-tighter mt-2 ${isPrimary ? "text-[#C05D38]" : "text-stone-900"}`}>
        {value}
      </h4>
    </div>
  );
}
