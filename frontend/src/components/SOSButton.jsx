import { useState } from "react";
import { triggerSOS } from "../services/sos.api";
import { toast } from "react-hot-toast";

export default function SOSButton({ rideId }) {
  const [loading, setLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleInitialClick = () => {
    setIsConfirming(true);
    // Automatically reset confirmation state after 3 seconds if not clicked again
    setTimeout(() => setIsConfirming(false), 3000);
    toast("Tap again to confirm SOS", {
      icon: "⚠️",
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
  };

  const executeSOS = async () => {
    setLoading(true);
    const toastId = toast.loading("Transmitting SOS Signal...");
    
    try {
      await triggerSOS(rideId);
      toast.success("Emergency Alerts Sent", {
        id: toastId,
        style: { borderRadius: "15px", fontSize: "12px", fontWeight: "bold" },
      });
      setIsConfirming(false);
    } catch (error) {
      toast.error("Signal Failed. Try again.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={isConfirming ? executeSOS : handleInitialClick}
      disabled={loading}
      className={`
        relative overflow-hidden
        inline-flex items-center justify-center gap-2.5
        ${isConfirming ? "bg-red-600 scale-105" : "bg-[#2D1B18]"}
        text-white font-black text-[10px] uppercase tracking-[0.2em]
        px-6 py-3.5 rounded-2xl
        shadow-xl transition-all duration-300 active:scale-95
        border border-white/10 flex-1
      `}
    >
      {/* Visual Indicator for Confirmation State */}
      <span className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isConfirming ? "bg-white" : "bg-red-500"}`}></span>
        <span className={`relative inline-flex rounded-full h-2 w-2 ${isConfirming ? "bg-white" : "bg-red-500"}`}></span>
      </span>

      <span className="relative">
        {loading ? "Transmitting..." : isConfirming ? "Confirm SOS" : "Emergency"}
      </span>
    </button>
  );
}