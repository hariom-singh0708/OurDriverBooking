import { useEffect, useState } from "react";
import { getAdminRides } from "../../services/admin.api";

export default function AdminRides() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({ status: "", from: "", to: "" });
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

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

  useEffect(() => { fetchData(); }, [page]); // eslint-disable-line

  const apply = () => { setPage(1); fetchData(); };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Rides</h1>

      <div className="bg-white rounded-xl border p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <select
          className="border rounded-lg px-3 py-2"
          value={filters.status}
          onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
        >
          <option value="">Status: All</option>
          <option value="REQUESTED">REQUESTED</option>
          <option value="DISPATCHING">DISPATCHING</option>
          <option value="ACCEPTED">ACCEPTED</option>
          <option value="ARRIVED">ARRIVED</option>
          <option value="ON_RIDE">ON_RIDE</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELLED">CANCELLED</option>
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

        <button onClick={apply} className="bg-black text-white rounded-lg px-4 py-2 font-semibold">
          Apply
        </button>
      </div>

      <div className="bg-white rounded-xl border p-4 overflow-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-gray-500">
            <tr>
              <th className="py-2">Ride</th>
              <th>Driver</th>
              <th>Client</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r._id} className="border-t">
                <td className="py-2 font-semibold">{r._id?.slice(-6)}</td>
                <td>{r.driver?.name || "—"}</td>
                <td>{r.client?.name || "—"}</td>
                <td className="font-semibold">{r.status}</td>
                <td className="text-gray-500">
                  {r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr><td colSpan={5} className="py-6 text-gray-500">No rides</td></tr>
            )}
          </tbody>
        </table>

        <div className="mt-4 flex justify-between">
          <button className="px-3 py-2 rounded-lg border" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Prev
          </button>
          <div className="text-sm text-gray-600">Page {page} / {pages}</div>
          <button className="px-3 py-2 rounded-lg border" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
