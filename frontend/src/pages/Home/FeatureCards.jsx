import FeatureCard from "./FeatureCard";

export default function FeatureCards() {
  return (
    <section className="py-10">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard icon="💲" title="Best Price" subtitle="Guaranteed" />
          <FeatureCard icon="🕘" title="24/7 Customer" subtitle="Core Services" />
          <FeatureCard icon="🏠" title="Home" subtitle="Pickups" />
          <FeatureCard icon="📅" title="Easy" subtitle="Bookings" />
        </div>
      </div>
    </section>
  );
}
