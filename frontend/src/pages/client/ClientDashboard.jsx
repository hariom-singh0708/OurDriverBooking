import { useEffect, useState } from "react";
import { getClientProfile, getClientRides } from "../../services/client.api";
import { useNavigate } from "react-router-dom";

export default function ClientDashboard() {
  const [profile, setProfile] = useState(null);
  const [rides, setRides] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getClientProfile().then((res) => setProfile(res.data?.data));
    getClientRides().then((res) => setRides(res.data?.data || []));
  }, []);

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F6]">
        <div className="relative">
          <div className="w-16 h-16 border-2 border-[#BC6641]/20 border-t-[#BC6641] rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#BC6641]">V</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F6] text-[#2D2421] selection:bg-[#BC6641]/20 pb-12 overflow-x-hidden">

      {/* ================= HERO SECTION ================= */}
      <section className="relative pt-3 md:pt-6 pb-24 md:pb-32 px-4 md:px-6">
        <div className="absolute top-[-10%] left-[-5%] w-full max-w-[600px] aspect-square bg-[#BC6641]/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-[20%] right-[-10%] w-full max-w-[400px] aspect-square bg-brand/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="h-[1px] w-12 bg-[#BC6641]"></span>
                <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] text-[#BC6641]">Premium Travel</span>
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-light leading-none tracking-tight">
                Welcome, <br />
                <span className="italic font-medium text-[#BC6641]">{profile.name.split(' ')[0]}</span>
              </h1>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <VisualActionCard
                title="Book Journey"
                image="https://tse1.mm.bing.net/th/id/OIP.5QtSCPz_X1nkRdYoLWaXDAHaE8?rs=1&pid=ImgDetMain&o=7&rm=3"
                onClick={() => navigate("/client/book")}
                accent
              />
              <VisualActionCard
                title="Activity Log"
                image="https://img.freepik.com/premium-vector/car-booking-app-vector-illustration-concept_858355-325.jpg"
                onClick={() => navigate("/client/history")}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================= CONTENT GRID ================= */}
      <section className="relative z-20 max-w-7xl mx-auto px-4 md:px-6 -mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* MAIN JOURNEY FEED */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-serif italic">Recent Journeys</h2>
              <button onClick={() => navigate("/client/history")} className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#BC6641]">
                Full History <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {rides.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-[#EBD9D0] rounded-[3rem] bg-white/30 backdrop-blur-sm">
                  <p className="text-[#8E817C] font-serif italic text-lg">Your travel history is currently a clean slate.</p>
                </div>
              ) : (
                rides.slice(0, 3).map((ride) => (
                  <JourneyCard key={ride._id} ride={ride} />
                ))
              )}
            </div>
          </div>

          {/* SIDEBAR: SAVED PLACES */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-[#2D2421] rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-10 text-white shadow-2xl shadow-[#2D2421]/20">
              <h2 className="text-2xl font-serif italic mb-8">Favorites</h2>
              <div className="space-y-5">
                {profile.savedAddresses?.map((addr, i) => (
                  <div key={i} className="flex items-start gap-4 group cursor-pointer">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#BC6641] group-hover:scale-150 transition-transform"></div>
                    <p className="text-sm font-light text-white/70 group-hover:text-white leading-snug truncate">
                      {addr.address}
                    </p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate("/client/profile")}
                className="w-[50%] mt-10 py-4 bg-[#BC6641] hover:bg-[#A35232] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95"
              >
                Add New Spot
              </button>
            </div>

            <div className="hidden lg:block h-48 bg-[#BC6641]/10 rounded-[3rem] relative overflow-hidden p-8 border border-[#BC6641]/10">
              <p className="text-[#BC6641] font-serif italic opacity-60">"Travel is the only thing you buy that makes you richer."</p>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#BC6641]/20 rounded-full blur-2xl"></div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}

/* ================= COMPONENT: JOURNEY CARD (IMPROVED) ================= */


function JourneyCard({ ride }) {
  const navigate = useNavigate();

  const handleOpenRide = () => {
    navigate(`/client/live/${ride._id}`);
  };

  return (
    <div className="group relative bg-white/60 backdrop-blur-md rounded-[2.5rem] p-6 md:p-8 border border-white/80 shadow-sm hover:shadow-xl hover:bg-white transition-all duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

        {/* Route Info */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-[#FAF6F4] text-[#BC6641] text-[9px] font-black rounded-full uppercase tracking-widest border border-[#F4E9E2]">
              {ride.status?.replace('_', ' ')}
            </span>
            <span className="text-[11px] text-[#8E817C] font-bold uppercase tracking-tighter">
              {new Date(ride.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <div className="relative pl-6 space-y-4">
            <div className="absolute left-[3px] top-1.5 bottom-1.5 w-[1px] bg-gradient-to-b from-[#BC6641] via-[#EBD9D0] to-gray-300"></div>

            <div className="relative">
              <div className="absolute -left-[26px] top-1 h-2 w-2 rounded-full bg-[#BC6641] ring-4 ring-[#FAF6F4]"></div>
              <p className="text-sm font-bold text-[#2D2421] leading-none">
                {ride.pickupLocation?.address.split(',')[0]}
              </p>
              <p className="text-[11px] text-[#8E817C] mt-1 font-medium italic">Pickup Point</p>
            </div>

            <div className="relative">
              <div className="absolute -left-[26px] top-1 h-2 w-2 rounded-full bg-gray-400 ring-4 ring-[#FAF6F4]"></div>
              <p className="text-sm font-bold text-[#2D2421] leading-none truncate max-w-[200px] md:max-w-md">
                {ride.dropLocation?.address}
              </p>
              <p className="text-[11px] text-[#8E817C] mt-1 font-medium italic">Destination</p>
            </div>
          </div>
        </div>

        {/* Fare & CTA */}
        <div className="flex items-center justify-between md:flex-col md:items-end md:justify-center px-2 md:px-0 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-[#F4E9E2] md:pl-8">
          <div className="text-left md:text-right">
            <p className="text-xs font-bold text-[#BC6641]/60 uppercase tracking-widest">Total Fare</p>
            <p className="text-4xl font-serif font-medium text-[#2D2421]">
              ₹{ride.fareBreakdown?.totalFare || "0"}
            </p>
          </div>

          {/* 🔥 CLICKABLE BUTTON */}
          <div
            onClick={handleOpenRide}
            className="h-12 w-12 rounded-2xl bg-[#FAF6F4] cursor-pointer group-hover:bg-[#BC6641] flex items-center justify-center text-[#BC6641] group-hover:text-white transition-all duration-300 shadow-inner active:scale-95"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}


/* ================= COMPONENT: VISUAL ACTION CARD ================= */

function VisualActionCard({ title, image, onClick, accent }) {
  return (
    <div
      onClick={onClick}
      className={`group relative h-40 w-full sm:w-64 lg:w-72 rounded-[2.5rem] overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl shadow-black/10
        ${accent ? 'ring-2 ring-[#BC6641] ring-offset-4 ring-offset-[#FAF8F6]' : ''}`}
    >
      <img src={image} className="absolute inset-0 w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" alt={title} />
      <div className="absolute inset-0 bg-gradient-to-t from-[#2D2421]/90 via-[#2D2421]/20 to-transparent"></div>

      <div className="relative h-full p-6 flex flex-col justify-end">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </div>
        </div>
      </div>
    </div>
  );
}