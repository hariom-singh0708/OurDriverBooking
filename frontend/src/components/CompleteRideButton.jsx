export default function CompleteRideButton({
  disabled,
  onComplete,
}) {
  const handleClick = () => {
    if (disabled) return;
    onComplete(); // ✅ sirf parent ko notify
  };

  return (
    <button
      disabled={disabled}
      onClick={handleClick}
      className={`px-4 py-2 rounded text-white ${
        disabled
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700"
      }`}
    >
      Complete Ride
    </button>
  );
}
