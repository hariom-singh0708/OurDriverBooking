import { useEffect, useMemo, useState } from "react";
import { blockUnblockDriver, getAdminDrivers } from "../../services/admin.api";
import AdminKYCModal from "./AdminKYCModal";
import { io } from "socket.io-client";
import DriverDetailsModal from "./DriverDetailsModal";

function formatDate(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function maskAccount(acc) {
  if (!acc) return "—";
  const s = String(acc);
  if (s.length <= 4) return s;
  return `${"*".repeat(Math.max(0, s.length - 4))}${s.slice(-4)}`;
}

export default function AdminDrivers() {
  // ✅ create socket once (avoid multiple connections on re-render)
const socket = useMemo(
  () =>
    io(import.meta.env.VITE_SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    }),
  []
);

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({ q: "", isOnline: "", city: "" });
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // KYC
  const [selectedDriverId, setSelectedDriverId] = useState(null);

  // ✅ Details modal
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  function timeAgo(date) {
    if (!date) return "—";
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return Math.floor(seconds / 60) + "m ago";
    if (seconds < 86400) return Math.floor(seconds / 3600) + "h ago";
    return Math.floor(seconds / 86400) + "d ago";
  }

  const fetchData = async (opts = {}) => {
    try {
      setLoading(true);
      const res = await getAdminDrivers({
        q: opts.q ?? filters.q,
        isOnline: opts.isOnline ?? filters.isOnline,
        preferredCity: opts.city ?? filters.city,
        page: opts.page ?? page,
        limit: 20,
      });

      setRows(res?.data || []);
      setPages(res?.pagination?.pages || 1);
    } finally {
      setLoading(false);
    }
  };

  const cities = useMemo(() => {
    const set = new Set();
    (rows || []).forEach((d) => {
      const c = d?.preferredCity || d?.city;
      if (c && typeof c === "string") set.add(c.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  // ✅ initial load + socket listener
  useEffect(() => {
    fetchData();

    const onStatus = (payload) => {
      setRows((prev) =>
        prev.map((d) =>
          d._id === payload.driverId
            ? {
                ...d,
                driverStatus: {
                  ...(d.driverStatus || {}),
                  isOnline: payload.isOnline,
                  lastSeen: payload.lastSeen,
                  location: payload.location,
                },
              }
            : d
        )
      );

      // ✅ if modal open and this driver is selected, also update selectedDriver
      setSelectedDriver((cur) => {
        if (!cur || cur._id !== payload.driverId) return cur;
        return {
          ...cur,
          driverStatus: {
            ...(cur.driverStatus || {}),
            isOnline: payload.isOnline,
            lastSeen: payload.lastSeen,
            location: payload.location,
          },
        };
      });
    };

    socket.on("driver_status_updated", onStatus);

    return () => {
      socket.off("driver_status_updated", onStatus);
      socket.disconnect(); // ✅ cleanup
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ pagination reload
  useEffect(() => {
    fetchData({ page });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const toggleBlock = async (driver) => {
    const isBlocked = driver.isBlocked;
    await blockUnblockDriver(
      driver._id,
      isBlocked ? { block: false } : { block: true, minutes: 1440 }
    );
    fetchData();
  };

  const openDetails = (driver) => {
    setSelectedDriver(driver);
    setDetailsOpen(true);
  };

  const closeDetails = () => {
    setDetailsOpen(false);
    setSelectedDriver(null);
  };

  const StatusBadge = ({ online }) => (
    <div className="flex items-center gap-1.5">
      <span
        className={`h-2 w-2 rounded-full ${
          online ? "bg-green-500 animate-pulse" : "bg-stone-300"
        }`}
      />
      <span
        className={`text-[10px] font-black uppercase tracking-widest ${
          online ? "text-green-600" : "text-stone-400"
        }`}
      >
        {online ? "Online" : "Offline"}
      </span>
    </div>
  );

  if (loading)
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[60vh] bg-[#FBF9F6]">
        <div className="animate-spin h-8 w-8 border-4 border-[#C05D38] border-t-transparent rounded-full mb-4" />
        <div className="text-stone-400 text-xs font-black uppercase tracking-[0.3em]">
          Syncing Fleet...
        </div>
      </div>
    );

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-[#FBF9F6] min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <span className="text-[#C05D38] text-[10px] font-black uppercase tracking-[0.3em]">
            Fleet Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tighter uppercase">
            Driver Partners
          </h1>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white rounded-2xl border border-stone-100 p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 shadow-sm">
        <input
          className="bg-[#F9F6F0] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#C05D38]/20 transition-all outline-none text-stone-800 placeholder-stone-400"
          placeholder="Search name/email/mobile..."
          value={filters.q}
          onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
        />

        <select
          className="bg-[#F9F6F0] border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#C05D38]/20 transition-all outline-none text-stone-600 font-bold uppercase tracking-widest text-[10px]"
          value={filters.isOnline}
          onChange={(e) =>
            setFilters((p) => ({ ...p, isOnline: e.target.value }))
          }
        >
          <option value="">Availability</option>
          <option value="true">Online</option>
          <option value="false">Offline</option>
        </select>

        <select
          className="bg-[#F9F6F0] border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#C05D38]/20 transition-all outline-none text-stone-600 font-bold uppercase tracking-widest text-[10px]"
          value={filters.city}
          onChange={(e) => setFilters((p) => ({ ...p, city: e.target.value }))}
        >
          <option value="">Preferred City</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <button
          onClick={() => {
            setPage(1);
            fetchData({ page: 1 });
          }}
          className="bg-stone-900 text-white rounded-xl px-4 py-3 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-stone-800 transition-all shadow-md active:scale-95"
        >
          Apply Filters
        </button>
      </div>

      {/* TABLE (Desktop) */}
      <div className="hidden md:block bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#F9F6F0]/50 border-b border-stone-50">
            <tr>
              <th className="py-4 px-6 text-[10px] font-black text-stone-400 uppercase tracking-widest">
                Driver Detail
              </th>
              <th className="py-4 px-6 text-[10px] font-black text-stone-400 uppercase tracking-widest">
                Availability
              </th>
              <th className="py-4 px-6 text-[10px] font-black text-stone-400 uppercase tracking-widest">
                Details
              </th>
              <th className="py-4 px-6 text-[10px] font-black text-stone-400 uppercase tracking-widest">
                Status
              </th>
              <th className="py-4 px-6 text-right" />
            </tr>
          </thead>

          <tbody className="divide-y divide-stone-50">
            {rows.map((d) => {
              const carTypes = Array.isArray(d?.carTypes) ? d.carTypes : [];

              return (
                <tr
                  key={d._id}
                  className="hover:bg-[#F9F6F0]/20 transition-colors group align-top"
                >
                  {/* Driver Detail */}
                  <td className="py-5 px-6">
                    <div className="font-bold text-stone-900">
                      {d.name || "—"}
                    </div>
                    <div className="text-[10px] text-stone-400 uppercase font-medium tracking-tight">
                      {d.email || "—"} • {d.mobile || "—"}
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div className="bg-stone-50 rounded-xl px-3 py-2">
                        <div className="text-[9px] font-black uppercase tracking-widest text-stone-400">
                          Preferred City
                        </div>
                        <div className="text-xs font-bold text-stone-800">
                          {d.preferredCity || "—"}
                        </div>
                      </div>

                      <div className="bg-stone-50 rounded-xl px-3 py-2">
                        <div className="text-[9px] font-black uppercase tracking-widest text-stone-400">
                          Car Types
                        </div>
                        <div className="text-xs font-bold text-stone-800">
                          {carTypes.length ? carTypes.join(", ") : "—"}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Availability */}
                  <td className="py-5 px-6">
                    <StatusBadge online={d.driverStatus?.isOnline} />
                    <div className="mt-2 text-[10px] font-bold text-stone-500 uppercase">
                      {d.driverStatus?.isOnline
                        ? "Active Now"
                        : d.driverStatus?.lastSeen
                        ? `Last: ${timeAgo(d.driverStatus.lastSeen)}`
                        : "Never Online"}
                    </div>
                    <div className="text-[9px] text-stone-300 font-mono mt-0.5">
                      {d.driverStatus?.location?.lat
                        ? `${d.driverStatus.location.lat.toFixed(
                            4
                          )}, ${d.driverStatus.location.lng.toFixed(4)}`
                        : "No GPS"}
                    </div>
                  </td>

                  {/* Details (Modal Trigger) */}
                  <td className="py-5 px-6">
                    <button
                      onClick={() => openDetails(d)}
                      className="px-3 py-2 rounded-xl bg-stone-900 text-white text-xs font-black hover:bg-stone-800"
                    >
                      View Details
                    </button>
                  </td>

                  {/* Status */}
                  <td className="py-5 px-6">
                    <span
                      className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        d.isBlocked
                          ? "bg-red-50 text-red-600 border border-red-100"
                          : "bg-green-50 text-green-600 border border-green-100"
                      }`}
                    >
                      {d.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-5 px-6 text-right space-x-3">
                    <button
                      onClick={() => toggleBlock(d)}
                      className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
                        d.isBlocked
                          ? "text-stone-900 hover:text-stone-600"
                          : "text-red-500 hover:text-red-700"
                      }`}
                    >
                      {d.isBlocked ? "Unblock" : "Block"}
                    </button>

                    <button
                      onClick={() => setSelectedDriverId(d._id)}
                      className="bg-[#C05D38] text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-[#A84C2C] transition-all"
                    >
                      View KYC
                    </button>
                  </td>
                </tr>
              );
            })}

            {!rows.length ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-14 text-center text-stone-400 text-xs font-black uppercase tracking-widest"
                >
                  No drivers found
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARDS */}
      <div className="md:hidden space-y-4">
        {rows.map((d) => {
          const carTypes = Array.isArray(d?.carTypes) ? d.carTypes : [];
          return (
            <div
              key={d._id}
              className="bg-white border border-stone-100 rounded-2xl p-5 space-y-4 shadow-sm"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0">
                  <div className="font-bold text-stone-900 truncate">
                    {d.name || "—"}
                  </div>
                  <div className="text-[10px] text-stone-400 uppercase font-bold">
                    {d.mobile || "—"}
                  </div>

                  <div className="text-[10px] text-stone-400 font-bold mt-1">
                    City:{" "}
                    <span className="text-stone-700">
                      {d.preferredCity || "—"}
                    </span>
                  </div>

                  <div className="text-[10px] text-stone-400 font-bold mt-1">
                    Car Types:{" "}
                    <span className="text-stone-700">
                      {carTypes.length ? carTypes.join(", ") : "—"}
                    </span>
                  </div>
                </div>

                <StatusBadge online={d.driverStatus?.isOnline} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => toggleBlock(d)}
                  className="border border-stone-200 rounded-xl py-3 text-[10px] font-black uppercase tracking-widest text-stone-600"
                >
                  {d.isBlocked ? "Unblock" : "Block"}
                </button>

                <button
                  onClick={() => setSelectedDriverId(d._id)}
                  className="bg-[#C05D38] text-white rounded-xl py-3 text-[10px] font-black uppercase tracking-widest"
                >
                  KYC
                </button>

                <button
                  onClick={() => openDetails(d)}
                  className="col-span-2 bg-stone-900 text-white rounded-xl py-3 text-[10px] font-black uppercase tracking-widest"
                >
                  Details
                </button>
              </div>
            </div>
          );
        })}

        {!rows.length ? (
          <div className="bg-white border border-stone-100 rounded-2xl p-8 text-center text-stone-400 text-xs font-black uppercase tracking-widest">
            No drivers found
          </div>
        ) : null}
      </div>

      {/* PAGINATION */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-stone-100 shadow-sm">
        <button
          className="text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-900 disabled:opacity-30"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
        >
          ← Previous
        </button>

        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-900">
          Page {page} / {pages}
        </div>

        <button
          className="text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-900 disabled:opacity-30"
          disabled={page >= pages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next →
        </button>
      </div>

      {/* ✅ Details Modal (single instance) */}
      <DriverDetailsModal
        open={detailsOpen}
        onClose={closeDetails}
        d={selectedDriver}
        emergency={selectedDriver?.emergencyContact}
        bank={selectedDriver?.bankDetails}
        formatDate={formatDate}
        maskAccount={maskAccount}
      />

      {/* KYC Modal */}
      {selectedDriverId && (
        <AdminKYCModal
          driverId={selectedDriverId}
          onClose={() => setSelectedDriverId(null)}
          onUpdated={fetchData}
        />
      )}
    </div>
  );
}
