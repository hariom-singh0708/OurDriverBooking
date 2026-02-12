// src/components/PriceCalculator.jsx
import { useState } from "react";
import { Link } from "react-router-dom";

export default function PriceCalculator() {
  const [distance, setDistance] = useState(20);
  const basePrice = 50;
  const perKm = 12;
  const total = basePrice + distance * perKm;

  return (
    // Background changed to soft linen/cream
    <section className="py-4 md:py-8 bg-[#877d7657] px-4 sm:px-6">
      <div className="mx-auto max-w-5xl">
        {/* Main Card: White frosted glass effect */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center bg-white/40 backdrop-blur-2xl border border-white rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-16 shadow-[0_20px_50px_rgba(210,125,86,0.1)]">
          
          <div className="space-y-4 md:space-y-6">
            <span className="text-brand text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]">
              Instant Estimate
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-[#2D1B18] leading-[1.15] md:leading-tight tracking-tight">
              Know your fare <br /> 
              <span className="text-brand/60">before you book</span>
            </h2>
            <p className="text-sm md:text-base text-[#4A3733]/70 leading-relaxed max-w-md">
              Transparent pricing with no hidden surges. Use our interactive calculator to get a precise estimate for your next premium journey.
            </p>
          </div>

          {/* Calculator Tool: Slightly more solid glass for input focus */}
          <div className="space-y-8 bg-white/60 p-6 md:p-10 rounded-[2rem] border border-white shadow-sm transition-all duration-500 hover:shadow-md">
            
            <div className="space-y-5">
              <div className="flex justify-between items-end">
                <label className="text-[10px] md:text-xs uppercase tracking-widest font-bold text-[#2D1B18]/50">
                  Trip Distance
                </label>
                <span className="text-2xl md:text-3xl font-black text-brand">
                  {distance} <small className="text-[10px] text-[#2D1B18]/40 uppercase">km</small>
                </span>
              </div>
              
              {/* Custom Range Slider Styling */}
              <input 
                type="range" 
                min="1" 
                max="100" 
                value={distance} 
                onChange={(e) => setDistance(e.target.value)}
                className="w-full h-1.5 bg-brand/20 rounded-lg appearance-none cursor-pointer accent-[#D27D56]"
              />
              <div className="flex justify-between text-[10px] font-bold text-[#2D1B18]/30 uppercase tracking-tighter">
                <span>1 km</span>
                <span>100 km</span>
              </div>
            </div>

            {/* Fare Display */}
            <div className="pt-8 border-t border-brand/10 flex justify-between items-center">
              <span className="text-[#2D1B18]/60 text-xs md:text-sm font-medium uppercase tracking-widest">
                Estimated Fare
              </span>
              <div className="text-right">
                <span className="text-3xl md:text-4xl font-black text-[#2D1B18] tracking-tighter">
                  <span className="text-brand text-lg md:text-xl mr-1 font-bold">Rs.</span>
                  {total}
                </span>
              </div>
            </div>
<Link to={'/login'}>
                      <button className="w-full py-4 md:py-5 bg-brand hover:bg-[#B55D3A] text-white font-bold rounded-2xl transition-all shadow-lg shadow-[#D27D56]/30 uppercase tracking-[0.2em] text-[10px] md:text-xs active:scale-[0.98] hover:cursor-pointer">
              Book This Trip
            </button>
</Link>
          </div>
        </div>
      </div>
    </section>
  );
}