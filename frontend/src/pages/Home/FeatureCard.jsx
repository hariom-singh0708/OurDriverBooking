export default function FeatureCard({ icon, title, subtitle }) {
  return (
    <div className="rounded-md bg-yellow-400 p-6 shadow-md border border-yellow-300">
      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-black text-white text-lg">
        {icon}
      </div>

      <div className="mt-4 text-center">
        <div className="text-xs text-black/70 font-semibold">{title}</div>
        <div className="text-sm font-extrabold text-white drop-shadow">
          {subtitle}
        </div>
      </div>
    </div>
  );
}
