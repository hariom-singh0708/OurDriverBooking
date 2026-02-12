import { useEffect, useMemo, useState } from "react";
import { CheckCircle, Clock, User, Shield, MessageSquare } from "lucide-react";
import {
  getAdminSupportRequests,
  resolveSupportTicket,
} from "../../services/admin.api";

/* ---------------- helpers ---------------- */

const fmt = (d) =>
  new Date(d).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const statusPill = (s) =>
  s === "RESOLVED"
    ? "bg-green-50 text-green-600 border-green-100"
    : "bg-yellow-50 text-yellow-700 border-yellow-100";

export default function AdminSupport() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [roleFilter, setRoleFilter] = useState("ALL");

  useEffect(() => {
    getAdminSupportRequests()
      .then((res) => setRows(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
      if (roleFilter !== "ALL" && r.role !== roleFilter) return false;
      return true;
    });
  }, [rows, statusFilter, roleFilter]);

  const resolve = async (id) => {
    await resolveSupportTicket(id);
    setRows((prev) =>
      prev.map((r) =>
        r._id === id ? { ...r, status: "RESOLVED" } : r
      )
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBF9F6]">
        <div className="animate-spin h-8 w-8 border-4 border-[#C05D38] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#FBF9F6] min-h-screen space-y-8 font-sans">
      {/* HEADER */}
      <div className="border-b border-stone-200 pb-6">
        <span className="text-[#C05D38] text-[10px] font-black uppercase tracking-[0.4em]">
          Support Operations
        </span>
        <h1 className="text-3xl font-black uppercase tracking-tighter">
          Help & Support Requests
        </h1>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border text-xs font-black uppercase"
        >
          <option value="ALL">All Status</option>
          <option value="OPEN">Open</option>
          <option value="RESOLVED">Resolved</option>
        </select>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border text-xs font-black uppercase"
        >
          <option value="ALL">All Roles</option>
          <option value="client">Client</option>
          <option value="driver">Driver</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-stone-100 rounded-[2rem] overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-[#FBF9F6] text-[10px] font-black uppercase tracking-widest text-stone-400">
            <tr>
              <th className="px-6 py-5">User</th>
              <th className="px-6 py-5">Category</th>
              <th className="px-6 py-5">Message</th>
              <th className="px-6 py-5 text-center">Status</th>
              <th className="px-6 py-5 text-right">Created</th>
              <th className="px-6 py-5 text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-stone-50">
            {filtered.map((r) => (
              <tr key={r._id} className="hover:bg-[#F9F6F0]/40 transition">
                {/* USER */}
                <td className="px-6 py-5">
                  <div className="font-bold text-stone-900 flex items-center gap-2">
                    <User size={14} /> {r.userId?.name || "—"}
                  </div>
                  <div className="text-[10px] text-stone-400 font-black uppercase">
                    {r.role}
                  </div>
                </td>

                {/* CATEGORY */}
                <td className="px-6 py-5 text-sm font-bold text-stone-700">
                  {r.category}
                </td>

                {/* MESSAGE */}
                <td className="px-6 py-5 text-sm max-w-md">
                  <div className="flex items-start gap-2">
                    <MessageSquare size={14} className="text-[#C05D38] mt-0.5" />
                    <p className="line-clamp-2">{r.message}</p>
                  </div>
                </td>

                {/* STATUS */}
                <td className="px-6 py-5 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${statusPill(
                      r.status
                    )}`}
                  >
                    {r.status === "RESOLVED" ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle size={10} /> Resolved
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Clock size={10} /> Open
                      </span>
                    )}
                  </span>
                </td>

                {/* CREATED */}
                <td className="px-6 py-5 text-right text-xs text-stone-500 font-bold">
                  {fmt(r.createdAt)}
                </td>

                {/* ACTION */}
                <td className="px-6 py-5 text-right">
                  {r.status === "OPEN" ? (
                    <button
                      onClick={() => resolve(r._id)}
                      className="px-4 py-2 rounded-xl bg-stone-900 text-white text-[9px] font-black uppercase tracking-widest hover:bg-stone-800"
                    >
                      Resolve
                    </button>
                  ) : (
                    <span className="text-[9px] font-black text-stone-400 uppercase">
                      Closed
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!filtered.length && (
          <div className="py-24 text-center text-stone-400 text-[10px] font-black uppercase tracking-[0.3em]">
            No support requests found
          </div>
        )}
      </div>
    </div>
  );
}
