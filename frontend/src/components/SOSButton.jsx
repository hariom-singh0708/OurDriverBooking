import { triggerSOS } from "../services/sos.api";

export default function SOSButton({ rideId }) {
  const sos = async () => {
    await triggerSOS(rideId);
    alert("SOS sent!");
  };

  return (
    <button
      onClick={sos}
      className="bg-red-600 text-white px-4 py-1 rounded"
    >
      SOS
    </button>
  );
}
