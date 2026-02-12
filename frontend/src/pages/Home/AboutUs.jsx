
import aboutcar from "../../assets/aboutcar.png";
import mercedes from "../../assets/mercedes.png";
import car1 from "../../assets/car1.png";
import car2 from "../../assets/car2.png";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  ShieldCheck,
  Map,
  Clock,
  Car,
  Star,
  ArrowRight,
  CheckCircle2,
  Navigation,
  ChevronDown
} from "lucide-react";
import Testimonials from "./Testimonals";
import Footer from "./Footer";


/* ================= REFINED COMPONENTS ================= */

function SectionTitle({ title, center }) {
  return (
    <div className={center ? "text-center flex flex-col items-center" : ""}>
      <h2 className="text-3xl md:text-4xl font-bold text-stone-900 tracking-tight">
        {title}
      </h2>
      <div className="h-1.5 w-16 bg-brand mt-4 rounded-full" />
    </div>
  );
}


function Stat({ icon, value, label }) {
  return (
    <div className="p-6 bg-white border border-stone-100 rounded-3xl text-center shadow-sm">
      <div className="flex justify-center mb-3 text-brand opacity-70">{icon}</div>
      <p className="text-3xl font-black text-brand tracking-tight">{value}</p>
      <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mt-2">
        {label}
      </p>
    </div>
  );
}

function InfoBox({ title, points, icon, type }) {
  const isClient = type === "client";
  return (
    <div
      className={`p-10 rounded-[2.5rem] border transition-all duration-500 hover:shadow-xl ${
        isClient ? "bg-brand text-white border-transparent" : "bg-white border-stone-300 text-stone-900"
      }`}
    >
      <div
        className={`h-12 w-12 rounded-xl flex items-center justify-center mb-6 ${
          isClient ? "bg-white/10" : "bg-brand/10 text-brand"
        }`}
      >
        {icon}
      </div>

      <h3 className="text-2xl font-bold mb-6 tracking-tight">{title}</h3>

      <ul className="space-y-4">
        {points.map((p, i) => (
          <li key={i} className="flex gap-3 text-sm font-medium opacity-90 leading-snug">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5" /> {p}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AboutHero() {
    const navigate = useNavigate()
    const [openIndex, setOpenIndex] = useState(0);

  const features = [
    {
      title: "Tailored Solutions",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas."
    },
    {
      title: "Scalable & Future-Ready",
      content: "Our platforms are built to grow with your needs, ensuring long-term reliability and performance."
    },
    {
      title: "Client-centric Approach",
      content: "We prioritize your feedback and business goals to deliver results that actually matter to your bottom line."
    },
    {
      title: "Security & Compliance First",
      content: "Industry-leading security protocols are baked into every layer of our service to protect your data."
    }
  ];
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
          <>

    <section className="relative w-full min-h-[50vh]  bg-white overflow-hidden font-sans">
      {/* Background Split - Black Diagonal Section */}
      <div 
        className="absolute top-0 right-0 w-full h-[50vh] bg-black hidden lg:block"
        style={{ clipPath: 'polygon(55% 0, 100% 0, 100% 100%, 75% 100%)' }}
      />
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-2 md:py-12 md:py-24 grid lg:grid-cols-2 gap-0 items-center relative z-20">
        
        {/* LEFT CONTENT: Occupies 50% of the grid */}
        <div className="space-y-6 lg:pr-10">
          <h2 className="text-3xl md:text-6xl font-black text-gray-900 leading-tight">
            About <span className="text-[#D9933F]">Driver Book</span>
          </h2>
          <p className="text-gray-600 text-lg md:text-xl max-w-lg leading-relaxed font-medium">
            A driver-only booking platform connecting car owners with 
            verified, professional drivers – built for safety, trust, and 
            everyday convenience.
          </p>
          
          <div className="flex flex-wrap gap-4 p-3">
            <button className="px-4 py-4 md:px-10 md:py-4 bg-[#D9933F] text-white font-bold rounded-xl shadow-lg shadow-[#D9933F]/30 hover:bg-[#c48235] transition-all active:scale-95 hover:cursor-pointer" onClick={() => navigate("/signup")}>
              Book a Driver
            </button>
            <button className="px-6 py-4 md:px-10 md:py-4 bg-white border-2 border-[#D9933F] text-[#D9933F] font-bold rounded-xl hover:bg-[#FEF9F2] transition-all active:scale-95 hover:cursor-pointer" onClick={() => navigate("/signup")}>
              Become a Driver
            </button>
          </div>
        </div>

        {/* RIGHT CONTENT: Occupies 50% of the grid */}
        <div className="relative flex items-center justify-center lg:justify-end mt-12 lg:mt-0">
          
          {/* Floating Rating Badge */}
          <div className="absolute -top-12 left-1/2 lg:left-10 -translate-x-1/2 lg:translate-x-0 z-30 bg-white border border-[#F3E6D5] rounded-xl px-6 py-3 shadow-2xl flex flex-col items-center min-w-[140px]">
            <div className="flex gap-1 mb-1">
              {[...Array(4)].map((_, i) => (
                <Star key={i} size={18} fill="#D9933F" color="#D9933F" />
              ))}
              <Star key={4} size={18} fill="#CBD5E1" color="#CBD5E1" />
            </div>
            <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.15em]">2000+ Reviews</span>
          </div>

          {/* Car Image: Set to fill its half of the container */}
          <div className="relative w-full lg:scale-125 lg:translate-x-10 transform transition-transform duration-700">
            <img 
              src={aboutcar} 
              alt="Orange Range Rover"
              className="w-full h-auto object-contain drop-shadow-[0_35px_60px_rgba(0,0,0,0.5)]"
            />
          </div>
        </div>
      </div>
      
      {/* Mobile background fix */}
      <div 
        className="lg:hidden w-full h-40 bg-black mt-[-160px] md:mt-[-80px] relative z-0" 
        style={{ clipPath: 'polygon(0 100%, 100% 20%, 100% 100%, 0 100%)' }} 
      />
    </section>

      <section className="bg-[#FAF7F2] px-6 pt-4 pb-10 border-b border-stone-100">
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
          <Stat icon={<Navigation size={20} />} value="10K+" label="Rides Completed" />
          <Stat icon={<Users size={20} />} value="2.5K+" label="Verified Drivers" />
          <Stat icon={<Clock size={20} />} value="24/7" label="Global Support" />
          <Stat icon={<Star size={20} />} value="4.9/5" label="User Rating" />
        </div>
      </section>



 {/* ================= WHO WE ARE ================= */}
       <section className="max-w-7xl mx-auto px-6 py-6 md:py-12">
         <div className="grid lg:grid-cols-2 gap-16 items-center">
           <div className="order-2 lg:order-1">
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-4 pt-8">
                 <img
                  src={car1}
                  className="rounded-3xl shadow-lg aspect-square object-cover"
                  alt="Team"
                />
                {/* <div className="bg-brand h-32 rounded-3xl" /> */}
              </div>
              <div className="space-y-4">
                {/* <div className="bg-stone-200 h-32 rounded-3xl" /> */}
                <img
                  src={car2}
                  className="rounded-3xl shadow-lg aspect-square object-cover"
                  alt="Office"
                />
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-6">
            <SectionTitle title="Who We Are" />
            <p className="text-stone-500 leading-relaxed text-lg">
              We are building a modern mobility ecosystem for the discerning car
              owner. We believe your car should be a place of relaxation, not a
              source of driving stress. By merging rigorous vetting with an
              intuitive app, we ensure that every mile you travel is underpinned
              by safety and luxury.
            </p>

            <ul className="space-y-4 pt-4">
              {[
                "Pioneers in driver-only logistics",
                "Strict 5-step verification process",
                "Real-time AI ride monitoring",
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-stone-700 font-semibold text-sm"
                >
                  <CheckCircle2 size={18} className="text-brand" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

 <section className="bg-white px-6 py-6 md:py-12 border-y border-stone-100">
         <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
           <InfoBox
            type="client"
            icon={<Car size={24} />}
            title="For Car Owners"
            points={[
              "Book professional drivers on-demand",
              "Real-time tracking & SOS integration",
              "Transparent, kilometer-based pricing",
              "Premium corporate & monthly plans",
            ]}
          />
          <InfoBox
            type="driver"
            icon={<Users size={24} />}
            title="For Driver Partners"
            points={[
              "Flexible schedules - work when you want",
              "Direct-to-bank weekly settlements",
              "Dedicated 24/7 driver support desk",
              "Insurance coverage for every ride",
            ]}
          />
        </div>
      </section>



      <div className="bg-white font-sans overflow-x-hidden">
  
      {/* ================= SECTION 2: WHY CHOOSE US (IMAGE 2) ================= */}
      <section className="max-w-7xl mx-auto px-6 md:px-12  md:py-4 py-10">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          
          {/* Left: Mercedes Image with Rounded Corners */}
          <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl h-[400px] lg:h-[500px]  hidden md:block">
            <img 
              src={mercedes} 
              alt="Mercedes Benz" 
              className="w-full h-full object-cover "
            />
          </div>

          {/* Right: Accordion Content */}
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-900 mb-2">Why Choose Us</span>
            <h2 className="text-2xl md:text-4xl font-bold leading-tight">
              Built on Trust, <br />
              <span className="text-[#D9933F]">Driven by Results</span>
            </h2>

            <div className="mt-10 space-y-2">
              {features.map((item, index) => (
                <div 
                  key={index} 
                  className="border-b border-gray-200 last:border-0"
                >
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                    className="w-full flex items-center justify-between py-4 text-left transition-all group"
                  >
                    <span className={`text-lg font-bold ${openIndex === index ? 'text-gray-900' : 'text-gray-700'}`}>
                      {item.title}
                    </span>
                    <div className={`p-1 rounded-full border border-gray-300 transition-transform duration-300 ${openIndex === index ? 'rotate-180 bg-gray-50' : ''}`}>
                      <ChevronDown size={18} className="text-gray-600" />
                    </div>
                  </button>
                  
                  <div className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-40 opacity-100 mb-5' : 'max-h-0 opacity-0'}`}>
                    <p className="text-gray-500 leading-relaxed text-sm pr-10">
                      {item.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>
    </div>
      <Testimonials />
      <Footer/>
      </>

  );
}