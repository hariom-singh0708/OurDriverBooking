export default function FeatureCard({ icon, title, subtitle }) {
  return (
    <div className="group relative rounded-2xl bg-white p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(192,93,56,0.1)] border border-stone-100 flex flex-col items-center text-center shadow-sm shadow-amber-800">
      {/* Icon Container */}
      <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-[#F9F6F0] text-[#C05D38] transition-colors duration-300 group-hover:bg-[#C05D38] group-hover:text-white shadow-sm">
        {icon}
      </div>

      {/* Content */}
      <div className="mt-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-stone-900 group-hover:text-[#C05D38] transition-colors">
          {title}
        </h3>
        <p className="mt-3 text-sm text-stone-500 leading-relaxed font-medium">
          {subtitle}
        </p>
      </div>
      
      {/* Subtle bottom accent line that appears on hover */}
      <div className="absolute bottom-0 left-1/2 h-1 w-0 bg-[#C05D38] transition-all duration-300 group-hover:w-1/2 group-hover:-translate-x-1/2 rounded-t-full" />
    </div>
  );
}