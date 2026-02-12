import { useEffect, useState } from "react";
import { getDriverHistory } from "../../services/history.api";
import RideSummary from "../common/RideSummary";

export default function DriverHistory() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDriverHistory()
      .then((res) => setRides(res.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-10 transition-all duration-500">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-[#2D1B18] tracking-tighter">
              Ride <span className="text-brand">History</span>
            </h1>
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-slate-400 mt-2">
              Review your completed journeys
            </p>
          </div>
          
          <div className="h-10 px-4 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#2D1B18]">
              Total: {rides.length} Rides
            </span>
          </div>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="h-10 w-10 border-4 border-brand/20 border-t-[#D27D56] rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Fetching records...
            </p>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && rides.length === 0 && (
          <div className="bg-white/40 backdrop-blur-xl border border-white rounded-[2.5rem] p-12 text-center shadow-xl shadow-slate-200/50 animate-in zoom-in duration-500">
            <div className="text-4xl mb-4 opacity-20">📜</div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
              No completed rides yet
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Your journey history will appear here once you finish a ride.
            </p>
          </div>
        )}

        {/* RIDE LIST */}
        <div className="grid grid-cols-1 gap-6 animate-in slide-in-from-bottom-8 duration-700">
          {rides.map((ride) => (
            <div 
              key={ride._id} 
              className="transition-transform duration-300 hover:-translate-y-1"
            >
              <RideSummary ride={ride} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}