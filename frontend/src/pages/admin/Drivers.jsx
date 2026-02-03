import { useEffect, useState } from "react";
import { blockUnblockDriver, getAdminDrivers } from "../../services/admin.api";
import AdminKYCModal from "./AdminKYCModal";
import { io } from "socket.io-client";


export default function AdminDrivers() {
  const socket = io("http://localhost:5000");
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({
    q: "",
    isOnline: "",
    isAvailable: "",
  });
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [selectedDriverId, setSelectedDriverId] = useState(null);

  function timeAgo(date) {
    if (!date) return "—";
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return Math.floor(seconds / 60) + " min ago";
    if (seconds < 86400) return Math.floor(seconds / 3600) + " hr ago";
    return Math.floor(seconds / 86400) + " days ago";
  }

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getAdminDrivers({ ...filters, page, limit: 20 });
      setRows(res?.data || []);
      setPages(res?.pagination?.pages || 1);
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  fetchData();

  socket.on("driver_status_updated", (payload) => {
    console.log("LIVE UPDATE:", payload);

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
  });

  return () => {
    socket.off("driver_status_updated");
  };
}, []);

  const apply = () => {
    setPage(1);
    fetchData();
  };

  const toggleBlock = async (driver) => {
    const isBlocked = driver.isBlocked;
    await blockUnblockDriver(
      driver._id,
      isBlocked ? { block: false } : { block: true, minutes: 1440 },
    );
    fetchData();
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Drivers</h1>

      <div className="bg-white rounded-xl border p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          className="border rounded-lg px-3 py-2"
          placeholder="Search name/email/mobile"
          value={filters.q}
          onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
        />

        <select
          className="border rounded-lg px-3 py-2"
          value={filters.isOnline}
          onChange={(e) =>
            setFilters((p) => ({ ...p, isOnline: e.target.value }))
          }
        >
          <option value="">Online: All</option>
          <option value="true">Online: Yes</option>
          <option value="false">Online: No</option>
        </select>

        <select
          className="border rounded-lg px-3 py-2"
          value={filters.isAvailable}
          onChange={(e) =>
            setFilters((p) => ({ ...p, isAvailable: e.target.value }))
          }
        >
          <option value="">Available: All</option>
          <option value="true">Available: Yes</option>
          <option value="false">Available: No</option>
        </select>

        <button
          onClick={apply}
          className="bg-black text-white rounded-lg px-4 py-2 font-semibold"
        >
          Apply
        </button>
      </div>

      <div className="bg-white rounded-xl border p-4 overflow-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-gray-500">
            <tr>
              <th className="py-2">Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Online</th>
              <th>Available</th>
              <th>Location</th>
              <th>Blocked</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
  {rows.map((d) => (
    <tr key={d._id} className="border-t hover:bg-gray-50 transition">
      {/* Name */}
      <td className="py-3 font-semibold">{d.name || "—"}</td>

      {/* Email */}
      <td>{d.email || "—"}</td>

      {/* Mobile */}
      <td>{d.mobile || "—"}</td>

      {/* Online */}
      <td>
        {d.driverStatus?.isOnline ? (
          <span className="flex items-center gap-1 text-green-600 font-bold">
            ● Online
          </span>
        ) : (
          <span className="flex items-center gap-1 text-gray-500">
            ● Offline
          </span>
        )}
      </td>

      {/* Last Seen */}
      <td className="text-xs text-gray-600">
        {d.driverStatus?.isOnline
          ? "Active now"
          : d.driverStatus?.lastSeen
          ? `Last seen ${timeAgo(d.driverStatus.lastSeen)}`
          : "Never online"}
      </td>

      {/* Location */}
      <td className="text-xs text-gray-500">
        {d.driverStatus?.location?.lat ? (
          <>📍 {d.driverStatus.location.lat.toFixed(4)}, {d.driverStatus.location.lng.toFixed(4)}</>
        ) : (
          "—"
        )}
      </td>

      {/* Blocked */}
      <td className={d.isBlocked ? "text-red-600 font-bold" : "text-gray-500"}>
        {d.isBlocked ? "Blocked" : "No"}
      </td>

      {/* Actions */}
      <td className="text-right space-x-2">
        <button
          onClick={() => toggleBlock(d)}
          className={`rounded-lg px-3 py-2 font-semibold ${
            d.isBlocked ? "bg-gray-800 text-white" : "bg-red-600 text-white"
          }`}
        >
          {d.isBlocked ? "Unblock" : "Block"}
        </button>

        <button
          onClick={() => setSelectedDriverId(d._id)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg font-semibold"
        >
          View KYC
        </button>
      </td>
    </tr>
  ))}

  {!rows.length && (
    <tr>
      <td colSpan={8} className="py-6 text-center text-gray-500">
        No drivers
      </td>
    </tr>
  )}
</tbody>

        </table>

        <div className="mt-4 flex justify-between">
          <button
            className="px-3 py-2 rounded-lg border"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </button>
          <div className="text-sm text-gray-600">
            Page {page} / {pages}
          </div>
          <button
            className="px-3 py-2 rounded-lg border"
            disabled={page >= pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
      {/* Modal render */}
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
