import { triggerSOS } from "../services/sos.api";

export default function SOSButton({ rideId }) {
  const sos = async () => {
    await triggerSOS(rideId);
    alert("🚨 SOS sent!");
  };

  return (
    <button
      onClick={sos}
      className="
        inline-flex items-center gap-2
        bg-red-600 hover:bg-red-700
        text-white font-bold text-sm
        px-5 py-2 rounded-lg
        shadow-md shadow-red-900/40
        transition
      "
    >
      🚨 SOS
    </button>
  );
}
