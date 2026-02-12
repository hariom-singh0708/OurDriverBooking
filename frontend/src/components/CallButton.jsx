import { Phone } from "lucide-react";

export default function CallButton({ phone }) {
  return (
    <a
      href={`tel:${phone}`}
      className="
        inline-flex items-center gap-2.5
        bg-brand hover:bg-[#b46542]
        text-white text-[10px] font-black uppercase tracking-[0.15em]
        px-5 py-2.5 rounded-xl
        shadow-lg shadow-[#D27D56]/20
        transition-all duration-300
        active:scale-95
        border border-white/10
      "
    >
      <Phone size={13} strokeWidth={3} className="shrink-0" />
      <span>Call</span>
    </a>
  );
}