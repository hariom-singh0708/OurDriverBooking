import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminKYCModal({ driverId, onClose, onUpdated }) {
  const [kyc, setKyc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const auth = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  useEffect(() => {
    if (!driverId) return;

    (async () => {
      try {
        setLoading(true);
        setErr("");

        const res = await axios.get(
          `http://localhost:5000/admin/drivers/${driverId}/kyc`,
          auth()
        );

        setKyc(res?.data?.data || null);
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load KYC");
      } finally {
        setLoading(false);
      }
    })();
  }, [driverId]);

  const approve = async () => {
    try {
      await axios.patch(
        `http://localhost:5000/admin/drivers/${driverId}/kyc`,
        {
          status: "approved",
          reason: "KYC Approved by admin",
        },
        auth()
      );

      onUpdated?.();
      onClose?.();
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to approve KYC");
    }
  };

  const reject = async () => {
    if (!rejectReason.trim()) {
      return alert("Please enter rejection reason");
    }

    try {
      await axios.patch(
        `http://localhost:5000/admin/drivers/${driverId}/kyc`,
        {
          status: "rejected",
          reason: rejectReason,
        },
        auth()
      );

      onUpdated?.();
      onClose?.();
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to reject KYC");
    }
  };

  const Badge = ({ s }) => {
    const x = String(s || "");
    const cls =
      x === "approved"
        ? "bg-green-100 text-green-700 border-green-200"
        : x === "rejected"
        ? "bg-red-100 text-red-700 border-red-200"
        : "bg-yellow-100 text-yellow-700 border-yellow-200";

    return (
      <span
        className={`inline-block px-2 py-1 text-[10px] sm:text-xs font-bold rounded-full border ${cls}`}
      >
        {x || "submitted"}
      </span>
    );
  };

  const Img = ({ label, src }) => {
    if (!src) {
      return (
        <div className="border rounded-lg p-2 text-[10px] sm:text-xs text-gray-500 flex items-center justify-center h-24">
          {label} not uploaded
        </div>
      );
    }

    return (
      <a href={src} target="_blank" rel="noreferrer" className="block">
        <img
          src={src}
          alt={label}
          className="w-full h-24 object-cover rounded-lg border"
        />
        <div className="mt-1 text-[10px] sm:text-[11px] text-gray-600 text-center">
          {label}
        </div>
      </a>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-[95%] sm:max-w-2xl md:max-w-3xl shadow-xl overflow-hidden flex flex-col max-h-[95vh]">

        {/* HEADER */}
        <div className="p-3 sm:p-4 border-b flex flex-col sm:flex-row sm:items-start justify-between gap-2">
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg md:text-xl font-extrabold break-words">
              KYC of {kyc?.userId?.name || "Driver"}
            </h2>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] sm:text-xs text-gray-500">
                Status:
              </span>
              <Badge s={kyc?.status} />
            </div>

            {kyc?.status === "rejected" && kyc?.rejectReason && (
              <div className="mt-1 text-[10px] sm:text-xs text-red-700 bg-red-50 border border-red-200 p-2 rounded-lg break-words">
                <strong>Reject Reason:</strong> {kyc.rejectReason}
              </div>
            )}

            {kyc?.userId && (
              <div className="text-[10px] sm:text-xs text-gray-600">
                <div className="break-all">
                  Email: {kyc.userId.email}
                </div>
                <div>Mobile: {kyc.userId.mobile}</div>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg border text-xs sm:text-sm font-semibold w-fit self-end sm:self-start"
          >
            Close
          </button>
        </div>

        {/* BODY */}
        <div className="p-3 sm:p-4 overflow-auto flex-1">
          {loading && (
            <div className="text-xs sm:text-sm text-gray-600">
              Loading...
            </div>
          )}

          {err && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-2 sm:p-3 rounded-xl text-xs sm:text-sm break-words">
              {err}
            </div>
          )}

          {!loading && !err && kyc && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                <Info label="Aadhaar Number" value={kyc.aadhaarNumber} />
                <Info label="PAN Number" value={kyc.panNumber} />
                <Info label="License Number" value={kyc.licenseNumber} />
                <Info label="Address" value={kyc.address} />
              </div>

              <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                <Img label="Aadhaar" src={kyc.aadhaarImage} />
                <Img label="PAN" src={kyc.panImage} />
                <Img label="License" src={kyc.licenseImage} />
              </div>

              {rejectMode && (
                <div className="mt-3 sm:mt-4">
                  <textarea
                    placeholder="Enter rejection reason..."
                    className="w-full border rounded-xl p-2 sm:p-3 text-xs sm:text-sm"
                    rows={3}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-3 sm:p-4 border-t flex flex-col sm:flex-row gap-2 sm:justify-end">
          {!rejectMode ? (
            <>
              <button
                onClick={approve}
                className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-xl font-semibold hover:bg-green-700 text-xs sm:text-sm w-full sm:w-auto"
                disabled={loading}
              >
                Approve
              </button>

              <button
                onClick={() => setRejectMode(true)}
                className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded-xl font-semibold hover:bg-red-700 text-xs sm:text-sm w-full sm:w-auto"
              >
                Reject
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setRejectMode(false)}
                className="border px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm w-full sm:w-auto"
              >
                Cancel
              </button>

              <button
                onClick={reject}
                className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm w-full sm:w-auto"
              >
                Confirm Reject
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="border rounded-xl p-2 sm:p-3 break-words">
      <p className="text-[10px] sm:text-xs text-gray-500">{label}</p>
      <p className="font-semibold text-xs sm:text-sm break-all">
        {value || "—"}
      </p>
    </div>
  );
}
