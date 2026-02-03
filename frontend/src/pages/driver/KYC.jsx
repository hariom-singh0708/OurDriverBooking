import { useEffect, useState } from "react";
import { submitKYC, getKYCStatus } from "../../services/kyc.api";
import { useNavigate } from "react-router-dom";

export default function KYC() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [kyc, setKyc] = useState(null);

  useEffect(() => {
    getKYCStatus()
      .then((res) => setKyc(res.data.data))
      .catch(() => setKyc(null));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    await submitKYC(formData);

    alert("KYC submitted");
    navigate("/driver");
  };

  /* ================== VIEW MODE ================== */
  if (kyc && kyc.status !== "rejected") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#020617] p-6">
        <div className="max-w-xl mx-auto bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-white">
            Driver KYC Details
          </h2>

          <KYCField label="KYC Status" value={kyc.status.toUpperCase()} />
          <KYCField label="Aadhaar Number" value={mask(kyc.aadhaarNumber)} />
          <KYCField label="PAN Number" value={mask(kyc.panNumber)} />
          <KYCField label="License Number" value={kyc.licenseNumber} />

          {/* ✅ NEW */}
          <KYCField
            label="License Expiry Date"
            value={kyc.licenseExpiry?.slice(0, 10) || "—"}
          />
          <KYCField
            label="Criminal Offence"
            value={kyc.criminalOffence || "None"}
          />

          <KYCField label="Address" value={kyc.address} />

          <div className="grid grid-cols-2 gap-3">
            <Doc label="Aadhaar" url={kyc.aadhaarImage} />
            <Doc label="PAN" url={kyc.panImage} />
            <Doc label="License" url={kyc.licenseImage} />
            <Doc label="Photo" url={kyc.driverPhoto} />
          </div>

          <button
            onClick={() => navigate("/driver")}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 py-3 text-white font-bold"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  /* ================== SUBMIT MODE ================== */
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#020617] p-6">
      <div className="max-w-xl mx-auto bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-bold text-white">Submit Driver KYC</h2>

        {kyc?.status === "rejected" && (
          <p className="text-red-400 text-sm">
            Your KYC was rejected. Please resubmit.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="aadhaarNumber"
            placeholder="Aadhaar Number"
            className="input"
          />
          <input type="file" name="aadhaarImage" />

          <input
            name="panNumber"
            placeholder="PAN Number"
            className="input"
          />
          <input type="file" name="panImage" />

          <input
            name="licenseNumber"
            placeholder="License Number"
            className="input"
          />
          <input type="file" name="licenseImage" />

          {/* ✅ NEW */}
          <input
            type="date"
            name="licenseExpiry"
            className="input"
            placeholder="License Expiry Date"
          />

          {/* ✅ NEW */}
          <textarea
            name="criminalOffence"
            placeholder="Criminal offence (if any). Write 'None' if not applicable"
            className="input"
          />

          <input type="file" name="driverPhoto" />

          <textarea
            name="address"
            placeholder="Address"
            className="input"
          />

          <button className="w-full bg-gradient-to-r from-indigo-600 to-cyan-500 py-3 text-white font-bold rounded-xl">
            {loading ? "Submitting..." : "Submit KYC"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ================= HELPERS ================= */

function KYCField({ label, value }) {
  return (
    <div className="bg-[#020617] border border-white/10 rounded-xl p-3">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-white font-semibold">{value}</p>
    </div>
  );
}

function Doc({ label, url }) {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="bg-[#020617] border border-white/10 rounded-xl p-3 text-center text-cyan-400 hover:bg-white/5"
    >
      {label}
    </a>
  );
}

function mask(val) {
  if (!val) return "—";
  return "****" + val.slice(-4);
}
