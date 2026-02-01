export default function Button({ className = "", children, ...props }) {
  return (
    <button
      className={`px-4 py-2 rounded-lg font-semibold bg-black text-white hover:bg-black/90 disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
