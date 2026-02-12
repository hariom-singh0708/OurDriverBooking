export default function FeatureCard({ icon, title, subtitle }) {
  return (
    <div className="group relative p-8 rounded-4xl bg-white backdrop-blur-xl border border-white transition-all duration-500 hover:bg-white/40 hover:border-brand/20 hover:-translate-y-2 shadow-xl hover:shadow-[0_20px_40px_rgba(210,125,86,0.1)]">

      {/* Decorative Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#D27D56]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem]" />

      {/* Content Wrapper - CENTERED */}
      <div className="relative z-10 flex flex-col items-center text-center ">

        {/* Icon Container */}
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-brand/10 text-brand shadow-sm group-hover:scale-110 group-hover:bg-brand group-hover:text-white transition-all duration-500">
          {icon}
        </div>

        <h3 className="mb-3 text-xl font-bold text-[#2D1B18] group-hover:text-brand transition-colors">
          {title}
        </h3>

        <p className="text-sm leading-relaxed text-[#4A3733]/60 group-hover:text-[#4A3733] transition-colors">
          {subtitle}
        </p>

      </div>
    </div>
  );
}
