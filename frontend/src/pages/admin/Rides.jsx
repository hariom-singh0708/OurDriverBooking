import { useEffect, useState } from "react";
import { getAdminRides } from "../../services/admin.api";
import { X } from "lucide-react";

export default function AdminRides() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({ status: "", from: "", to: "" });
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const [selectedRide, setSelectedRide] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getAdminRides({ ...filters, page, limit: 20 });
      setRows(res?.data || []);
      setPages(res?.pagination?.pages || 1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page]); // eslint-disable-line

  const apply = () => {
    setPage(1);
    fetchData();
  };

  const StatusBadge = ({ status }) => {
    const s = String(status || "").toUpperCase();
    const colors = {
      COMPLETED: "bg-green-100 text-green-700",
      CANCELLED_BY_CLIENT: "bg-red-100 text-red-700",
      CANCELLED_BY_DRIVER: "bg-red-100 text-red-700",
      CANCELLED: "bg-red-100 text-red-700",
      ACCEPTED: "bg-blue-100 text-blue-700",
      ON_RIDE: "bg-yellow-100 text-yellow-700",
      REQUESTED: "bg-gray-100 text-gray-700",
      DRIVER_ARRIVED: "bg-purple-100 text-purple-700",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          colors[s] || "bg-gray-100 text-gray-700"
        }`}
      >
        {s}
      </span>
    );
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-4 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold">Rides</h1>

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <select
          className="border rounded-lg px-3 py-2"
          value={filters.status}
          onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
        >
          <option value="">Status: All</option>
          <option value="REQUESTED">REQUESTED</option>
          <option value="ACCEPTED">ACCEPTED</option>
          <option value="DRIVER_ARRIVED">DRIVER_ARRIVED</option>
          <option value="ON_RIDE">ON_RIDE</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELLED_BY_CLIENT">CANCELLED_BY_CLIENT</option>
          <option value="CANCELLED_BY_DRIVER">CANCELLED_BY_DRIVER</option>
        </select>

        <input
          type="date"
          className="border rounded-lg px-3 py-2"
          value={filters.from}
          onChange={(e) => setFilters((p) => ({ ...p, from: e.target.value }))}
        />
        <input
          type="date"
          className="border rounded-lg px-3 py-2"
          value={filters.to}
          onChange={(e) => setFilters((p) => ({ ...p, to: e.target.value }))}
        />

        <button
          onClick={apply}
          className="bg-black text-white rounded-lg px-4 py-2 font-semibold"
        >
          Apply
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border p-4 overflow-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-gray-500">
            <tr>
              <th className="py-2">Ride</th>
              <th>Driver</th>
              <th>Client</th>
              <th>Status</th>
              <th>Created</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => (
              <tr key={r._id} className="border-t hover:bg-gray-50 transition">
                <td className="py-3 font-semibold">{r._id?.slice(-6)}</td>
                <td>{r.driverId?.name || "—"}</td>
                <td>{r.clientId?.name || "—"}</td>
                <td>
                  <StatusBadge status={r.status} />
                </td>
                <td className="text-gray-500">
                  {r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}
                </td>
                <td className="text-right">
                  <button
                    onClick={() => setSelectedRide(r)}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}

            {!rows.length && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-gray-500">
                  No rides
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="mt-4 flex justify-between">
          <button
            className="px-3 py-2 rounded-lg border bg-white"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </button>

          <div className="text-sm text-gray-600">Page {page} / {pages}</div>

          <button
            className="px-3 py-2 rounded-lg border bg-white"
            disabled={page >= pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {/* DETAILS MODAL */}
      {selectedRide && (
        <RideDetailsModal ride={selectedRide} onClose={() => setSelectedRide(null)} />
      )}
    </div>
  );
}

function RideDetailsModal({ ride, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      {/* wrapper */}
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl overflow-hidden">
        {/* header */}
        <div className="p-4 border-b flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold">
              Ride Details - {ride?._id?.slice(-6)}
            </h2>
            <p className="text-xs text-gray-500 mt-1 break-words">
              Ride ID: {ride?._id}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg border hover:bg-gray-50"
            aria-label="Close"
          >
            <X />
          </button>
        </div>

        {/* body scroll */}
        <div className="p-4 max-h-[70vh] overflow-auto">
          {/* CALL ACTIONS */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-6">
            <CallButton
              mobile={ride?.driverId?.mobile}
              label={`Call Driver (${ride?.driverId?.name || "Driver"})`}
            />
            <CallButton
              mobile={ride?.clientId?.mobile}
              label={`Call Client (${ride?.clientId?.name || "Client"})`}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <Info label="Status" value={ride?.status} />
            <Info label="Ride Type" value={ride?.rideType} />

            <Info label="Driver" value={ride?.driverId?.name} />
            <Info label="Client" value={ride?.clientId?.name} />

            <Info label="Pickup" value={ride?.pickupLocation?.address} />
            <Info label="Drop" value={ride?.dropLocation?.address} />

            <Info label="Payment Mode" value={ride?.paymentMode} />
            <Info label="Total Fare" value={ride?.fareBreakdown?.totalFare ? `₹${ride.fareBreakdown.totalFare}` : "—"} />

            <Info label="Created At" value={ride?.createdAt ? new Date(ride.createdAt).toLocaleString() : "—"} />
            <Info label="Completed At" value={ride?.completedAt ? new Date(ride.completedAt).toLocaleString() : "—"} />
          </div>
        </div>

        {/* footer */}
        <div className="p-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-black text-white font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="border rounded-xl p-3 bg-white">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold break-words">{value || "—"}</p>
    </div>
  );
}

function CallButton({ mobile, label }) {
  if (!mobile) return null;

  return (
    <a
      href={`tel:${mobile}`}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition w-full sm:w-auto justify-center"
    >
      📞 {label}
    </a>
  );
}
