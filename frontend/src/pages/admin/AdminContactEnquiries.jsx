import { useEffect, useState } from "react";
import axios from "axios";

/* -------- helpers -------- */
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

function Pill({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border ${className}`}
    >
      {children}
    </span>
  );
}

export default function AdminContactEnquiries() {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const [err, setErr] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/contact`
      );
      setList(res.data?.data || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load enquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center min-h-screen bg-[#FBF9F6]">
        <div className="animate-spin h-8 w-8 border-4 border-[#C05D38] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (err) {
    return (
      <div className="p-12 flex items-center justify-center min-h-screen bg-[#FBF9F6]">
        <div className="bg-white border border-stone-100 rounded-3xl p-8 shadow-sm text-center">
          <p className="text-red-600 font-bold mb-4">{err}</p>
          <button
            onClick={loadData}
            className="px-6 py-3 rounded-xl bg-stone-900 text-white text-[10px] font-black uppercase tracking-widest"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#FBF9F6] min-h-screen font-sans space-y-8">
      {/* Header */}
      <div className="border-b border-stone-200 pb-6 flex items-end justify-between">
        <div>
          <span className="text-[#C05D38] text-[10px] font-black uppercase tracking-[0.4em]">
            Communication
          </span>
          <h1 className="text-3xl font-black text-stone-900 tracking-tighter uppercase mt-1">
            Contact Enquiries
          </h1>
        </div>

        <Pill className="bg-stone-900 text-white border-transparent">
          {list.length} Total
        </Pill>
      </div>

      {/* Table */}
      <div className="bg-white border border-stone-100 rounded-[2rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#FBF9F6] text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                <th className="py-5 px-6">Name</th>
                <th className="py-5 px-6">Email</th>
                <th className="py-5 px-6">Subject</th>
                <th className="py-5 px-6">Message</th>
                <th className="py-5 px-6 text-right">Received At</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-50">
              {list.map((m) => (
                <tr
                  key={m._id}
                  className="hover:bg-[#F9F6F0]/20 transition-colors"
                >
                  <td className="py-5 px-6 font-bold text-stone-900 text-sm">
                    {m.name}
                  </td>
                  <td className="py-5 px-6 text-xs font-bold text-stone-600">
                    {m.email}
                  </td>
                  <td className="py-5 px-6 text-xs font-bold text-stone-700">
                    {m.subject}
                  </td>
                  <td className="py-5 px-6 text-xs text-stone-600 max-w-md">
                    <div className="line-clamp-3">{m.message}</div>
                  </td>
                  <td className="py-5 px-6 text-right text-xs font-bold text-stone-500">
                    {fmtDateTime(m.createdAt)}
                  </td>
                </tr>
              ))}

              {!list.length && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-stone-400 text-sm font-bold"
                  >
                    No enquiries found
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
