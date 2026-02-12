import { useEffect, useState } from "react";
import axios from "axios";
import { RefreshCw, CreditCard, Calendar, CheckCircle, Clock, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API = `${import.meta.env.VITE_API_BASE_URL}/admin`;

const auth = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

function money(n) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));
}

export default function PayoutHistory() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const load = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await axios.get(`${API}/payouts`, auth());
      setRows(res.data?.data || []);
    } catch (e) {
      setErr("Failed to load payout history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FBF9F6] p-4">
      <div className="animate-spin h-8 w-8 border-4 border-[#C05D38] border-t-transparent rounded-full mb-4" />
      <p className="text-stone-400 text-[10px] font-black uppercase tracking-[0.3em]">Syncing Archives...</p>
    </div>
  );

  return (
    <div className="p-4 sm:p-8 bg-[#FBF9F6] min-h-screen space-y-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between border-b border-stone-200 pb-8">
        <div>
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[9px] font-black text-[#C05D38] uppercase tracking-widest mb-4 hover:opacity-70 transition-all"
          >
            <ChevronLeft size={14} /> Back to Payouts
          </button>
          <span className="text-[#C05D38] text-[10px] font-black uppercase tracking-[0.4em]">Audit Logs</span>
          <h1 className="text-3xl font-black text-stone-900 tracking-tighter uppercase mt-1">Driver Payout History</h1>
          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-2">
            Historical records of all <span className="text-stone-900">Partner Settlements</span>
          </p>
        </div>

        <button
          onClick={load}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-stone-900 text-white font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-stone-800 transition-all active:scale-95"
        >
          <RefreshCw size={14} />
          Refresh Archives
        </button>
      </div>

      {err && (
        <div className="bg-[#FFF5F2] border border-[#C05D38]/20 text-[#C05D38] p-5 rounded-2xl flex items-center gap-3 animate-pulse">
          <p className="text-xs font-bold uppercase tracking-tight">{err}</p>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-white border border-stone-100 rounded-[2rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F9F6F0]/50 border-b border-stone-50">
                <th className="py-5 px-8 text-[10px] font-black text-stone-400 uppercase tracking-widest">Partner Details</th>
                <th className="py-5 px-6 text-center text-[10px] font-black text-stone-400 uppercase tracking-widest">Billing Cycle</th>
                <th className="py-5 px-6 text-center text-[10px] font-black text-stone-400 uppercase tracking-widest">Volume</th>
                <th className="py-5 px-6 text-center text-[10px] font-black text-stone-400 uppercase tracking-widest">Settlement</th>
                <th className="py-5 px-6 text-center text-[10px] font-black text-stone-400 uppercase tracking-widest">Status</th>
                <th className="py-5 px-8 text-right text-[10px] font-black text-stone-400 uppercase tracking-widest">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {rows.map((p) => (
                <tr key={p._id} className="group hover:bg-[#F9F6F0]/20 transition-colors">
                  {/* Driver Column */}
                  <td className="py-6 px-8">
                    <div className="font-black text-stone-900 uppercase tracking-tight text-sm">
                      {p.driverId?.name || "—"}
                    </div>
                    <div className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-0.5">
                      {p.driverId?.mobile || "No Contact"}
                    </div>
                  </td>

                  {/* Week Column */}
                  <td className="py-6 px-6 text-center">
                    <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-stone-600 bg-stone-50 py-2 px-3 rounded-xl border border-stone-100">
                      <Calendar size={12} className="text-[#C05D38]" />
                      {new Date(p.weekStart).toLocaleDateString("en-IN", { day: '2-digit', month: 'short' })} 
                      <span className="text-stone-300">→</span> 
                      {new Date(p.weekEnd).toLocaleDateString("en-IN", { day: '2-digit', month: 'short' })}
                    </div>
                  </td>

                  {/* Volume Column */}
                  <td className="py-6 px-6 text-center">
                    <span className="text-[11px] font-black text-stone-900">
                      {p.rides} <span className="text-stone-400 font-bold">Rides</span>
                    </span>
                  </td>

                  {/* Settlement Column */}
                  <td className="py-6 px-6 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-black text-stone-900">{money(p.payable)}</span>
                      <span className="text-[8px] font-black text-stone-400 uppercase tracking-tighter">Gross: {money(p.gross)}</span>
                    </div>
                  </td>

                  {/* Status Column */}
                  <td className="py-6 px-6 text-center">
                    <div className="flex justify-center">
                      {p.status === "PAID" ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-600 border border-green-100 text-[9px] font-black uppercase tracking-widest">
                          <CheckCircle size={10} /> Disbursed
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-50 text-yellow-600 border border-yellow-100 text-[9px] font-black uppercase tracking-widest">
                          <Clock size={10} /> Pending
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Paid At Column */}
                  <td className="py-6 px-8 text-right">
                    <div className="text-[10px] font-bold text-stone-500">
                      {p.paidAt ? (
                        <div className="flex flex-col items-end">
                          <span className="text-stone-900">{new Date(p.paidAt).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          <span className="text-[9px] text-stone-400 uppercase">{new Date(p.paidAt).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      ) : (
                        <span className="text-stone-300 italic tracking-widest">Unprocessed</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!rows.length && !loading && (
          <div className="py-24 text-center">
            <CreditCard className="mx-auto text-stone-100 mb-4" size={48} />
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em]">
              Archive Clear: No settlement records discovered
            </p>
          </div>
        )}
      </div>
    </div>
  );
}