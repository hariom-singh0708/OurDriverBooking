import Hero from "./Hero";
import FeatureCards from "./FeatureCards";
import ChoiceSection from "./ChoiceSection";
import AboutHome from "./AboutHome";
import Testimonials from "./Testimonals";
import FleetGallery from "./FleetGallery";
import PriceCalculator from "./PriceCalculator";
import DemoVideo from "./DemoVideo";
import SubscriptionPlan from "./SubscriptionPlan";
import TopRatedDrivers from "./TopRatedDrivers";
import LatestBlogs from "./LatestBlogs";
import Footer from "./Footer";
import KeyFeatures from "./KeyFeatures";
import TopVehiclesSection from "./TopVehicleSection";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const IMAGES = {
   hero: "cab2.webp",
  leftSection: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=1000",
  smallCard: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=500",
};

export default function HomePage() {
  const location = useLocation();

useEffect(() => {
  const params = new URLSearchParams(location.search);
  const target = params.get("scroll");

  if (!target) return;

  // small delay so DOM mounts
  setTimeout(() => {
    const el = document.getElementById(target);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 100);
}, [location.search]);

  return (
    // bg-[#FBF9F6] matches the sophisticated off-white/cream in the image
    <div className="min-h-screen bg-[#FBF9F6] text-stone-900 font-sans">
      <main>
        <Hero image={IMAGES.hero} />

        {/* We add a subtle container to separate sections like the image */}

        <ChoiceSection
          leftImage={IMAGES.leftSection}
          smallImage={IMAGES.smallCard}
        />
        <div className="relative z-10 -mt-12 md:-mt-20">
          <FeatureCards />
        </div>
      </main>
      <AboutHome />
      <PriceCalculator />
      <DemoVideo />
      <SubscriptionPlan />
      <Testimonials />
      <TopRatedDrivers />
      <LatestBlogs />
      <KeyFeatures/>
      <TopVehiclesSection/>
      <FleetGallery />
      <Footer />
    </div>
  );
}
