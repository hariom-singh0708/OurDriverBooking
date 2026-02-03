import FeatureCard from "./FeatureCard";

export default function FeatureCards() {
  return (
    <section className="pb-16 px-4">
      <div className="mx-auto max-w-6xl">
        {/* Subtle Section Title like the "SERVICES" header in the image */}
        <div className="mb-8 text-center md:text-left">
            <span className="text-[#C05D38] text-xs font-bold uppercase tracking-[0.3em]">
                Core Benefits
            </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 ">
          <FeatureCard 
            icon="🤝" 
            title="Best Price" 
            subtitle="Premium service at competitive, transparent rates." 
          />
          <FeatureCard 
            icon="🛡️" 
            title="Elite Safety" 
            subtitle="Fully vetted drivers and top-tier vehicle maintenance." 
          />
          <FeatureCard 
            icon="📍" 
            title="Home Pickups" 
            subtitle="Door-to-door convenience wherever you are." 
          />
          <FeatureCard 
            icon="✨" 
            title="Easy Bookings" 
            subtitle="Seamless scheduling via web or our mobile app." 
          />
        </div>
      </div>
    </section>
  );
}