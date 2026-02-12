import toast from "react-hot-toast";

export default function CancelModal({
  showCancel,
  setShowCancel,
  cancelReason,
  setCancelReason,
  confirmCancel,
  cancelLoading,
}) {
  if (!showCancel) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-end lg:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setShowCancel(false)}
      />

      <div className="relative w-full lg:max-w-md bg-white rounded-t-[2.5rem] lg:rounded-[2.5rem] p-6 lg:p-8 shadow-2xl border border-white/20 animate-in slide-in-from-bottom-full lg:zoom-in-95 duration-300">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black text-brand uppercase tracking-widest">
            Cancel Trip
          </p>
          <button
            onClick={() => setShowCancel(false)}
            className="text-xs font-black text-slate-400"
          >
            CLOSE
          </button>
        </div>

        <p className="mt-3 text-xs font-bold text-slate-500">
          Please select a reason to cancel.
        </p>

        <div className="mt-4 space-y-2">
          {[
            "Driver is taking too long",
            "Wrong pickup location",
            "Booked by mistake",
            "Found another ride",
            "Other",
          ].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setCancelReason(r)}
              className={`w-full text-left px-4 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition ${
                cancelReason === r
                  ? "border-brand bg-[#FFF1EC] text-[#2D1B18]"
                  : "border-slate-100 bg-slate-50 text-slate-500 hover:bg-[#FFF1EC]/60"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="mt-4 bg-red-50 border border-red-100 rounded-2xl p-3">
          <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-1">
            Important
          </p>
          <p className="text-[10px] font-bold text-red-600 leading-snug">
            If you cancel this trip, you will be charged 10% of your fare.
          </p>
        </div>

        <button
          type="button"
          disabled={cancelLoading}
          onClick={confirmCancel}
          className="mt-5 w-full bg-[#2D1B18] text-white py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-brand transition-all disabled:opacity-60 active:scale-95"
        >
          {cancelLoading ? "Cancelling..." : "Confirm Cancel"}
        </button>
      </div>
    </div>
  );
}
