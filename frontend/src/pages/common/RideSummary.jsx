// src/components/common/RideSummary.jsx
import { useNavigate } from "react-router-dom";

export default function RideSummary({ ride }) {
  const navigate = useNavigate();

  if (!ride) return null;

  const isCompleted = ride.status === "COMPLETED";

  return (
    <div className="relative bg-white rounded-[2.5rem] border border-slate-200/60 shadow-[0_10px_30px_-10px_rgba(45,27,24,0.1),0_20px_50px_-20px_rgba(210,125,86,0.05)] overflow-hidden transition-all duration-500">

      {/* 1. Header with integrated status bar */}
      <div className="flex items-center justify-between px-8 py-6 bg-slate-50/50 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-lg border border-slate-100">
            🧾
          </div>
          <div>
            <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-[#2D1B18]">
              Ride Summary
            </h2>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
              Ref: {ride._id.slice(-8).toUpperCase()}
            </p>
          </div>
        </div>

        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border ${isCompleted
            ? "bg-green-50 border-green-100 text-green-600"
            : "bg-amber-50 border-amber-100 text-amber-600"
          }`}>
          <div className={`h-1.5 w-1.5 rounded-full ${isCompleted ? "bg-green-500" : "bg-amber-500"}`} />
          <span className="text-[10px] font-black uppercase tracking-widest">
            {ride.status.replaceAll("_", " ")}
          </span>
        </div>
      </div>

      <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

        {/* 2. Left Side: Visual Route Timeline (Lg: spans 7 columns) */}
        <div className="lg:col-span-7 space-y-8 relative">
          {/* Vertical Decorative Path */}
          <div className="absolute left-3.5 top-2 bottom-2 w-[1px] border-l-2 border-dashed border-slate-100" />

          {/* Pickup */}
          <div className="relative pl-10">
            <div className="absolute left-0 top-1 h-7 w-7 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center z-10">
              <div className="h-2 w-2 rounded-full bg-green-500" />
            </div>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Pickup Point</p>
            <p className="text-sm font-bold text-[#2D1B18] leading-relaxed">
              {ride.pickupLocation.address}
            </p>
          </div>

          {/* Drop-off */}
          <div className="relative pl-10">
            <div className="absolute left-0 top-1 h-7 w-7 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center z-10">
              <div className="h-2 w-2 rounded-full bg-brand" />
            </div>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Destination</p>
            <p className="text-sm font-bold text-[#2D1B18] leading-relaxed">
              {ride.dropLocation.address}
            </p>
          </div>
        </div>

        {/* 3. Right Side: Earnings/Fare Card (Lg: spans 5 columns) */}
        <div className="lg:col-span-5">
          <div className="bg-[#2D1B18] rounded-[2rem] p-6 text-white shadow-xl shadow-[#2D1B18]/10 relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute -top-10 -right-10 h-32 w-32 bg-white/5 rounded-full blur-3xl" />

            <div className="relative z-10 space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 mb-1">Final Fare</p>
                  <p className="text-2xl font-black tracking-tighter">₹{ride.fareBreakdown.totalFare}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 mb-1">Earnings</p>
                  <p className="text-xl font-black text-brand">₹{ride.fareBreakdown.totalFare / 2}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-brand" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
                    {ride.completedAt ? new Date(ride.completedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Not Available'}
                  </p>
                  <button
                    onClick={() => navigate(`/driver/start/${ride._id}`)}
                    className="ml-auto text-[10px] font-bold text-white/60 hover:text-white transition-colors"
                  >
                    View Start Details
                  </button>
                  <button
                    onClick={() => navigate(`/driver/live/${ride._id}`)}
                    className="ml-auto text-[10px] font-bold text-white/60 hover:text-white transition-colors"
                  >
                    View Ride Details
                  </button>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Accent Line */}
      <div className="h-1.5 w-full flex">
        <div className="h-full flex-1 bg-green-500/20" />
        <div className="h-full flex-1 bg-brand" />
        <div className="h-full flex-1 bg-[#2D1B18]" />
      </div>
    </div>
  );
}