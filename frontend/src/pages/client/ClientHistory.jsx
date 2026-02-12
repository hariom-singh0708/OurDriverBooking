import { useEffect, useState } from "react";
import { getClientHistory } from "../../services/history.api";
import { 
  History, 
  MapPin, 
  ArrowUpRight, 
  ShieldCheck,
  Navigation2,
  Clock,
  Circle,
  Smile
} from "lucide-react";

export default function ClientHistory() {
  const [rides, setRides] = useState([]);

  useEffect(() => {
    getClientHistory().then((res) => setRides(res.data.data));
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2D2421] pb-8 selection:bg-[#BC6641]/20 font-sans overflow-x-hidden">
      
      {/* Subtle Paper Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.05] mix-blend-multiply z-0" 
           style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/p6.png')` }}></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-3 md:pt-8">
        
        {/* ================= EDITORIAL HEADER ================= */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10">
          <div className="max-w-xl space-y-6">

            <h1 className="text-2xl md:text-4xl font-serif font-light leading-none tracking-tighter">
              Your <span className="italic font-medium text-[#BC6641]">History</span>
            </h1>
            <p className="text-[#8E817C] text-lg font-light leading-relaxed border-l-2 border-[#F4E9E2] pl-6 italic">
              A curated anthology of every path crossed and every destination reached.
            </p>
          </div>

          <div className="relative group flex-shrink-0">
            <div className="absolute inset-0 bg-[#BC6641]/10 rounded-[3rem] blur-2xl group-hover:bg-[#BC6641]/20 transition-all duration-700"></div>
            <div className="relative bg-[#2D2421] rounded-[2.5rem] p-8 text-white border border-white/5 shadow-2xl flex items-center gap-8">
              <div className="h-12 w-12 bg-[#BC6641] rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6 group-hover:rotate-0 transition-transform duration-500">
                <History size={32} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#BC6641] mb-1">Total Trips</p>
                <p className="text-3xl font-serif font-medium">{rides.length}</p>
              </div>
            </div>
          </div>
        </header>

        {/* ================= DYNAMIC JOURNEY GRID ================= */}
        {rides.length === 0 ? (
          <div className="py-10 text-center bg-white/40 backdrop-blur-md rounded-[4rem] border border-[#F4E9E2]">
             <Navigation2 className="mx-auto mb-6 text-[#EBD9D0] animate-bounce" size={48} />
             <p className="text-xl font-serif italic text-[#8E817C]">The journal awaits your first entry.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rides.map((ride, index) => (
              <div
                key={ride._id}
                className={`group relative bg-white rounded-[3rem] p-10 border border-[#F4E9E2] transition-all duration-700 hover:shadow-2xl hover:shadow-[#BC6641]/10 hover:-translate-y-2
                  ${index === 0 ? 'lg:col-span-2' : ''}`} // First card is wider for visual interest
              >
                {/* Date Side-Stripe (Vertical Typography) */}
                <div className="absolute -left-2 top-12 bottom-12 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#BC6641]/30 -rotate-90 origin-center whitespace-nowrap">
                    {new Date(ride.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                </div>

                <div className="flex flex-col h-full">
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-10">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-[#2D2421] tracking-widest">DOSSIER</span>
                        <ShieldCheck size={12} className="text-emerald-500" />
                      </div>
                      <p className="text-xs font-serif italic text-[#8E817C]">#{ride._id.slice(-8).toUpperCase()}</p>
                    </div>
                    <div className="px-4 py-1.5 bg-[#FAF6F4] rounded-full border border-[#F4E9E2]">
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#BC6641]">
                        {ride.status || "Archived"}
                      </span>
                    </div>
                  </div>

                  {/* Visual Route Path */}
                  <div className="flex-1 space-y-8 mb-6 relative">
                    <div className="absolute left-[7px] top-2 bottom-2 w-[1px] bg-dashed border-l border-[#EBD9D0]"></div>
                    
                    <div className="flex items-start gap-5 relative group/loc">
                      <Circle size={14} className="mt-1 text-[#BC6641] fill-[#BC6641]/10 group-hover/loc:scale-125 transition-transform" strokeWidth={3} />
                      <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase tracking-tighter text-[#8E817C]">Pickup</p>
                        <p className="text-sm font-bold text-[#2D2421] leading-tight group-hover/loc:text-[#BC6641] transition-colors">
                          {ride.pickupLocation?.address?.split(',')[0] || "Luxury Suite"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-5 relative group/loc">
                      <MapPin size={14} className="mt-1 text-[#2D2421] group-hover/loc:text-[#BC6641] transition-all" />
                      <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase tracking-tighter text-[#8E817C]">Destination</p>
                        <p className="text-sm font-medium text-[#6B5E59] leading-tight truncate max-w-[200px]">
                          {ride.dropLocation?.address || "The Horizon"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Financial Footer */}
                  <div className="pt-8 border-t border-[#F4E9E2] flex items-end justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#BC6641] mb-1">Total Fare</p>
                      <p className="text-4xl font-serif font-medium text-[#2D2421] group-hover:scale-105 transition-transform origin-left">
                        ₹{ride.fareBreakdown?.totalFare || ride.fare || "0"}
                      </p>
                    </div>
                    
                    <button className="h-14 w-14 rounded-2xl bg-[#2D2421] text-white flex items-center justify-center group-hover:bg-[#BC6641] transition-all duration-500 shadow-xl shadow-black/10 group-hover:rotate-12">
                      <Smile size={24} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Aesthetic Bottom Spacer */}
      <div className="h-32" />
    </div>
  );
}