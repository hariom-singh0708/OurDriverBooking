// src/components/FleetGallery.jsx

import car1 from "../../assets/car1.png";
import car2 from "../../assets/car2.png";
import car3 from "../../assets/car3.png";
import car4 from "../../assets/car4.png";
import car5 from "../../assets/car5.png";

export default function FleetGallery() {
 const fleet = [
  {
    name: "Executive Sedan",
    tag: "Business Class",
    img: car1,
    size: "lg", // top left large card
  },
  {
    name: "Luxury Sedan",
    tag: "First Class",
    img: car2,
    size: "sm",
  },
  {
    name: "Premium Sedan",
    tag: "Comfort Ride",
    img: car3,
    size: "sm",
  },
  {
    name: "Urban Sedan",
    tag: "City Travel",
    img: car4,
    size: "sm",
  },
  {
    name: "Elite Sedan",
    tag: "Executive Travel",
    img: car5,
    size: "sm",
  },
];

  return (
    <section className="py-5 md:py-10 bg-[#877d7657]  px-4 sm:px-8">
      <div className="mx-auto max-w-7xl">
        
        {/* Elegant Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-xl">
            <span className="text-brand text-[10px] md:text-xs font-black uppercase tracking-[0.5em] mb-4 block">
              The Fleet
            </span>
            <h2 className="text-2xl md:text-4xl font-bold text-[#2D1B18] tracking-tighter leading-none">
              World Class Vehicles
            </h2>
          </div>
          <p className="text-[#4A3733]/60 text-sm md:text-base max-w-xs font-medium leading-relaxed">
            Curated selection of premium automobiles for a distinguished travel experience.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:h-[600px] hover:cursor-pointer">
          {fleet.map((car, idx) => (
            <div 
              key={idx}
              className={`group relative overflow-hidden rounded-[2.5rem] bg-white transition-all duration-700 ${
                car.size === "lg" ? "md:col-span-2 h-[400px] md:h-full" : "md:col-span-1 h-[140px] md:h-full"
              }`}
            >
              {/* Animated Image */}
              <img 
                src={car.img} 
                alt={car.name} 
                className="w-full h-full object-cover transition-all duration-[1.5s] ease-out group-hover:scale-110 group-hover:rotate-1"
              />
              
              {/* Dynamic Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#2D1B18]/80 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-80" />

              {/* Top Tag - Floating Glass */}
              <div className="absolute top-6 left-6 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                <span className="bg-white/20 backdrop-blur-md text-white text-[9px] font-bold px-4 py-2 rounded-full uppercase tracking-widest border border-white/20">
                  {car.tag}
                </span>
              </div>
              
              {/* Bottom Content - No Button, Just Typography */}
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10 transform transition-transform duration-500 group-hover:-translate-y-2">
                <div className="flex flex-col">
                  <h3 className="text-2xl md:text-4xl font-bold text-white tracking-tight mb-2">
                    {car.name}
                  </h3>
                  <div className="h-1 w-0 bg-brand transition-all duration-500 group-hover:w-20" />
                  <p className="mt-4 text-white/0 group-hover:text-white/70 transition-all duration-500 text-sm font-medium">
                    Available for inter-city and local tours.
                  </p>
                </div>
              </div>

              {/* Border Glow on Hover */}
              <div className="absolute inset-0 border-[0px] group-hover:border-[8px] border-brand/10 transition-all duration-500 pointer-events-none rounded-[2.5rem]" />
            </div>
          ))}
        </div>
</div>
    </section>
  );
}