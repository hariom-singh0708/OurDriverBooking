import Navbar from "./Navbar";
import Hero from "./Hero";
import FeatureCards from "./FeatureCards";
import ChoiceSection from "./ChoiceSection";

const IMAGES = {
  // Use high-quality professional photography to match the "Velocity Drives" look
  // hero: "https://images.unsplash.com/photo-1549194388-2469d59ec75c?auto=format&fit=crop&q=80&w=2000",
  hero: "home-bg.jpg",
  leftSection: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=1000",
  smallCard: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=500",
};

export default function HomePage() {
  return (
    // bg-[#FBF9F6] matches the sophisticated off-white/cream in the image
    <div className="min-h-screen bg-[#FBF9F6] text-stone-900 font-sans">
      <Navbar />
      <main>
        <Hero image={IMAGES.hero} />
        
        {/* We add a subtle container to separate sections like the image */}
        <div className="relative z-10 -mt-12 md:-mt-20">
             <FeatureCards />
        </div>
        
        <ChoiceSection
          leftImage={IMAGES.leftSection}
          smallImage={IMAGES.smallCard}
        />
      </main>
      
      {/* Footer mimicry from the image */}
      <footer className="py-10 bg-white border-t border-stone-200 text-center text-xs text-stone-400 uppercase tracking-widest">
        © 2026 Velocity Drives • Luxury Transportation
      </footer>
    </div>
  );
}