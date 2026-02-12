// src/components/admin/AdminKYCModal.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { getDriverKYC, updateDriverKYC } from "../../services/admin.api";

/* ---------------- helpers ---------------- */
function formatDate(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function clampIndex(i, len) {
  if (!len) return 0;
  if (i < 0) return 0;
  if (i >= len) return len - 1;
  return i;
}

function getStatusLabel(s) {
  const x = String(s || "submitted").toLowerCase();
  if (x === "under_review") return "under_review";
  if (x === "approved") return "approved";
  if (x === "rejected") return "rejected";
  return "submitted";
}

function statusBadgeClass(status) {
  const s = String(status || "").toLowerCase();
  return s === "approved"
    ? "bg-green-100 text-green-700 border-green-200"
    : s === "rejected"
    ? "bg-red-100 text-red-700 border-red-200"
    : s === "under_review"
    ? "bg-blue-100 text-blue-700 border-blue-200"
    : "bg-yellow-100 text-yellow-700 border-yellow-200";
}

/* ---------------- Image Viewer (swipe + fullscreen) ---------------- */
function ImageViewer({ open, images, startIndex = 0, onClose }) {
  const [idx, setIdx] = useState(startIndex);
  const startX = useRef(null);

  useEffect(() => {
    if (!open) return;
    setIdx(clampIndex(startIndex, images.length));
  }, [open, startIndex, images.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "ArrowLeft") setIdx((v) => clampIndex(v - 1, images.length));
      if (e.key === "ArrowRight") setIdx((v) => clampIndex(v + 1, images.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, images.length, onClose]);

  if (!open) return null;

  const img = images[idx];

  const prev = () => setIdx((v) => clampIndex(v - 1, images.length));
  const next = () => setIdx((v) => clampIndex(v + 1, images.length));

  const onTouchStart = (e) => {
    startX.current = e.touches?.[0]?.clientX ?? null;
  };
  const onTouchEnd = (e) => {
    const endX = e.changedTouches?.[0]?.clientX ?? null;
    if (startX.current == null || endX == null) return;
    const diff = startX.current - endX;
    if (Math.abs(diff) < 45) return;
    if (diff > 0) next();
    else prev();
    startX.current = null;
  };

  return (
    <div className="fixed inset-0 z-[10000]">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-3">
        <div
          className="relative w-full max-w-4xl"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onClick={(e) => e.stopPropagation()}
        >
          {/* top bar */}
          <div className="absolute -top-14 left-0 right-0 flex items-center justify-between text-white">
            <div className="text-xs font-black uppercase tracking-widest opacity-80">
              {img?.label || "Document"} • {idx + 1}/{images.length}
            </div>
            <button
              onClick={onClose}
              className="h-10 w-10 rounded-xl grid place-items-center bg-white/10 hover:bg-white/20 border border-white/10"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* image */}
          <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
            {img?.src ? (
              <img
                src={img.src}
                alt={img.label}
                className="w-full max-h-[80vh] object-contain bg-black"
                draggable={false}
              />
            ) : (
              <div className="h-[60vh] grid place-items-center text-white/70">
                No image
              </div>
            )}
          </div>

          {/* controls */}
          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 h-11 w-11 rounded-2xl grid place-items-center bg-white/10 hover:bg-white/20 border border-white/10 text-white"
                aria-label="Previous"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-11 w-11 rounded-2xl grid place-items-center bg-white/10 hover:bg-white/20 border border-white/10 text-white"
                aria-label="Next"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Bottom Action Sheet (Approve/Reject) ---------------- */
function ActionSheet({
  open,
  onClose,
  loading,
  rejectMode,
  setRejectMode,
  rejectReason,
  setRejectReason,
  onUnderReview,
  onApprove,
  onReject,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-3xl bg-white rounded-t-[2.25rem] border border-stone-200 shadow-2xl p-4 sm:p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1 rounded-full bg-stone-200 mx-auto mb-3" />

        {!rejectMode ? (
          <div className="space-y-3">
            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-400 text-center">
              Actions
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={onUnderReview}
                disabled={loading}
                className="h-12 rounded-2xl bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 disabled:opacity-60"
              >
                Under Review
              </button>
              <button
                onClick={onApprove}
                disabled={loading}
                className="h-12 rounded-2xl bg-emerald-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-60"
              >
                Approve
              </button>
              <button
                onClick={() => setRejectMode(true)}
                className="h-12 rounded-2xl bg-red-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-red-700"
              >
                Reject
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full h-12 rounded-2xl border border-stone-200 text-[11px] font-black uppercase tracking-widest hover:bg-stone-50"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-400 text-center">
              Rejection Reason
            </div>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Enter rejection reason..."
              className="w-full rounded-2xl border border-stone-200 p-3 text-sm font-bold text-stone-800 outline-none focus:ring-2 focus:ring-stone-200 resize-none"
            />

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setRejectMode(false)}
                className="h-12 rounded-2xl border border-stone-200 text-[11px] font-black uppercase tracking-widest hover:bg-stone-50"
              >
                Back
              </button>
              <button
                onClick={onReject}
                disabled={loading}
                className="h-12 rounded-2xl bg-red-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-red-700 disabled:opacity-60"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Main Modal ---------------- */
export default function AdminKYCModal({ driverId, onClose, onUpdated }) {
  const [kyc, setKyc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [sheetOpen, setSheetOpen] = useState(false);
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  // ESC close
  useEffect(() => {
    if (!driverId) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [driverId, onClose]);

  // fetch kyc
  useEffect(() => {
    if (!driverId) return;

    (async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await getDriverKYC(driverId);
        const data = res?.data?.data ?? res?.data ?? null;
        setKyc(data);
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load KYC");
      } finally {
        setLoading(false);
      }
    })();
  }, [driverId]);

  const status = getStatusLabel(kyc?.status);
  const badgeClass = statusBadgeClass(status);

  // schema-based fields (your mongoose schema)
  const hasCriminalRecordText = useMemo(() => {
    const v = String(kyc?.hasCriminalRecord ?? "no").toLowerCase();
    if (v === "yes" || v === "true") return "Yes";
    if (v === "no" || v === "false") return "No";
    return v || "—";
  }, [kyc]);

  const criminalOffenceDetailsText = useMemo(() => {
    const s = String(kyc?.criminalOffenceDetails ?? "").trim();
    return s || "—";
  }, [kyc]);

  const images = useMemo(() => {
    const list = [
      { label: "Aadhaar", src: kyc?.aadhaarImage || "" },
      { label: "PAN", src: kyc?.panImage || "" },
      { label: "License", src: kyc?.licenseImage || "" },
      { label: "Driver Photo", src: kyc?.driverPhoto || "" },
    ].filter((x) => x.src);
    return list;
  }, [kyc]);

  const openViewerByLabel = (label) => {
    const idx = Math.max(
      0,
      images.findIndex((x) => x.label === label)
    );
    setViewerIndex(idx);
    setViewerOpen(true);
  };

  const approve = async () => {
    try {
      await updateDriverKYC(driverId, {
        status: "approved",
        reason: "KYC Approved by admin",
      });
      toast.success("KYC approved");
      onUpdated?.();
      onClose?.();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to approve KYC");
    }
  };

  const markUnderReview = async () => {
    try {
      await updateDriverKYC(driverId, {
        status: "under_review",
        reason: "KYC moved to under review",
      });
      toast.success("Moved to under review");
      onUpdated?.();
      onClose?.();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to update status");
    }
  };

  const reject = async () => {
    if (!rejectReason.trim()) return toast.error("Please enter rejection reason");
    try {
      await updateDriverKYC(driverId, {
        status: "rejected",
        reason: rejectReason, // backend maps
        rejectReason,
      });
      toast.success("KYC rejected");
      onUpdated?.();
      onClose?.();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to reject KYC");
    }
  };

  if (!driverId) return null;

  const stop = (e) => e.stopPropagation();

  return (
    <>
      {/* Main modal - DriverDetailsModal style */}
      <div
        className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center px-2 sm:px-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

        <div
          className="relative w-full max-w-3xl rounded-t-[2rem] sm:rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden"
          onClick={stop}
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-stone-100">
            <div className="min-w-0">
              <div className="text-sm font-black text-stone-900">Driver KYC Details</div>
              <div className="mt-1 flex items-center gap-2 flex-wrap">
                <span className={`inline-block px-2 py-1 text-[10px] font-extrabold rounded-full border ${badgeClass}`}>
                  {status}
                </span>
                <div className="text-xs text-stone-500 truncate max-w-[70vw] sm:max-w-none">
                  {kyc?.userId?.name || "Driver"} • {kyc?.userId?.mobile || "—"}
                </div>
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

          {/* Body (scrollable ALWAYS, so mobile shows everything) */}
          <div className="max-h-[72vh] sm:max-h-[70vh] overflow-y-auto px-4 sm:px-6 py-5">
            {loading && <div className="text-sm font-bold text-stone-600">Loading…</div>}

            {err && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm font-bold">
                {err}
              </div>
            )}

            {!loading && !err && kyc && (
              <div className="space-y-4">
                {/* Rejected note */}
                {status === "rejected" && (kyc?.rejectReason || kyc?.reason) && (
                  <div className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-xl">
                    <span className="font-black uppercase tracking-widest mr-2">Reject Reason</span>
                    {kyc?.rejectReason || kyc?.reason}
                  </div>
                )}

                {/* Info grid (DriverDetailsModal style) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <InfoBox label="Email">{kyc?.userId?.email || "—"}</InfoBox>
                  <InfoBox label="Mobile">{kyc?.userId?.mobile || "—"}</InfoBox>

                  <InfoBox label="Aadhaar Number">{kyc?.aadhaarNumber || "—"}</InfoBox>
                  <InfoBox label="PAN Number">{kyc?.panNumber || "—"}</InfoBox>

                  <InfoBox label="License Number">{kyc?.licenseNumber || "—"}</InfoBox>
                  <InfoBox label="License Expiry">{formatDate(kyc?.licenseExpiry)}</InfoBox>

                  <InfoBox label="Has Criminal Record">{hasCriminalRecordText}</InfoBox>
                  <InfoBox label="Criminal Offence Details">{criminalOffenceDetailsText}</InfoBox>

                  <div className="sm:col-span-2">
                    <InfoBox label="Address">{kyc?.address || "—"}</InfoBox>
                  </div>

                  <InfoBox label="Submitted At">{formatDate(kyc?.createdAt)}</InfoBox>
                  <InfoBox label="Last Updated">{formatDate(kyc?.updatedAt)}</InfoBox>
                </div>

                {/* Documents (tap -> fullscreen + swipe) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <DocTile
                    label="Aadhaar"
                    src={kyc?.aadhaarImage}
                    onOpen={() => openViewerByLabel("Aadhaar")}
                  />
                  <DocTile
                    label="PAN"
                    src={kyc?.panImage}
                    onOpen={() => openViewerByLabel("PAN")}
                  />
                  <DocTile
                    label="License"
                    src={kyc?.licenseImage}
                    onOpen={() => openViewerByLabel("License")}
                  />
                  <DocTile
                    label="Driver Photo"
                    src={kyc?.driverPhoto}
                    onOpen={() => openViewerByLabel("Driver Photo")}
                  />
                </div>

                {/* little spacer so last content doesn't hide behind action bar */}
                <div className="h-2" />
              </div>
            )}
          </div>

          {/* Bottom bar (DriverDetailsModal footer vibe) */}
          <div className="border-t border-stone-100 px-4 sm:px-6 py-4 flex items-center justify-between gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-200 text-sm font-bold hover:bg-stone-50"
            >
              Close
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setRejectMode(false);
                  setRejectReason("");
                  setSheetOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-stone-900 text-white text-sm font-extrabold hover:bg-stone-800"
              >
                Actions
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action bottom sheet */}
      <ActionSheet
        open={sheetOpen}
        onClose={() => {
          setSheetOpen(false);
          setRejectMode(false);
          setRejectReason("");
        }}
        loading={loading}
        rejectMode={rejectMode}
        setRejectMode={setRejectMode}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        onUnderReview={markUnderReview}
        onApprove={approve}
        onReject={reject}
      />

      {/* Fullscreen viewer with swipe */}
      <ImageViewer
        open={viewerOpen}
        images={images}
        startIndex={viewerIndex}
        onClose={() => setViewerOpen(false)}
      />
    </>
  );
}

/* ---------------- UI blocks ---------------- */

function InfoBox({ label, children }) {
  return (
    <div className="bg-stone-50 rounded-xl px-3 py-2 border border-stone-100">
      <div className="text-[9px] font-black uppercase tracking-widest text-stone-400">
        {label}
      </div>
      <div className="text-xs font-bold text-stone-800 break-words break-all">
        {children}
      </div>
    </div>
  );
}

function DocTile({ label, src, onOpen }) {
  if (!src) {
    return (
      <div className="bg-stone-50 rounded-xl px-3 py-4 border border-stone-100">
        <div className="text-[9px] font-black uppercase tracking-widest text-stone-400">
          {label}
        </div>
        <div className="mt-1 text-xs font-bold text-stone-500">Not uploaded</div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      className="text-left bg-white rounded-xl border border-stone-100 overflow-hidden hover:shadow-md transition active:scale-[0.99]"
      title={`Open ${label}`}
    >
      <img src={src} alt={label} className="w-full h-40 sm:h-36 object-cover" />
      <div className="px-3 py-2 border-t border-stone-100 bg-stone-50">
        <div className="text-[9px] font-black uppercase tracking-widest text-stone-400 text-center">
          {label} • Tap to view
        </div>
      </div>
    </button>
  );
}
