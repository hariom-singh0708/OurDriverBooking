import { useEffect, useMemo, useState } from "react";
import { getAdminStats, getAdminRides } from "../../services/admin.api";

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
  if (s === "COMPLETED") return "bg-green-50 text-green-700 border-green-200";
  if (s.includes("CANCEL")) return "bg-red-50 text-red-700 border-red-200";
  if (s === "ON_RIDE") return "bg-indigo-50 text-indigo-700 border-indigo-200";
  if (s === "DRIVER_ARRIVED")
    return "bg-purple-50 text-purple-700 border-purple-200";
  if (s === "ACCEPTED") return "bg-blue-50 text-blue-700 border-blue-200";
  if (s === "REQUESTED") return "bg-gray-50 text-gray-700 border-gray-200";
  return "bg-gray-50 text-gray-700 border-gray-200";
};

function StatCard({ label, value }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
      <div className="text-xs font-semibold text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-extrabold text-gray-900">
        {value ?? "—"}
      </div>
    </div>
  );
}

function Pill({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-1 text-xs font-bold rounded-full border ${className}`}
    >
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

      // your wrapper { success, data }
      setStats(s?.data || s);
      setRides(r?.data || []);
    } catch (e) {
      console.log(
        "ADMIN DASH ERROR:",
        e?.response?.status,
        e?.response?.data,
        e?.message,
      );
      setErr(
        e?.response?.data?.message || e?.message || "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl">
          {err}
        </div>
        <button
          onClick={refresh}
          className="mt-3 px-4 py-2 rounded-xl bg-black text-white font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Overview of rides and activity
          </p>
        </div>

        <button
          onClick={refresh}
          className="px-4 py-2 rounded-xl bg-black text-white font-semibold hover:bg-black/90"
        >
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Rides" value={stats?.totalRides} />
        <StatCard label="Active Rides" value={stats?.activeRides} />
        <StatCard label="Completed Today" value={stats?.completedToday} />
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <div className="text-xs font-semibold text-gray-500">
            Active Ratio
          </div>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-2 bg-black"
                style={{ width: `${activePct}%` }}
              />
            </div>
            <div className="text-sm font-extrabold">{activePct}%</div>
          </div>
        </div>
      </div>

      {/* Recent rides */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <div className="text-lg font-extrabold text-gray-900">
              Recent Rides
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Latest 10 ride requests
            </div>
          </div>

          <Pill className="bg-gray-50 text-gray-700 border-gray-200">
            {rides.length} items
          </Pill>
        </div>

        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-gray-500">
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4">Ride</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Driver</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created</th>
              </tr>
            </thead>

            <tbody>
              {rides.map((r) => (
                <tr key={r._id} className="border-b last:border-b-0">
                  <td className="py-3 px-4 font-semibold text-gray-900">
                    {r._id?.slice(-6)}
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold">
                      {r.clientId?.name || "—"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {r.clientId?.mobile || r.clientId?.email || ""}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold">
                      {r.driverId?.name || "—"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {r.driverId?.mobile || r.driverId?.email || ""}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <Pill className={statusClass(r.status)}>{r.status}</Pill>
                  </td>
                

                  <td className="py-3 px-4 text-gray-600">
                    {fmtDateTime(r.createdAt)}
                  </td>
                </tr>
              ))}

              {!rides.length && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-10 px-4 text-center text-gray-500"
                  >
                    No rides found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions (optional) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickAction
          title="Drivers"
          desc="View all drivers and block/unblock."
          href="/admin/drivers"
        />
        <QuickAction
          title="Rides"
          desc="Filter rides by status and date."
          href="/admin/rides"
        />
        <QuickAction
          title="Support | SOS"
          desc="Handle SOS / feedback (if enabled)."
          href="/admin/sos"
        />
        <QuickAction
          title="Payout"
          desc="Handle payment of drivers (Weekly Payout)."
          href="/admin/payouts"
        />
      </div>
    </div>
  );
}

function QuickAction({ title, desc, href, disabled }) {
  const classes = disabled
    ? "bg-white border border-gray-200 rounded-2xl p-4 shadow-sm block opacity-50 cursor-not-allowed pointer-events-none"
    : "bg-white border border-gray-200 rounded-2xl p-4 shadow-sm block hover:border-gray-300";

  return (
    <a href={disabled ? undefined : href} className={classes}>
      <div className="font-extrabold text-gray-900">{title}</div>
      <div className="text-sm text-gray-500 mt-1">{desc}</div>

      <div className="mt-3 text-sm font-semibold text-black">
        Open
      </div>
    </a>
  );
}
