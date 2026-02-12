import { useState } from "react";
import { Check } from "lucide-react";

const SubscriptionPlan = () => {
  const [billing, setBilling] = useState("monthly");

  const plans = [
    { name: "Basic", monthly: "₹499", yearly: "₹4,999", features: ["Limited driver bookings", "Standard support", "Basic analytics"] },
    { name: "Standard", monthly: "₹999", yearly: "₹9,999", popular: true, features: ["Unlimited bookings", "Priority support", "Advanced analytics", "Driver performance reports"] },
    { name: "Premium", monthly: "₹1,999", yearly: "₹19,999", features: ["Everything in Standard", "Dedicated account manager", "Custom pricing rules", "Early access to new features"] },
  ];

  const states = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", 
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Chandigarh", "Jammu & Kashmir"
  ];

  return (
    <section className="w-full pt-0 pb-0 bg-[#FDF9F6] mt-0 overflow-hidden">
      
      {/* ===== HEADER SECTION ===== */}
      <div className="relative w-full pt-16 pb-12 text-center max-w-3xl mx-auto">
        <p className="text-[11px] font-black uppercase tracking-[0.25em] text-brand">
          Pricing and Plans
        </p>
        <h2 className="mt-3 text-3xl md:text-4xl font-bold text-[#432C2B]">
          Let's Know the Pricing
        </h2>
        <p className="mt-2 text-md text-stone-500 font-medium">Plan for you</p>
      </div>

      {/* ===== BILLING TOGGLE ===== */}
      <div className="flex items-center justify-center gap-4 mb-12">
        <span className={`text-xs font-bold ${billing === "monthly" ? "text-brand" : "text-stone-400"}`}>Bill Monthly</span>
        <button onClick={() => setBilling(billing === "monthly" ? "yearly" : "monthly")} className="relative w-12 h-6 bg-[#E8D9D2] rounded-full">
          <span className={`absolute top-1 left-1 w-4 h-4 bg-brand rounded-full transition-transform duration-300 ${billing === "yearly" ? "translate-x-6" : ""}`} />
        </button>
        <span className={`text-xs font-bold ${billing === "yearly" ? "text-brand" : "text-stone-400"}`}>Bill Annually</span>
      </div>

      {/* ===== PRICING CARDS (Reduced Bottom Padding) ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto px-6  md:pb-10">
        {plans.map((plan, index) => (
          <div key={index} className={`relative rounded-2xl p-6 bg-white border transition-all duration-300 ${plan.popular ? "border-brand shadow-xl scale-105 z-10" : "border-[#E8D9D2] hover:border-brand/40"} flex flex-col`}>
            {plan.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md">Most Popular</span>}
            <h3 className="text-lg font-bold text-[#432C2B] mb-4">{plan.name}</h3>
            <div className="mb-6 flex items-baseline gap-1">
              <span className="text-3xl font-black text-[#432C2B]">{billing === "monthly" ? plan.monthly : plan.yearly}</span>
              <span className="text-xs font-bold text-stone-400">/{billing === "monthly" ? "mo" : "yr"}</span>
            </div>
            <ul className="space-y-3 mb-4 flex-grow">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[13px] text-stone-600 font-medium leading-tight">
                  <Check size={14} className="text-brand mt-0.5 shrink-0" strokeWidth={3} />
                  {f}
                </li>
              ))}
            </ul>
            <button className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all ${plan.popular ? "bg-brand text-white hover:bg-[#8e453c]" : "border border-brand text-brand hover:bg-brand   hover:text-white"} hover:cursor-pointer `}>Get Started</button>
          </div>
        ))}
      </div>

      {/* ===== STRIP SECTION (Reduced Top Margin) ===== */}
      <div className="relative h-40 mt-2 flex items-center justify-center">
        
        {/* 1. BLACK STRIP */}
        <div 
          className="absolute bg-black shadow-lg"
          style={{
            width: "140vw",
            height: "52px",
            transform: "rotate(0.8deg)", 
          }}
        />

        <div
          className="absolute z-10 bg-brand shadow-2xl flex items-center overflow-hidden"
          style={{
            width: "140vw",
            height: "52px",
            transform: "rotate(-1.2deg)", 
          }}
        >
          {/* Marquee Content */}
          <div className="flex items-center animate-marquee whitespace-nowrap h-full">
            {[...states, ...states].map((state, i) => (
              <div key={i} className="flex items-center mx-10">
                <span className="text-white text-[14px] font-medium tracking-wide uppercase">
                  {state}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: marquee 70s linear infinite;
            display: flex;
          }
        `}
      </style>
    </section>
  );
};

export default SubscriptionPlan;