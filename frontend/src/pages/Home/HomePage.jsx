import Navbar from "./Navbar";
import Hero from "./Hero";
import FeatureCards from "./FeatureCards";
import ChoiceSection from "./ChoiceSection";

const IMAGES = {
  hero: "home-bg.jpg",
  leftSection: "home-bg.jpg",
  smallCard: "home-bg.jpg",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />
      <Hero image={IMAGES.hero} />
      <FeatureCards />
      <ChoiceSection
        leftImage={IMAGES.leftSection}
        smallImage={IMAGES.smallCard}
      />
    </div>
  );
}
