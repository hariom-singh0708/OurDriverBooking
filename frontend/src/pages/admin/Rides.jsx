import { useEffect, useMemo, useState } from "react";
import { getAdminRides } from "../../services/admin.api";
import {
  X,
  Phone,
  Filter,
  MapPin,
  CreditCard,
  Clock,
  Navigation,
} from "lucide-react";

export default function AdminRides() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({
    status: "",
    city: "",
    from: "",
    to: "",
  });
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [selectedRide, setSelectedRide] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getAdminRides({
        ...filters,
        page,
        limit: 20,
      });
      setRows(res?.data || []);
      setPages(res?.pagination?.pages || 1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  const apply = () => {
    setPage(1);
    fetchData();
  };

  const cities = useMemo(() => {
    const set = new Set();
    (rows || []).forEach((r) => {
      const c = r?.preferredCity ||r.driverId?.preferredCity || r?.pickupLocation?.city || r?.dropLocation?.city;

      if (c && typeof c === "string") set.add(c.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const StatusBadge = ({ status }) => {
    const s = String(status || "").toUpperCase();
    const colors = {
      COMPLETED: "bg-green-50 text-green-600 border-green-100",
      CANCELLED: "bg-red-50 text-red-600 border-red-100",
      ACCEPTED: "bg-[#C05D38] text-white border-[#C05D38]",
      ON_RIDE: "bg-stone-900 text-white border-stone-800",
    };

    return (
      <span className={`px-3 py-1 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest border ${colors[s] || "bg-stone-100 text-stone-500 border-stone-200"}`}>
        {s.replace(/_/g, " ")}
      </span>
    );
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FBF9F6] p-4">
      <div className="animate-spin h-8 w-8 border-4 border-[#C05D38] border-t-transparent rounded-full mb-4" />
      <p className="text-stone-400 text-[10px] font-black uppercase tracking-[0.3em]">Syncing Fleet...</p>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-6 bg-[#FBF9F6] min-h-screen font-sans">
      {/* HEADER */}
      <div className="border-b border-stone-200 pb-6 text-center sm:text-left">
        <span className="text-[#C05D38] text-[10px] font-black uppercase tracking-[0.4em]">Operations</span>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tighter uppercase">Ride Logs</h1>
      </div>

      {/* FILTERS - Responsive Grid */}
      <div className="bg-white rounded-2xl border border-stone-100 p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 shadow-sm">
        <select
          className="w-full bg-[#F9F6F0] rounded-xl px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-stone-600 outline-none"
          value={filters.status}
          onChange={(e) => setFilters(p => ({ ...p, status: e.target.value }))}
        >
          <option value="">Status: All</option>
          <option value="COMPLETED">Completed</option>
          <option value="ON_RIDE">In Transit</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <select
          className="w-full bg-[#F9F6F0] rounded-xl px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-stone-600 outline-none"
          value={filters.city}
          onChange={(e) => setFilters(p => ({ ...p, city: e.target.value }))}
        >
          <option value="">City: All</option>
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <div className="relative">
          <input type="date" className="w-full bg-[#F9F6F0] rounded-xl px-4 py-3 text-[10px] font-bold text-stone-600 outline-none" value={filters.from} onChange={e => setFilters(p => ({ ...p, from: e.target.value }))} />
        </div>
        <div className="relative">
          <input type="date" className="w-full bg-[#F9F6F0] rounded-xl px-4 py-3 text-[10px] font-bold text-stone-600 outline-none" value={filters.to} onChange={e => setFilters(p => ({ ...p, to: e.target.value }))} />
        </div>

        <button onClick={apply} className="bg-stone-900 text-white rounded-xl py-3 font-black text-[10px] uppercase tracking-widest hover:bg-stone-800 transition-all flex items-center justify-center gap-2">
          <Filter size={14} /> Update
        </button>
      </div>

      {/* TABLE - Responsive Hidden Columns */}
      <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-stone-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#F9F6F0]/50 border-b border-stone-50">
              <tr className="text-[9px] sm:text-[10px] font-black text-stone-400 uppercase tracking-widest">
                <th className="py-5 px-4 sm:px-6">ID</th>
                <th className="py-5 px-4 sm:px-6">Partners</th>
                <th className="py-5 px-6 hidden md:table-cell">Status</th>
                <th className="py-5 px-6 hidden lg:table-cell">Date</th>
                <th className="py-5 px-4 sm:px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {rows.map((r) => (
                <tr key={r._id} className="hover:bg-[#F9F6F0]/20 transition-colors">
                  <td className="py-5 px-4 sm:px-6 font-bold text-stone-900 font-mono text-[10px]">#{r._id?.slice(-4)}</td>
                  <td className="py-5 px-4 sm:px-6">
                    <div className="text-[11px] sm:text-sm font-bold text-stone-800 truncate max-w-[100px] sm:max-w-none">
                      {r.driverId?.name || "—"}
                    </div>
                    <div className="text-[8px] sm:text-[9px] text-stone-400 uppercase font-black">to {r.clientId?.name || "User"}</div>
                    <div className="md:hidden mt-1"><StatusBadge status={r.status} /></div>
                  </td>
                  <td className="py-5 px-6 hidden md:table-cell"><StatusBadge status={r.status} /></td>
                  <td className="py-5 px-6 hidden lg:table-cell text-[10px] font-bold text-stone-500">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-5 px-4 sm:px-6 text-right">
                    <button onClick={() => setSelectedRide(r)} className="text-[#C05D38] text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl border border-stone-100 gap-4">
        <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="w-full sm:w-auto text-[10px] font-black uppercase tracking-widest text-stone-400 disabled:opacity-20">← Prev</button>
        <span className="text-[10px] font-black uppercase text-stone-900">Page {page} of {pages}</span>
        <button disabled={page >= pages} onClick={() => setPage(p => p + 1)} className="w-full sm:w-auto text-[10px] font-black uppercase tracking-widest text-stone-400 disabled:opacity-20">Next →</button>
      </div>

      {selectedRide && <RideDetailsModal ride={selectedRide} onClose={() => setSelectedRide(null)} />}
    </div>
  );
}

function RideDetailsModal({ ride, onClose }) {
  return (
    <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-md z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#FBF9F6] w-full max-w-6xl h-[95vh] sm:h-auto sm:max-h-[90vh] rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col">
        
        {/* MODAL HEADER */}
        <div className="p-6 sm:p-8 border-b border-stone-200 flex items-center justify-between bg-white shrink-0">
          <div>
            <span className="text-[#C05D38] text-[9px] font-black uppercase tracking-[0.4em]">Manifest</span>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 uppercase">Ride #{ride?._id?.slice(-6)}</h2>
          </div>
          <button onClick={onClose} className="p-2 sm:p-3 rounded-full bg-stone-100 text-stone-500"><X size={20} /></button>
        </div>

        {/* MODAL BODY - Scrollable */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 h-full">
            
            {/* DATA COLUMN */}
            <div className="lg:col-span-7 p-6 sm:p-8 space-y-6 sm:space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CallButton mobile={ride?.driverId?.mobile} label="Driver" />
                <CallButton mobile={ride?.clientId?.mobile} label="Client" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Info icon={<Navigation size={14}/>} label="Status" value={ride?.status} isHighlight />
                <Info icon={<Navigation size={14}/>} label="Type" value={ride?.rideType} />
                <Info icon={<MapPin size={14}/>} label="Pickup" value={ride?.pickupLocation?.address} isWide />
                <Info icon={<MapPin size={14}/>} label="Drop" value={ride?.dropLocation?.address} isWide />
                <Info icon={<CreditCard size={14}/>} label="Fare" value={ride?.fareBreakdown?.totalFare ? `₹${ride.fareBreakdown.totalFare}` : "Pending"} />
                <Info icon={<Clock size={14}/>} label="Requested" value={new Date(ride.createdAt).toLocaleString()} />
              </div>
            </div>

            {/* MAP COLUMN - Hidden on very small screens or smaller height */}
            <div className="lg:col-span-5 bg-stone-100 min-h-[250px] lg:min-h-full relative border-t lg:border-t-0 lg:border-l border-stone-200">
               <div className="absolute inset-0 bg-[#F2EFE9] flex items-center justify-center p-8 text-center">
                  <div className="space-y-4">
                    <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-xl"><Navigation className="text-[#C05D38] animate-bounce" size={24} /></div>
                    <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Route Intelligence Active</p>
                    <div className="flex flex-col gap-2">
                       <div className="px-3 py-2 bg-white rounded-lg text-[9px] font-mono text-stone-500 border border-stone-200">Lat: {ride?.pickupLocation?.lat?.toFixed(4)}</div>
                       <div className="px-3 py-2 bg-white rounded-lg text-[9px] font-mono text-stone-500 border border-stone-200">Lng: {ride?.pickupLocation?.lng?.toFixed(4)}</div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="p-6 sm:p-8 border-t border-stone-200 bg-white flex flex-col sm:flex-row justify-end gap-3 shrink-0">
          <button onClick={() => window.print()} className="w-full sm:w-auto px-6 py-3 rounded-xl border border-stone-200 text-stone-500 text-[10px] font-black uppercase tracking-widest">Print</button>
          <button onClick={onClose} className="w-full sm:w-auto px-10 py-3 rounded-xl bg-stone-900 text-white text-[10px] font-black uppercase tracking-widest shadow-lg">Close</button>
        </div>
      </div>
    </div>
  );
}

function Info({ icon, label, value, isHighlight, isWide }) {
  return (
    <div className={`space-y-1 ${isWide ? "sm:col-span-2" : ""}`}>
      <div className="flex items-center gap-2 ml-1">
        <span className="text-[#C05D38]">{icon}</span>
        <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">{label}</p>
      </div>
      <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-stone-100 font-bold text-stone-800 text-[11px] sm:text-sm shadow-sm break-words ${isHighlight ? "text-[#C05D38] bg-[#FFF5F2]/50 border-[#C05D38]/10" : ""}`}>
        {value || "—"}
      </div>
    </div>
  );
}

function CallButton({ mobile, label }) {
  if (!mobile) return null;
  return (
    <a href={`tel:${mobile}`} className="flex items-center justify-center gap-2 px-4 py-3 bg-stone-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-stone-800 transition-all flex-1">
      <Phone size={12} className="text-[#C05D38]" /> {label}
    </a>
  );
}