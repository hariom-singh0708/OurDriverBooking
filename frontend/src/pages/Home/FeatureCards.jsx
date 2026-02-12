// src/components/FeatureCards.jsx
import FeatureCard from "./FeatureCard";

export default function FeatureCards() {
  return (
    // Background changed to soft Linen light theme color
    <section className="mt-12 py-8 md:py-10 bg-[#c79d8289] overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        
        {/* Responsive Header */}
        <div className="mb-12 text-center md:text-left flex flex-col items-center md:items-start gap-2">
          <span className="text-brand text-[10px] md:text-xs font-bold uppercase tracking-[0.4em]">
            Why Choose Us
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#2D1B18] tracking-tight">
            Core Benefits
          </h2>
          <div className="h-[2px] w-12 bg-brand mt-3 rounded-full" />
        </div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 hover:cursor-pointer">
          <FeatureCard 
            icon={<PriceIcon />} 
            title="Best Price" 
            subtitle="Premium service at competitive, transparent rates with no hidden costs." 
          />
          <FeatureCard 
            icon={<SafetyIcon />} 
            title="Elite Safety" 
            subtitle="Fully vetted drivers and top-tier vehicle maintenance for your peace of mind." 
          />
          <FeatureCard 
            icon={<PickupIcon />} 
            title="Home Pickups" 
            subtitle="Door-to-door convenience wherever you are, anytime you need." 
          />
          <FeatureCard 
            icon={<BookingIcon />} 
            title="Easy Bookings" 
            subtitle="Seamless scheduling via our mobile-first web app in under 60 seconds." 
          />
        </div>
      </div>
    </section>
  );
}



/* ---------------- SVG ICONS (Remains Unchanged) ---------------- */
const PriceIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zM17 5l-1.293-1.293a1 1 0 00-.707-.293H9a1 1 0 00-.707.293L7 5m10 0v14a2 2 0 01-2 2H9a2 2 0 01-2-2V5m10 0h2a2 2 0 012 2v12a2 2 0 01-2 2h-2M7 5H5a2 2 0 00-2 2v12a2 2 0 002 2h2" />
  </svg>
);
const SafetyIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);
const PickupIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const BookingIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);