export default function CallButton({ phone }) {
  return (
    <a
      href={`tel:${phone}`}
      className="
        inline-flex items-center gap-2
        bg-green-600 hover:bg-green-700
        text-white text-sm font-semibold
        px-4 py-2 rounded-lg
        shadow-md shadow-green-900/40
        transition
      "
    >
      📞 Call
    </a>
  );
}
