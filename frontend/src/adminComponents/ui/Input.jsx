export default function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full px-3 py-2 rounded-lg border border-gray-300 bg-white outline-none focus:ring-2 focus:ring-black/20 ${className}`}
      {...props}
    />
  );
}
