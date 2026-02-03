export default function Hero({ image }) {
  return (
    <section className="relative h-[500px] w-full overflow-hidden bg-stone-100">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
      >
        {/* Soft gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/40 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 h-full flex items-center">
        <div className="max-w-xl">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-stone-900 uppercase">
            Your Journey, <br />
            <span className="text-[#C05D38]">Our Expertise</span>
          </h1>
          <p className="mt-4 text-lg text-stone-600 font-medium">
            Reliable & Comfortable Transportation Services
          </p>

          <button className="mt-8 rounded-lg bg-[#C05D38] px-8 py-4 text-sm font-bold uppercase tracking-widest text-white shadow-lg transition-transform hover:scale-105 active:scale-95">
            Find a Driver
          </button>
        </div>
      </div>
    </section>
  );
}