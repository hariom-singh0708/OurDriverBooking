import { X } from "lucide-react";
import { useEffect } from "react";

export default function DriverDetailsModal({
  open,
  onClose,
  d,
  emergency,
  bank,
  formatDate,
  maskAccount,
}) {
  // ESC close
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const stop = (e) => e.stopPropagation();

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-stone-200"
        onClick={stop}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <div>
            <div className="text-sm font-black text-stone-900">
              Driver Additional Details
            </div>
            <div className="text-xs text-stone-500">
              {d?.name || d?.fullName || "—"} • {d?.phone || d?.mobile || "—"}
            </div>
          </div>

          <button
            onClick={onClose}
            className="h-9 w-9 rounded-xl grid place-items-center hover:bg-stone-50 border border-stone-200"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <InfoBox label="Gender / DOB">
              {(d?.gender || "—")} • {formatDate?.(d?.dob)}
            </InfoBox>

            <InfoBox label="Alternate Mobile">
              {d?.alternateMobile || "—"}
            </InfoBox>

            <InfoBox label="Emergency Contact">
              {emergency?.name || "—"}{" "}
              <span className="text-stone-400">•</span>{" "}
              {emergency?.phone || "—"}
            </InfoBox>

            <InfoBox label="Language">
              {d?.preferredLanguage || "—"}
            </InfoBox>

            <InfoBox label="Exp / Vehicle">
              {Number.isFinite(d?.drivingExperienceYears)
                ? `${d?.drivingExperienceYears} yrs`
                : "—"}{" "}
              • {d?.vehicleType || "—"}
            </InfoBox>

            <InfoBox label="License">
              {d?.licenseNumber || "—"}{" "}
              <span className="text-stone-400">•</span>{" "}
              {formatDate?.(d?.licenseExpiry)}
            </InfoBox>

            <div className="sm:col-span-2">
              <InfoBox label="Driver Notes">{d?.driverNotes || "—"}</InfoBox>
            </div>

            <div className="sm:col-span-2">
              <InfoBox label="Bank Details">
                {bank?.bankName || "—"}{" "}
                <span className="text-stone-400">•</span>{" "}
                A/C {maskAccount?.(bank?.accountNumber)}{" "}
                <span className="text-stone-400">•</span>{" "}
                IFSC {bank?.ifscCode || "—"}{" "}
                <span className="text-stone-400">•</span>{" "}
                {bank?.isVerifiedByAdmin ? (
                  <span className="text-green-600 font-extrabold">Verified</span>
                ) : (
                  <span className="text-red-600 font-extrabold">Unverified</span>
                )}
              </InfoBox>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-stone-200 text-sm font-bold hover:bg-stone-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoBox({ label, children }) {
  return (
    <div className="bg-stone-50 rounded-xl px-3 py-2 border border-stone-100">
      <div className="text-[9px] font-black uppercase tracking-widest text-stone-400">
        {label}
      </div>
      <div className="text-xs font-bold text-stone-800">{children}</div>
    </div>
  );
}
