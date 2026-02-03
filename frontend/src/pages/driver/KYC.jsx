import { useEffect, useState } from "react";
import { submitKYC, getKYCStatus } from "../../services/kyc.api";
import { useNavigate } from "react-router-dom";

export default function KYC() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [kyc, setKyc] = useState(null);
  const [previews, setPreviews] = useState({});

  useEffect(() => {
    getKYCStatus()
      .then((res) => setKyc(res.data.data))
      .catch(() => setKyc(null));
  }, []);

  useEffect(() => {
    return () => {
      Object.values(previews).forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [previews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    await submitKYC(formData);

    alert("KYC submitted successfully");
    navigate("/driver");
  };

  /* ================= VIEW MODE ================= */
  if (kyc && kyc.status !== "rejected") {
    return (
      <Page>
        <Card>
          <Header title="Driver KYC" subtitle="Verification Details" />
          <StatusBadge status={kyc.status} />

          <div className="grid gap-3 sm:grid-cols-2">
            <KYCField label="Aadhaar Number" value={mask(kyc.aadhaarNumber)} />
            <KYCField label="PAN Number" value={mask(kyc.panNumber)} />
            <KYCField label="License Number" value={kyc.licenseNumber} />
            <KYCField
              label="License Expiry"
              value={
                kyc.licenseExpiry
                  ? formatMonthYear(kyc.licenseExpiry)
                  : "—"
              }
            />
            <KYCField
              label="Criminal Offence"
              value={kyc.criminalOffence || "None"}
            />
            <KYCField label="Address" value={kyc.address} />
          </div>

          <Divider />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Doc label="Aadhaar" url={kyc.aadhaarImage} />
            <Doc label="PAN" url={kyc.panImage} />
            <Doc label="License" url={kyc.licenseImage} />
            <Doc label="Photo" url={kyc.driverPhoto} />
          </div>

          <PrimaryButton onClick={() => navigate("/driver")}>
            ← Back to Dashboard
          </PrimaryButton>
        </Card>
      </Page>
    );
  }

  /* ================= SUBMIT MODE ================= */
  return (
    <Page>
      <Card>
        <Header title="Submit Driver KYC" subtitle="Complete verification" />

        {kyc?.status === "rejected" && (
          <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl p-3">
            ❌ Your KYC was rejected. Please resubmit.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Aadhaar Number" name="aadhaarNumber" />
          <FileInput
            name="aadhaarImage"
            label="Upload Aadhaar"
            previews={previews}
            setPreviews={setPreviews}
          />

          <Input label="PAN Number" name="panNumber" />
          <FileInput
            name="panImage"
            label="Upload PAN"
            previews={previews}
            setPreviews={setPreviews}
          />

          <Input label="License Number" name="licenseNumber" />
          <FileInput
            name="licenseImage"
            label="Upload License"
            previews={previews}
            setPreviews={setPreviews}
          />

          {/* ✅ MONTH + YEAR ONLY */}
          <MonthInput
            label="License Expiry (MM / YYYY)"
            name="licenseExpiry"
          />

          <Textarea
            label="Criminal Offence"
            name="criminalOffence"
            placeholder="Write 'None' if not applicable"
          />

          <FileInput
            name="driverPhoto"
            label="Upload Driver Photo"
            previews={previews}
            setPreviews={setPreviews}
          />

          <Textarea label="Address" name="address" />

          {/* Sticky button on mobile */}
          <div className="sticky bottom-0 bg-gradient-to-t from-black/80 to-transparent pt-3">
            <PrimaryButton disabled={loading}>
              {loading ? "Submitting..." : "Submit KYC"}
            </PrimaryButton>
          </div>
        </form>
      </Card>
    </Page>
  );
}

/* ================= LAYOUT ================= */

function Page({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] to-black flex justify-center p-4 sm:p-6">
      {children}
    </div>
  );
}

function Card({ children }) {
  return (
    <div className="w-full max-w-xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-5 shadow-[0_0_40px_#0ea5e940]">
      {children}
    </div>
  );
}

function Header({ title, subtitle }) {
  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-white">{title}</h2>
      <p className="text-gray-400 text-xs sm:text-sm">{subtitle}</p>
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-white/10 my-2" />;
}

/* ================= UI ================= */

function StatusBadge({ status }) {
  const map = {
    approved: "bg-green-500/20 text-green-400 border-green-500/30",
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  };

  return (
    <div
      className={`w-fit px-4 py-1 rounded-full text-xs sm:text-sm border ${
        map[status] || "bg-white/10 text-white border-white/20"
      }`}
    >
      {status.toUpperCase()}
    </div>
  );
}

function KYCField({ label, value }) {
  return (
    <div className="bg-black/40 border border-white/10 rounded-xl p-3">
      <p className="text-[11px] text-gray-400">{label}</p>
      <p className="text-white font-semibold text-sm break-words">{value}</p>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div className="space-y-1">
      <label className="text-xs sm:text-sm text-gray-400">{label}</label>
      <input
        {...props}
        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
      />
    </div>
  );
}

function MonthInput({ label, ...props }) {
  return (
    <div className="space-y-1">
      <label className="text-xs sm:text-sm text-gray-400">{label}</label>
      <input
        type="month"
        {...props}
        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
      />
    </div>
  );
}

function Textarea({ label, ...props }) {
  return (
    <div className="space-y-1">
      <label className="text-xs sm:text-sm text-gray-400">{label}</label>
      <textarea
        rows={3}
        {...props}
        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
      />
    </div>
  );
}

/* ================= FILE UPLOAD + PREVIEW ================= */

function FileInput({ label, name, previews, setPreviews }) {
  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreviews((prev) => ({
      ...prev,
      [name]: { file, url, type: file.type },
    }));
  };

  return (
    <div className="space-y-2">
      <label className="block bg-black/40 border border-dashed border-white/20 rounded-xl p-4 text-center cursor-pointer hover:border-cyan-400 text-gray-400 transition text-sm">
        {label}
        <input type="file" name={name} hidden onChange={handleChange} />
      </label>

      {previews[name] && <PreviewCard preview={previews[name]} />}
    </div>
  );
}

function PreviewCard({ preview }) {
  const isImage = preview.type.startsWith("image/");

  return (
    <div className="bg-black/50 border border-white/10 rounded-xl p-3 flex items-center gap-3">
      {isImage ? (
        <img
          src={preview.url}
          alt="preview"
          className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg border border-white/10"
        />
      ) : (
        <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center bg-white/10 rounded-lg text-cyan-400 font-bold">
          PDF
        </div>
      )}

      <div className="flex-1">
        <p className="text-sm text-white truncate">{preview.file.name}</p>
        <p className="text-xs text-gray-400">
          {(preview.file.size / 1024).toFixed(1)} KB
        </p>
      </div>
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
      className="bg-black/40 border border-white/10 rounded-xl p-3 sm:p-4 text-center text-cyan-400 hover:bg-cyan-500/10 transition text-xs sm:text-sm"
    >
      {label}
    </a>
  );
}

function PrimaryButton({ children, ...props }) {
  return (
    <button
      {...props}
      className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-sm sm:text-base hover:opacity-90 transition disabled:opacity-50"
    >
      {children}
    </button>
  );
}

/* ================= HELPERS ================= */

function mask(val) {
  if (!val) return "—";
  return "****" + val.slice(-4);
}

function formatMonthYear(value) {
  const [year, month] = value.split("-");
  return `${month}/${year}`;
}
