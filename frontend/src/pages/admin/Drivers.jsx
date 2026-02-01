import { useEffect, useState } from "react";
import { blockUnblockDriver, getAdminDrivers } from "../../services/admin.api";

export default function AdminDrivers() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({ q: "", isOnline: "", isAvailable: "" });
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

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

  useEffect(() => { fetchData(); }, [page]); // eslint-disable-line

  const apply = () => { setPage(1); fetchData(); };

  const toggleBlock = async (driver) => {
    const isBlocked = driver.isBlocked;
    await blockUnblockDriver(driver._id, isBlocked ? { block: false } : { block: true, minutes: 1440 });
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
          onChange={(e) => setFilters((p) => ({ ...p, isOnline: e.target.value }))}
        >
          <option value="">Online: All</option>
          <option value="true">Online: Yes</option>
          <option value="false">Online: No</option>
        </select>

        <select
          className="border rounded-lg px-3 py-2"
          value={filters.isAvailable}
          onChange={(e) => setFilters((p) => ({ ...p, isAvailable: e.target.value }))}
        >
          <option value="">Available: All</option>
          <option value="true">Available: Yes</option>
          <option value="false">Available: No</option>
        </select>

        <button onClick={apply} className="bg-black text-white rounded-lg px-4 py-2 font-semibold">
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
              <th>Blocked</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d) => (
              <tr key={d._id} className="border-t">
                <td className="py-2 font-semibold">{d.name || "—"}</td>
                <td>{d.email}</td>
                <td>{d.mobile || "—"}</td>
                <td>{d.status?.isOnline ? "Yes" : "No"}</td>
                <td>{d.status?.isAvailable ? "Yes" : "No"}</td>
                <td className={d.isBlocked ? "text-red-600 font-semibold" : "text-gray-500"}>
                  {d.isBlocked ? "Blocked" : "No"}
                </td>
                <td className="text-right">
                  <button
                    onClick={() => toggleBlock(d)}
                    className={`rounded-lg px-3 py-2 font-semibold ${
                      d.isBlocked ? "bg-gray-800 text-white" : "bg-red-600 text-white"
                    }`}
                  >
                    {d.isBlocked ? "Unblock" : "Block"}
                  </button>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr><td colSpan={7} className="py-6 text-gray-500">No drivers</td></tr>
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
          <div className="text-sm text-gray-600">Page {page} / {pages}</div>
          <button
            className="px-3 py-2 rounded-lg border"
            disabled={page >= pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
