// src/components/CompleteRideButton.jsx
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function CompleteRideButton({ disabled, onComplete }) {
  const navigate=useNavigate();
  const handleClick = () => {
    if (disabled) {
      toast.error("Payment is required to complete the ride", {
        icon: "💳",
        style: {
          borderRadius: "15px",
          background: "#2D1B18",
          color: "#fff",
          fontSize: "10px",
          fontWeight: "bold",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        },
      });
      return;
    }
    
    // Successful notification
    toast.success("Journey Finalized", {
      style: {
        borderRadius: "15px",
        fontSize: "12px",
        fontWeight: "bold",
      },
    });
    onComplete(); 
    navigate('/driver')
  };

  const newLocal = "";
  return (
    <button
      disabled={false} // We handle disabled state via logic for better UX (showing toast)
      onClick={handleClick}
      className={`
        relative overflow-hidden 
        inline-flex items-center justify-center gap-3
        py-3.5 px-6 rounded-2xl
        font-black text-[10px] uppercase tracking-[0.2em]
        transition-all duration-300 active:scale-95
        shadow-xl w-[70%]
        ${
          disabled
            ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
            : "bg-green-600 text-white shadow-green-500/20 hover:bg-green-700 hover:-translate-y-0.5"
        }
      `}
    >
      {/* Icon based on state */}
      <span className="text-sm">{disabled ? "🔒" : "👍"}</span>

      <span className="relative ">
        {disabled ? "Pending Payment" : "Complete Ride"}
      </span>

      {/* Subtle shine effect on active button */}
      {!disabled && (
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
      )}
    </button>
  );
}