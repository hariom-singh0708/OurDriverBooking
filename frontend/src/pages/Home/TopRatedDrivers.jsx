import { Star, Phone, MessageSquare } from "lucide-react";

const drivers = [
  {
    name: "Easter Howard",
    role: "SUV Taxi Driver",
    rating: 4.9,
    phone: "+11112228888",
    image: "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Marcus Jenson",
    role: "Luxury Sedan",
    rating: 4.8,
    phone: "+11113334444",
    image: "https://images.unsplash.com/photo-1618641986557-1ecd230959aa?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Leo Das",
    role: "Chauffeur",
    rating: 5.0,
    phone: "+11115556666",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80",
  },
];


export default function TopRatedDrivers() {
  return (
    <section className="bg-[#FDF9F6] py-2 md:py-8 px-6">
      <div className="max-w-5xl mx-auto">
      
        {/* ===== HEADER ===== */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand mb-2">
              Top Rated Driver
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#432C2B]">
              Meet Our <span className="text-brand">Pro Drivers</span>
            </h2>
          </div>
          {/* 
          <button className="text-[10px] font-black uppercase tracking-widest text-brand border-b-2 border-brand pb-1 hover:text-[#432C2B] hover:border-[#432C2B] transition-all">
            View All Drivers
          </button> */}
        </div>
        {/* ===== COMPACT DRIVER CARDS ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {drivers.map((driver, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-3xl p-4 border border-[#E8D9D2]/40 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden hover:cursor-pointer"
            >
              {/* Image Section - Smaller & Sharper */}
              <div className="relative w-full h-[240px] overflow-hidden rounded-2xl bg-[#F3E6E0] mb-4">
                <img
                  src={driver.image}
                  alt={driver.name}
                  className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                />

                {/* Minimal Rating Overlay */}
                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                  <Star size={10} fill="#A9564B" className="text-brand" />
                  <span className="text-[10px] font-black text-[#432C2B]">
                    {driver.rating}
                  </span>
                </div>
              </div>

              {/* Info Section */}
              <div className="px-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-md font-bold text-[#432C2B] leading-tight">
                      {driver.name}
                    </h3>
                    <p className="text-[11px] text-stone-400 font-medium mt-0.5">
                      {driver.role}
                    </p>
                  </div>

                  {/* Action Icons */}
                  {/* Action Icons */}
                  <div className="flex gap-2">
                    <a
                      href={`tel:${driver.phone}`}
                      title={`Call ${driver.name}`}
                      className="p-2 rounded-full bg-[#FDF9F6] text-brand 
               hover:bg-brand hover:text-white 
               transition-colors active:scale-95"
                    >
                      <Phone size={14} />
                    </a>
                  </div>
                </div>
              </div>

              {/* Hover Accent Bar */}
              <div className="absolute bottom-0 left-0 w-0 h-1 bg-brand transition-all duration-500 group-hover:w-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
