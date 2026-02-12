// src/components/ChoiceSection.jsx
export default function ChoiceSection({ leftImage }) {
  return (
    // Background changed to soft cream/linen
    <section className="py-4 md:py-8 bg-[#F9F6F4] text-[#2D1B18] overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">
        
        {/* Section Header */}
        <div className="mb-6">
          <h2 className="text-[10px] md:text-xs font-bold tracking-[0.4em] text-brand uppercase">
            Services
            <span className="block mt-2 w-12 h-[2px] bg-brand"></span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-3 md:mb-0">
          
          {/* Image Side - Responsive scaling */}
          <div className="relative group order-2 lg:order-1">
            <div className="rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border border-white shadow-xl relative z-10 transition-transform duration-500 group-hover:shadow-2xl">
              <img
                src={leftImage || "https://images.unsplash.com/photo-1449965072335-657885072e5c?auto=format&fit=crop&q=80&w=800"}
                alt="Professional Driver"
                className="h-[300px] sm:h-[450px] md:h-[550px] w-full object-cover grayscale-[10%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
              />
            </div>
            
            {/* Soft Warm Glow behind image */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-brand/10 rounded-full blur-[60px]" />

            {/* Floating Experience Badge - Solid Theme Color */}
            <div className="absolute -bottom-6 -right-2 md:-right-6 bg-brand p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-lg z-20 transition-transform duration-500 group-hover:scale-110">
              <p className="text-white font-black text-2xl md:text-4xl leading-none">10+</p>
              <p className="text-white/80 text-[9px] md:text-[10px] uppercase font-bold tracking-widest mt-1 whitespace-nowrap">Years Experience</p>
            </div>
          </div>

          {/* Text Content Side */}
          <div className="space-y-6 md:space-y-8 order-1 lg:order-2">
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#2D1B18] leading-[1.15] md:leading-tight tracking-tight">
              Your first choice for <br className="hidden md:block" /> 
              <span className="text-brand">traveling anywhere</span>
            </h3>
            
            <p className="text-base md:text-lg text-[#4A3733]/70 leading-relaxed max-w-xl">
              Move through your city with comfort, speed, and complete confidence. 
              Our fleet and professional drivers are maintained to the highest premium standards.
            </p>

            {/* Service Highlight Card - Light Glassmorphism */}
            <div className="flex items-center gap-5 p-5 rounded-[1.5rem] md:rounded-3xl border border-white bg-white/40 backdrop-blur-md shadow-sm hover:shadow-md hover:border-brand/20 transition-all group hover:cursor-pointer">
              <div className="h-12 w-12 shrink-0 rounded-2xl bg-brand flex items-center justify-center text-white shadow-md shadow-[#D27D56]/30">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-[#2D1B18] text-lg ">High Quality Service</p>
                <p className="text-sm text-[#4A3733]/60 group-hover:text-[#4A3733] transition-colors">Only vetted professional drivers</p>
              </div>
            </div>

            {/* Contact Row */}
            <div className="pt-4 flex items-center gap-5">
              <div className="h-14 w-14 rounded-2xl bg-white border border-white shadow-sm flex items-center justify-center text-brand group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                   <path d="M20 15.5c-1.2 0-2.4-.2-3.6-.6-.3-.1-.7 0-1 .2l-2.2 2.2c-2.8-1.4-5.1-3.8-6.6-6.6l2.2-2.2c.3-.3.4-.7.2-1-.3-1.1-.5-2.3-.5-3.5 0-.6-.4-1-1-1H4c-.6 0-1 .4-1 1 0 9.4 7.6 17 17 17 .6 0 1-.4 1-1v-3.5c0-.6-.4-1-1-1z" />
                </svg>
              </div>
              <div>
              <a
  href="tel:+11112228888"
  className="text-xl md:text-2xl font-black text-[#2D1B18] hover:text-brand transition-colors cursor-pointer"
>
  +1 (111) 222-8888
</a>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}