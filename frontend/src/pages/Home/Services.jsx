import React,{ useEffect, useRef, useState } from "react";
import { 
  Car, MapPin, CreditCard, Shield, BarChart3, 
  Headphones, ArrowRight, Smartphone, UserCheck, 
  Navigation, CheckCircle, Globe, Zap, Facebook, Twitter, Instagram
} from "lucide-react";
import sos from "../../assets/sos.png"
import offer from "../../assets/offer.png"
import payment from "../../assets/payment.png"
import ride from "../../assets/ride.png"
import { Link, useNavigate } from "react-router-dom";
import Footer from "./Footer";

export default function Services() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const steps = [
  {
    num: "01",
    title: "Request Ride",
    desc: "Launch the app and set your destination. AI matches you with the nearest driver instantly.",
  },
  {
    num: "02",
    title: "Driver Assigned",
    desc: "Receive full driver documentation and live ETA. Every driver is KYC-verified.",
  },
  {
    num: "03",
    title: "Track in Real-time",
    desc: "Share your journey with loved ones. Watch your driver move with sub-second GPS precision.",
  },
  {
    num: "04",
    title: "Secure Completion",
    desc: "Auto-billing kicks in the moment you arrive. Digital receipts sent immediately.",
  },
];

const howRef = useRef(null);
const [activeStep, setActiveStep] = useState(0);
const [inView, setInView] = useState(false);
const navigate = useNavigate();
const goToDemo = () => {
  navigate("/?scroll=platform-demo");
};

useEffect(() => {
  if (!howRef.current) return;

  const observer = new IntersectionObserver(
    ([entry]) => setInView(entry.isIntersecting),
    { threshold: 0.35 }
  );

  observer.observe(howRef.current);
  return () => observer.disconnect();
}, []);
 
useEffect(() => {
  if (!inView) return;

  const timer = setInterval(() => {
    setActiveStep((prev) => (prev + 1) % steps.length);
  }, 1800);

  return () => clearInterval(timer);
}, [inView]);


  return (
    <>
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden">
      
      {/* ================= HERO SECTION ================= */}
      <section className="max-w-7xl mx-auto px-6 pt-6 pb-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D99233]/10 border border-[#D99233]/20 mb-8">
          <Zap size={14} className="text-[#D99233]" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D99233]">
            Next-Gen Dispatch Engine
          </span>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter leading-[0.85] mb-8">
          Mobility, built for 
          <span className="px-2 text-brand">performance.</span>
        </h1>
        
        <p className="text-slate-500 max-w-xl mx-auto text-lg font-medium leading-relaxed mb-8">
          A high-fidelity driver-booking ecosystem designed for reliability, 
          safety, and total operational transparency.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <button className="px-10 py-5 bg-[#D99233] text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-[#c4812a] transition-all shadow-xl shadow-[#D99233]/20 hover:-translate-y-1">
            Book a Driver
          </button>
          <button className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-black transition-all shadow-xl shadow-slate-900/10 hover:-translate-y-1"
          onClick={goToDemo}
          >
            Platform Demo
          </button>
        </div>
      </section>

      {/* ================= IMAGE FEATURE ROW ================= */}
      <section className="max-w-7xl mx-auto px-6 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <ImageCard title="Fare Estimates" img={ride}
           />
          <ImageCard title="Secure Payments" img={payment}/>
          <ImageCard title="Exclusive Offers" img={offer}/>
          <ImageCard title="SOS Button" img={sos}/>
        </div>
      </section>

      {/* ================= SERVICES GRID ================= */}
      <section className="max-w-7xl mx-auto px-6 py-8 border-t border-slate-50">
        <div className="mb-3 md:mb-8 flex justify-between items-end">
          <div>
            <h4 className="text-[#D99233] font-black uppercase text-xs tracking-[0.4em] mb-2">Core Infrastructure</h4>
            <h2 className="text-4xl font-bold tracking-tight">What We Provide</h2>
          </div>
          <div className="hidden md:block h-[1px] flex-1 mx-12 bg-slate-100" />
          <Globe className="text-slate-200" size={32} />
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <ServiceBlock icon={<Car />} title="On-Demand Driver Booking" />
          <ServiceBlock icon={<Navigation />} title="Live Ride Tracking" />
          <ServiceBlock icon={<CreditCard />} title="Flexible Payments" />
          <ServiceBlock icon={<Shield />} title="Safety & SOS" />
          <ServiceBlock icon={<BarChart3 />} title="Admin & Analytics" />
          <ServiceBlock icon={<Headphones />} title="Help & Support" />
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
    <section
  ref={howRef}
  className="max-w-7xl mx-auto px-6 py-8 bg-[#fafafa] rounded-[4rem] mb-12"
>
  <div className="grid lg:grid-cols-2 gap-2 md:gap-24 items-start">
    
    {/* LEFT */}
    <div className="sticky top-12">
      <h2 className="text-4xl font-black uppercase tracking-tighter mb-5">
        How it Works
      </h2>
      <p className="text-slate-500 text-md font-medium leading-relaxed md:mb-5">
        We’ve redefined the workflow to be as simple as a few taps.
      </p>

      <div className="aspect-video rounded-[3rem] overflow-hidden shadow-2xl relative hidden md:block">
        <img
          src="https://img.freepik.com/premium-photo/modern-futuristic-illustration-concept-design-four-wheeler-car-bike-modern-transportation_1026261-1927.jpg"
          className="w-full h-full object-cover"
          alt="Modern Transit"
        />
      </div>
    </div>

    {/* RIGHT – STEPS */}
    <div className="relative pt-4">
      <div className="absolute left-[31px] top-10 bottom-10 w-[3px] bg-slate-200" />

      <div className="space-y-16">
        {steps.map((step, index) => (
          <WorkStep
            key={step.num}
            num={step.num}
            title={step.title}
            desc={step.desc}
            active={index === activeStep}
          />
        ))}
      </div>
    </div>

  </div>
</section>


      {/* ================= CALL TO ACTION ================= */}
      <section className="max-w-7xl mx-auto px-6 mb-12 md:mb-24">
        <div className="relative h-[500px] rounded-[3.5rem] overflow-hidden flex items-center justify-center text-center p-8">
          <img 
            src="https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=1400&q=80" 
            className="absolute inset-0 w-full h-full object-cover brightness-[0.75]"
            alt="Premium Vehicle"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60" />
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-10 leading-[1.1] tracking-tighter drop-shadow-2xl">
              Are you ready to experience the speed and <br className="hidden md:block" /> simplicity of our services?
            </h2>
            <div className="flex flex-wrap gap-5 justify-center">

              <Link to={'/login'}>
              <button className="px-12 py-5 bg-white text-slate-900 rounded-full font-black uppercase tracking-widest text-[11px] hover:scale-105 transition-transform shadow-2xl">
                Get Started
              </button>
              </Link>

              <Link to={'/about'}>
              <button className="px-12 py-5 border-2 border-white text-white rounded-full font-black uppercase tracking-widest text-[11px] hover:bg-white hover:text-slate-900 transition-all backdrop-blur-sm">
                Learn More &gt;
              </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
       <Footer />
    </>
  );
}

/* ================= HELPER COMPONENTS ================= */

function WorkStep({ num, title, desc, active }) {
  return (
    <div className="relative flex gap-10 group cursor-default">
      <div className={`z-10 flex items-center justify-center w-16 h-16 rounded-full border-[3px] transition-all duration-500 shrink-0 font-black text-xl
        ${active 
          ? 'border-[#D99233] bg-[#D99233] text-white shadow-2xl shadow-[#D99233]/40 scale-110' 
          : 'border-slate-200 bg-white text-slate-300 group-hover:border-[#D99233] group-hover:bg-[#D99233] group-hover:text-white group-hover:shadow-2xl group-hover:shadow-[#D99233]/40 group-hover:scale-110'
        }`}>
        {num}
      </div>
      <div className="pt-2">
        <h3 className={`text-2xl font-bold mb-3 transition-colors ${active ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-900'}`}>
          {title}
        </h3>
        <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
          {desc}
        </p>
      </div>
    </div>
  );
}

function ServiceBlock({ icon, title }) {
  return (
    <div className="bg-[#fcfcfc] border-2 border-[#D99233]/10 p-6 rounded-[2.5rem] hover:border-[#D99233] hover:shadow-2xl hover:shadow-[#D99233]/10 transition-all duration-500 group">
      <div className="h-14 w-14 bg-white text-[#D99233] border border-[#D99233]/20 rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:bg-[#D99233] group-hover:text-white transition-all duration-500 group-hover:rotate-6">
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <h4 className="font-bold text-lg text-slate-900 mb-3 tracking-tight">{title}</h4>
      <p className="text-xs text-slate-400 leading-relaxed font-medium">
        Professional solutions tailored for modern car owners.
      </p>
    </div>
  );
}

function ImageCard({ title, img }) {
  return (
    <div className="group cursor-pointer">
      <div className="h-48 w-full rounded-[2.5rem] overflow-hidden mb-6 border-2 border-[#D99233]/5 group-hover:border-[#D99233] relative transition-all duration-500">
        <img src={img} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <h3 className="font-bold text-slate-800 text-sm mb-2 tracking-tight flex items-center gap-2">
        {title} <ArrowRight size={14} className="text-[#D99233] opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
      </h3>
      <p className="text-[11px] text-slate-400 font-medium">
        Industry-leading reliability.
      </p>
    </div>
       

  );
}