import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#FBF9F6] overflow-hidden font-sans">

      {/* Terracotta ambient shapes */}
      <div className="absolute -top-40 -left-40 h-[30rem] w-[30rem] rounded-full bg-[#C05D38]/20 blur-[120px]" />
      <div className="absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-[#E8B4A0]/40 blur-[140px]" />

      {/* Main Card */}
      <div className="relative z-10 max-w-xl w-full mx-6 rounded-[3rem] bg-white border border-stone-100 shadow-[0_40px_120px_-30px_rgba(192,93,56,0.35)] p-12 text-center">

        {/* Accent line */}
        <div className="mx-auto mb-6 h-1 w-20 rounded-full bg-gradient-to-r from-[#C05D38] via-[#E8B4A0] to-[#C05D38]" />

        {/* Code */}
        <div className="text-[6.5rem] leading-none font-black tracking-tighter text-[#C05D38]">
          404
        </div>

        {/* Title */}
        <h1 className="mt-3 text-2xl font-black uppercase tracking-widest text-stone-900">
          Page Not Found
        </h1>

        {/* Subtitle */}
        <p className="mt-4 text-sm text-stone-500 leading-relaxed max-w-md mx-auto">
          Looks like this page wandered off the map.  
          Don’t worry — you’re still on the right journey.
        </p>

        {/* Actions */}
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-2xl bg-[#C05D38] text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-[#C05D38]/30 hover:bg-[#b45431] transition-all active:scale-95"
          >
            <ArrowLeft size={14} />
            Go Home
          </button>
        </div>

        {/* Brand */}
        <p className="mt-10 text-[9px] font-black uppercase tracking-[0.4em] text-stone-400">
          Driver Booking Platform
        </p>
      </div>
    </div>
  );
}
