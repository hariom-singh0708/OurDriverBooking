import { Link } from "react-router-dom";
import CabDriver from "../../assets/CabDriver.jpg";

// src/components/Hero.jsx
export default function Hero({ image }) {
  return (
    <section className="relative min-h-[80vh] md:min-h-[102vh] md:h-[650px] w-full overflow-hidden bg-[#120a08]">
      {/* Background Image Container */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000"
        style={{ backgroundImage: `url(${CabDriver})` }}
      >
        {/* Unified Terracotta Overlay: 
            Darker on mobile for better contrast, 
            Radial-like gradient to highlight center 
        */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-[#D27D56]/10 md:bg-gradient-to-r md:from-black md:via-black/50 md:to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-20 md:py-0 h-full flex items-center">
        <div className="w-full max-w-3xl animate-in fade-in slide-in-from-left-10 duration-700">
          {/* Accent Line - Terracotta Theme */}
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className="h-[2px] w-8 md:w-12 bg-brand" />
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-brand">
              Premium Fleet
            </span>
          </div>

          {/* Headline: Responsive sizes & improved line-height (leading) */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tighter text-white leading-[1.1] md:leading-tight">
            Elevate Your <br />
            <span className="text-brand-gradient">Travel Experience</span>
          </h1>

          <p className="mt-4 md:mt-6 text-base md:text-xl text-white/70 font-light max-w-lg leading-relaxed">
            Professional drivers at your fingertips. Experience the gold
            standard in local and outstation travel.
          </p>

          {/* Buttons: Stacked on mobile, side-by-side on desktop */}
          <div className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-4">
            <Link to="/login">
              <button className="w-full sm:w-auto rounded-2xl bg-brand px-10 py-4 text-sm font-black uppercase tracking-widest text-white shadow-[0_10px_30px_rgba(210,125,86,0.3)] transition-all hover:bg-brand hover:-translate-y-1 active:scale-95 hover:cursor-pointer" >
                Find a Driver
              </button>
            </Link>
            <Link to="/services">
              <button className="w-full sm:w-auto rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 px-10 py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-white/10 hover:cursor-pointer">
                Our Services
              </button>
            </Link>
          </div>

          {/* Trust Badge: Hidden or resized on small mobile */}
          <div className="mt-10 md:mt-12 flex items-center gap-4 md:gap-6 text-white/40">
            <div className="flex -space-x-2 md:-space-x-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-8 w-8 md:h-10 md:w-10 rounded-full border-2 border-black bg-stone-800 flex items-center justify-center text-[8px] md:text-[10px] font-bold"
                >
                  U{i}
                </div>
              ))}
            </div>
            <p className="text-[10px] md:text-xs font-medium tracking-wide">
              Trusted by <span className="text-white font-bold">2,000+</span>{" "}
              regular travelers
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
