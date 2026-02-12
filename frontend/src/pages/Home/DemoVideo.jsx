import demoThumbnail from "../../assets/video.png";

const DemoVideo = () => {
  return (
    <section className="w-full px-6 pt-4 md:pt-10 pb-4 md:pb-20 bg-[#FDF9F6]" id="platform-demo">
      
      {/* Headings */}
      <div className="text-center mb-4">
        <p className="text-[11px] font-black uppercase tracking-[0.25em] text-brand">
          Demos
        </p>
        <h2 className="mt-3 text-3xl md:text-4xl font-bold text-brand">
          How It Works for Everyone
        </h2>
      </div>

      {/* Video Grid Container */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* ===== DRIVER APP DEMO ===== */}
        <div className="space-y-6">
          <div className="text-center md:text-left px-2">
             <h3 className="text-lg font-bold text-brand uppercase tracking-wider">Driver </h3>
             <p className="text-xs text-stone-500 font-medium mt-1">Manage bookings and track earnings seamlessly.</p>
          </div>
          
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500 to-brand rounded-[2rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white">
              <img
                src={demoThumbnail}
                alt="Driver App Demo"
                className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/10 flex items-center justify-center group-hover:bg-black/20 transition-all">
                <div className="relative w-16 h-16 rounded-full bg-brand flex items-center justify-center shadow-2xl">
                  <svg width="20" height="24" viewBox="0 0 24 28" fill="none" className="ml-1 text-white">
                    <path d="M22.5 12.2679C23.8333 13.0377 23.8333 14.9623 22.5 15.7321L3.75 26.5574C2.41667 27.3272 0.75 26.3649 0.75 24.8253L0.750002 3.17468C0.750002 1.63508 2.41667 0.672832 3.75 1.44263L22.5 12.2679Z" fill="currentColor"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== CLIENT APP DEMO ===== */}
        <div className="space-y-6">
          <div className="text-center md:text-left px-2">
             <h3 className="text-lg font-bold text-brand uppercase tracking-wider">Client </h3>
             <p className="text-xs text-stone-500 font-medium mt-1">Book a professional driver in just a few taps.</p>
          </div>

          <div className="relative group cursor-pointer">
            <div className="absolute -inset-1 bg-gradient-to-r from-brand to-yellfrom-yellow-500 rounded-[2rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white">
              <img
                src={demoThumbnail}
                alt="Client App Demo"
                className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/10 flex items-center justify-center group-hover:bg-black/20 transition-all">
                <div className="relative w-16 h-16 rounded-full bg-brand flex items-center justify-center shadow-2xl">
                  <svg width="20" height="24" viewBox="0 0 24 28" fill="none" className="ml-1 text-white">
                    <path d="M22.5 12.2679C23.8333 13.0377 23.8333 14.9623 22.5 15.7321L3.75 26.5574C2.41667 27.3272 0.75 26.3649 0.75 24.8253L0.750002 3.17468C0.750002 1.63508 2.41667 0.672832 3.75 1.44263L22.5 12.2679Z" fill="currentColor"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default DemoVideo;