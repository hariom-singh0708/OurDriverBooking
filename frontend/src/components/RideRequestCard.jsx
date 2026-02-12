// src/components/RideRequestCard.jsx
import { useEffect, useState } from "react";


export default function RideRequestCard({ ride, onAccept, onReject }) {
  const [timeLeft, setTimeLeft] = useState(180); // 3 min

  useEffect(() => {
    if (!ride?.createdAt) return;

    const created = new Date(ride.createdAt).getTime();
    const now = Date.now();
    const diff = Math.floor((now - created) / 1000);
    const remaining = 180 - diff;

    setTimeLeft(remaining > 0 ? remaining : 0);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onReject?.(); // auto remove when time over
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [ride]);

  if (!ride) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isUrgent = timeLeft <= 30;

  return (
    <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 md:p-10 shadow-2xl shadow-slate-200/60 
                    w-full max-w-lg lg:max-w-4xl mx-auto overflow-hidden relative group transition-all">

      {/* ⏳ TIMER BADGE */}
<div
  className={`
    absolute 
    top-4 right-4 
    sm:top-6 sm:right-8
    px-3 sm:px-4 
    py-1 
    rounded-full 
    text-[10px] sm:text-xs 
    font-black tracking-widest
    z-20
    ${isUrgent
      ? "bg-red-100 text-red-600 animate-pulse"
      : "bg-slate-100 text-slate-600"
    }
  `}
>
  ⏳ {minutes}:{seconds.toString().padStart(2, "0")}
</div>

      {/* Accent Background Glow */}
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-green-500/5 rounded-full blur-3xl" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-green-50 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
              🚕
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 leading-none">
                New Ride Request
              </h3>
              <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-green-600 font-bold mt-1.5">
                Live Ride Available Now
              </p>
            </div>
          </div>
          <div className="bg-slate-100 px-4 py-1.5 rounded-full text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest">
            {ride.paymentMethod || "CASH"}
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          
          {/* LEFT */}
          <div className="relative space-y-8 pl-8 py-2">
            <div className="absolute left-3 top-3 bottom-3 w-[1.5px] border-l-2 border-dashed border-slate-200" />

            <div className="relative">
              <div className="absolute -left-[29px] top-1.5 h-4 w-4 rounded-full bg-green-500 border-4 border-white shadow-md" />
              <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 mb-2">
                Pickup Point
              </p>
              <p className="text-base font-bold text-slate-700 leading-relaxed">
                {ride.pickupLocation.address}
              </p>
            </div>

            <div className="relative">
              <div className="absolute -left-[29px] top-1.5 h-4 w-4 rounded-full bg-brand border-4 border-white shadow-md" />
              <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 mb-2">
                Destination
              </p>
              <p className="text-base font-bold text-slate-700 leading-relaxed">
                {ride.dropLocation.address}
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="bg-slate-50/50 rounded-[2rem] p-6 md:p-8 space-y-8 border border-slate-100">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">
                  Total Fare
                </p>
                <p className="text-2xl font-black text-slate-800 tracking-tight">
                  ₹{ride.fareBreakdown.totalFare}
                </p>
              </div>
              <div className="space-y-1 border-l border-slate-200 pl-4">
                <p className="text-[10px] uppercase tracking-widest font-black text-brand">
                  Your Profit
                </p>
                <p className="text-2xl font-black text-brand tracking-tight">
                  ₹{ride.fareBreakdown.totalFare / 2}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={onAccept}
                className="w-full py-5 rounded-2xl bg-green-600 text-white text-xs font-black uppercase tracking-[0.3em] shadow-xl shadow-green-500/30 transition-all hover:bg-green-700 hover:-translate-y-1 active:scale-95 animate-pulse-subtle"
              >
                Accept Request
              </button>

              <button
                onClick={onReject}
                className="w-full py-4 rounded-2xl bg-white text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border border-slate-200 transition-all hover:bg-red-50 hover:text-red-500 hover:border-red-100 active:scale-95"
              >
                Ignore Request
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
