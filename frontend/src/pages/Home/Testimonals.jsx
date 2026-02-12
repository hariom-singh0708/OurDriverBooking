import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Sarah Jenkins",
    role: "Regular User",
    image: "https://randomuser.me/api/portraits/women/42.jpg",
    review: "The booking process was incredibly simple and the ride was comfortable.",
  },
  {
    id: 2,
    name: "Michael Ross",
    role: "Frequent Rider",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    review: "Very smooth ride booking system. Real-time tracking works perfectly!",
  },
  {
    id: 3,
    name: "Shane Lee",
    role: "Satisfied Customer",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    review: "Amazing booking experience! The drivers are professional and always on time.",
  },
  {
    id: 4,
    name: "Daniel James",
    role: "Business Traveler",
    image: "https://randomuser.me/api/portraits/men/75.jpg",
    review: "Reliable and fast. My go-to taxi booking solution for business trips.",
  },
  {
    id: 5,
    name: "Olivia Brown",
    role: "Happy Client",
    image: "https://randomuser.me/api/portraits/women/12.jpg",
    review: "Customer support is fantastic and drivers are very polite.",
  },
];

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(2); // Start with index 2 (Shane Lee)

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Logic to always get 5 items: [Left2, Left1, CENTER, Right1, Right2]
  const getVisibleTestimonials = () => {
    const len = testimonials.length;
    const indices = [
      (activeIndex - 2 + len) % len,
      (activeIndex - 1 + len) % len,
      activeIndex, // This one is always in the center
      (activeIndex + 1) % len,
      (activeIndex + 2) % len,
    ];
    return indices.map((i) => testimonials[i]);
  };

  const visibleItems = getVisibleTestimonials();

  return (
    <section className="bg-white py-10 font-sans">
      <div className="max-w-7xl mx-auto px-4 text-center">
        
        {/* Header */}
        <div className="mb-12">
          <p className="text-sm uppercase tracking-widest text-gray-500 mb-2">
             — Testimonials
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
            Our Customer <span className="text-[#D08C2F]">Testimonials</span>
          </h2>
        </div>

        {/* Carousel Container */}
        <div className="flex items-center justify-center gap-4 md:gap-8 mb-8">
          
          {/* Left Button */}
          <button 
            onClick={handlePrev}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-[#D08C2F] text-white shadow-lg hover:bg-[#b57a28] transition-all transform hover:scale-110 z-10 hover:cursor-pointer"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Images Row */}
          <div className="flex items-center gap-4 md:gap-6">
            {visibleItems.map((item, index) => {
              // Index 2 is always the center item in our 'visibleItems' array
              const isCenter = index === 2;
              
              return (
                <div 
                  key={`${item.id}-${index}`} 
                  className={`transition-all duration-500 ease-in-out ${isCenter ? "z-10" : "z-0 opacity-70"}`}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className={`
                      object-cover shadow-md transition-all duration-500
                      ${isCenter 
                        ? "w-[130px] h-[170px] md:w-[160px] md:h-[210px] rounded-[50%] border-4 border-[#D08C2F] p-1 bg-white scale-110" 
                        : "w-16 h-16 md:w-24 md:h-24 rounded-full grayscale hover:grayscale-0"
                      }
                    `}
                  />
                </div>
              );
            })}
          </div>

          {/* Right Button */}
          <button 
            onClick={handleNext}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-[#D08C2F] text-white shadow-lg hover:bg-[#b57a28] transition-all transform hover:scale-110 z-10 hover:cursor-pointer"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Text Content (Always showing info for the Active/Center item) */}
        <div className="max-w-2xl mx-auto transition-all duration-300">
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {testimonials[activeIndex].name}
          </h3>
          <p className="text-[#D08C2F] font-medium mb-4">
            {testimonials[activeIndex].role}
          </p>
          <p className="text-gray-600 text-lg leading-relaxed italic">
            "{testimonials[activeIndex].review}"
          </p>
        </div>

      </div>
    </section>
  );
}