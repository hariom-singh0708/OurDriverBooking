import { useEffect, useMemo, useState } from "react";
import { getAdminStats, getAdminRides } from "../../services/admin.api";
import RevenueAnalytics from "./RevenueAnalytics";

/* ---------------- helpers ---------------- */
const fmtDateTime = (v) => {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
};

const statusClass = (status) => {
  const s = String(status || "").toUpperCase();
  if (s === "COMPLETED") return "bg-green-50 text-green-600 border-green-100";
  if (s.includes("CANCEL")) return "bg-red-50 text-red-600 border-red-100";
  if (s === "ON_RIDE") return "bg-stone-900 text-white border-stone-800";
  if (s === "DRIVER_ARRIVED") return "bg-[#C05D38] text-white border-[#C05D38]";
  return "bg-stone-50 text-stone-500 border-stone-200";
};

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-white border border-stone-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">{label}</span>
        <span className="text-stone-200 group-hover:text-[#C05D38] transition-colors">{icon}</span>
      </div>
      <div className="mt-3 text-3xl font-black text-stone-900 tracking-tighter">
        {value ?? "0"}
      </div>
    </div>
  );
}

function Pill({ children, className = "" }) {
  return (
    <span className={`inline-flex items-center px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border ${className}`}>
      {children}
    </span>
  );
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [rides, setRides] = useState([]);
  const [err, setErr] = useState("");

  const activePct = useMemo(() => {
    const total = Number(stats?.totalRides || 0);
    const active = Number(stats?.activeRides || 0);
    if (!total) return 0;
    return Math.round((active / total) * 100);
  }, [stats]);

  const refresh = async () => {
    try {
      setLoading(true);
      setErr("");
      const s = await getAdminStats();
      const r = await getAdminRides({ limit: 10 });
      setStats(s?.data || s);
      setRides(r?.data || []);
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-screen bg-[#FBF9F6]">
        <div className="animate-spin h-8 w-8 border-4 border-[#C05D38] border-t-transparent rounded-full mb-4" />
        <p className="text-stone-400 text-xs font-black uppercase tracking-[0.3em]">Initializing Dashboard...</p>
      </div>
    );
  }

  if (err) {
    return (
      <div className="p-12 flex items-center justify-center min-h-screen bg-[#FBF9F6]">
        <div className="bg-[#FFF5F2] border border-[#C05D38]/20 text-[#C05D38] p-8 rounded-3xl max-w-md shadow-lg text-center">
          <h2 className="font-black uppercase tracking-tighter text-xl mb-2">Connection Lost</h2>
          <p className="text-sm font-medium mb-6">{err}</p>
          <button onClick={refresh} className="w-full py-3 rounded-xl bg-stone-900 text-white font-black uppercase tracking-widest text-[10px] hover:bg-stone-800 transition-all">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-[#FBF9F6] min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-stone-200 pb-8">
        <div>
          <span className="text-[#C05D38] text-[10px] font-black uppercase tracking-[0.4em]">Operational Overview</span>
          <h1 className="text-4xl font-black text-stone-900 tracking-tighter uppercase mt-1">
            Admin Dashboard
          </h1>
        </div>

        <button onClick={refresh} className="px-8 py-3 rounded-xl bg-stone-900 text-white font-black uppercase tracking-widest text-[10px] shadow-lg hover:bg-stone-800 transition-all active:scale-95">
          Refresh Analytics
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Rides" value={stats?.totalRides} icon="🚗" />
        <StatCard label="Active Rides" value={stats?.activeRides} icon="📍" />
        <StatCard label="Completed Today" value={stats?.completedToday} icon="✨" />
        
        <div className="bg-white border border-stone-100 rounded-3xl p-6 shadow-sm">
          <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Active Ratio</div>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex-1 h-2 rounded-full bg-stone-100 overflow-hidden">
              <div
                className="h-full bg-[#C05D38] transition-all duration-1000"
                style={{ width: `${activePct}%` }}
              />
            </div>
            <div className="text-lg font-black text-stone-900">{activePct}%</div>
          </div>
        </div>
      </div>

<RevenueAnalytics/>


  
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <QuickAction title="Partner Management" desc="Monitor driver performance" href="/admin/drivers" />
        <QuickAction title="Fleet Logs" desc="Complete ride history" href="/admin/rides" />
        <QuickAction title="SOS Monitor" desc="Emergency priority cases" href="/admin/sos" />
        <QuickAction title="Settlements" desc="Weekly driver payouts" href="/admin/payouts" />
      </div>

    {/* Recent Rides Table */}
      <div className="bg-white border border-stone-100 rounded-[2rem] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-50 flex items-center justify-between bg-[#F9F6F0]/30">
          <div>
            <h2 className="text-lg font-black text-stone-900 uppercase tracking-tight">Recent Activity</h2>
            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1">Real-time ride requests</p>
          </div>
          <Pill className="bg-stone-900 text-white border-transparent">
            {rides.length} Total
          </Pill>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#FBF9F6] text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                <th className="py-5 px-6">ID</th>
                <th className="py-5 px-6">Client Details</th>
                <th className="py-5 px-6">Assigned Driver</th>
                <th className="py-5 px-6">Status</th>
                <th className="py-5 px-6 text-right">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {rides.map((r) => (
                <tr key={r._id} className="hover:bg-[#F9F6F0]/20 transition-colors group">
                  <td className="py-5 px-6 font-bold text-stone-900 font-mono text-xs">#{r._id?.slice(-6)}</td>
                  <td className="py-5 px-6">
                    <div className="font-bold text-stone-800 text-sm">{r.clientId?.name || "—"}</div>
                    <div className="text-[10px] text-stone-400 font-bold uppercase">{r.clientId?.mobile || r.clientId?.email}</div>
                  </td>
                  <td className="py-5 px-6 text-stone-600">
                    <div className="font-bold text-stone-800 text-sm">{r.driverId?.name || "—"}</div>
                    <div className="text-[10px] text-stone-400 font-bold uppercase">{r.driverId?.mobile}</div>
                  </td>
                  <td className="py-5 px-6">
                    <Pill className={statusClass(r.status)}>{r.status}</Pill>
                  </td>
                  <td className="py-5 px-6 text-right text-xs font-bold text-stone-500">
                    {fmtDateTime(r.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


    </div>
  );
}

function QuickAction({ title, desc, href }) {
  return (
    <a href={href} className="bg-white border border-stone-100 rounded-3xl p-6 shadow-sm block group hover:bg-stone-900 transition-all duration-300">
      <div className="font-black text-stone-900 uppercase tracking-tight group-hover:text-white transition-colors">{title}</div>
      <div className="text-[10px] text-stone-400 mt-1 font-bold uppercase tracking-widest group-hover:text-stone-300 transition-colors">{desc}</div>
      <div className="mt-5 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#C05D38] group-hover:text-white transition-colors">
        Enter Portal <span>→</span>
      </div>
    </a>
  );
}