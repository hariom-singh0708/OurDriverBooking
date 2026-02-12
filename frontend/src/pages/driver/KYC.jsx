import { useEffect, useState } from "react";
import { submitKYC, getKYCStatus } from "../../services/kyc.api";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  UploadCloud,
  FileText,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Fingerprint,
  Eye,
  FileBadge,
  MapPinned,
  ChevronRight,
  AlertOctagon,
  Scale,
  Edit3,
  Save,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

export default function KYC() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [kyc, setKyc] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previews, setPreviews] = useState({});
  const [activeStep, setActiveStep] = useState(1);

  const [formDataState, setFormDataState] = useState({
    aadhaarNumber: "",
    panNumber: "",
    licenseNumber: "",
    licenseExpiry: "",
    address: "",
    hasCriminalRecord: "no",
    criminalOffenceDetails: "",
  });

  const [files, setFiles] = useState({
    aadhaarImage: null,
    panImage: null,
    licenseImage: null,
    driverPhoto: null,
  });

  /* ================= FETCH KYC ================= */
  useEffect(() => {
    fetchKYCStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchKYCStatus = async () => {
    try {
      const res = await getKYCStatus();
      const data = res?.data?.data || null;

      if (data) {
        setKyc(data);
        setFormDataState({
          aadhaarNumber: data.aadhaarNumber || "",
          panNumber: data.panNumber || "",
          licenseNumber: data.licenseNumber || "",
          licenseExpiry: data.licenseExpiry || "",
          address: data.address || "",
          hasCriminalRecord: data.hasCriminalRecord || "no",
          criminalOffenceDetails: data.criminalOffenceDetails || "",
        });
      } else {
        setKyc(null);
      }
    } catch {
      setKyc(null);
    }
  };

  /* ================= CLEANUP PREVIEW URLs ================= */
  useEffect(() => {
    return () => {
      // revoke all object URLs on unmount
      Object.values(previews || {}).forEach((p) => {
        if (p?.url?.startsWith("blob:")) URL.revokeObjectURL(p.url);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ================= RESET FILES/PREVIEWS WHEN CANCEL EDIT ================= */
  useEffect(() => {
    if (!isEditing) {
      // revoke and clear previews when leaving edit mode
      Object.values(previews || {}).forEach((p) => {
        if (p?.url?.startsWith("blob:")) URL.revokeObjectURL(p.url);
      });
      setPreviews({});
      setFiles({
        aadhaarImage: null,
        panImage: null,
        licenseImage: null,
        driverPhoto: null,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormDataState((prev) => {
      // when criminal record toggles to "no", clear details
      if (name === "hasCriminalRecord") {
        return {
          ...prev,
          hasCriminalRecord: value,
          criminalOffenceDetails: value === "no" ? "" : prev.criminalOffenceDetails,
        };
      }

      if (name === "criminalOffenceDetails") {
        return { ...prev, criminalOffenceDetails: value };
      }

      return { ...prev, [name]: value };
    });
  };

  const handleFinalSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    if (!kyc && activeStep !== 3) {
  setLoading(false);
  return;
}
  const cleanedAadhaar = (formDataState.aadhaarNumber || "").replace(/\D/g, "");
  const cleanedPan = (formDataState.panNumber || "").toUpperCase().trim();
  const cleanedLicense = (formDataState.licenseNumber || "").trim();
  const cleanedAddress = (formDataState.address || "").trim();

  if (!cleanedAadhaar || !cleanedPan || !cleanedLicense ) {
    toast.error("Please fill Aadhaar, PAN or License ");
    setLoading(false);          
    return;
  }

  if (!/^\d{12}$/.test(cleanedAadhaar)) {
    toast.error("Aadhaar must be 12 digits");
    setLoading(false);           return;
  }

  if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanedPan)) {
    toast.error("Invalid PAN format (ABCDE1234F)");
    setLoading(false);           return;
  }


    const finalData = new FormData();
    finalData.append("aadhaarNumber", cleanedAadhaar);
    finalData.append("panNumber", cleanedPan);
    finalData.append("licenseNumber", cleanedLicense);
    finalData.append("licenseExpiry", formDataState.licenseExpiry);
    finalData.append("address", cleanedAddress);
    finalData.append("hasCriminalRecord", formDataState.hasCriminalRecord);
    finalData.append("criminalOffenceDetails", formDataState.criminalOffenceDetails);

    Object.keys(files).forEach((key) => {
      if (files[key]) finalData.append(key, files[key]);
    });
    try {
      const response = await submitKYC(finalData);

      if (response?.data) {
        toast.success("KYC details saved successfully");
        setIsEditing(false);

        // keep local UI in sync immediately
        setKyc((prev) => ({ ...(prev || {}), ...(formDataState || {}) }));

        // refresh from server (also gets latest status & URLs)
        await fetchKYCStatus();

        // if user was in wizard mode, bring back to step 1
        setActiveStep(1);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch (err) {
      toast.error("Failed to save KYC details");
    } finally {
      setLoading(false);
    }
  };

  /* ================= VIEW & EDIT MODE ================= */
  if (kyc) {
    return (
      <div className="h-[calc(100vh-64px)] w-full bg-[#FDFCFB] flex items-center justify-center overflow-hidden">
        <div className="max-w-6xl w-full bg-white md:rounded-3xl shadow-2xl border border-[#F4E9E2] overflow-hidden flex flex-col md:flex-row h-full md:h-[580px] animate-in fade-in duration-500">
          {/* Sidebar */}
          <div className="w-full md:w-1/4 bg-[#2D2421] p-6 md:p-8 text-white flex flex-row md:flex-col justify-between shrink-0 items-center md:items-stretch">
            <div className="space-y-2 md:space-y-6">
              <StatusBadge status={kyc.status} />
              <h1 className="hidden md:block text-3xl font-serif italic leading-tight">
                {isEditing ? "Update KYC" : "KYC Details"}
              </h1>
            </div>

            <div className="flex flex-row md:flex-col gap-3">
              <button
                type="button"
                onClick={async () => {
                  if (isEditing) {
                    // cancel edit -> restore latest server values
                    await fetchKYCStatus();
                  }
                  setIsEditing((v) => !v);
                }}
                className={`px-4 md:px-0 py-2 md:py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                  isEditing
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "bg-[#BC6641] text-white"
                }`}
              >
                {isEditing ? <XCircle size={14} /> : <Edit3 size={14} />}
                <span className="hidden md:inline">{isEditing ? "Cancel" : "Edit"}</span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/driver")}
                className="px-4 md:px-0 py-2 md:py-3 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
              >
                <ArrowLeft size={14} className="md:hidden" />
                <span className="hidden md:inline">Dashboard</span>
              </button>
            </div>
          </div>

          {/* Details Area */}
          <div className="flex-1 p-6 md:p-10 bg-[#FAF8F6]/30 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-x-8 md:gap-y-6">
              <EditableField
                isEditing={isEditing}
                label="Aadhaar Number"
                name="aadhaarNumber"
                value={formDataState.aadhaarNumber}
                onChange={handleInputChange}
                icon={<Fingerprint size={18} />}
                masked={!isEditing}
              />

              <EditableField
                isEditing={isEditing}
                label="PAN Number"
                name="panNumber"
                value={formDataState.panNumber}
                onChange={handleInputChange}
                icon={<FileBadge size={18} />}
                masked={!isEditing}
              />

              <EditableField
                isEditing={isEditing}
                label="License ID"
                name="licenseNumber"
                value={formDataState.licenseNumber}
                onChange={handleInputChange}
                icon={<ShieldCheck size={18} />}
              />

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-[#BC6641]">
                  License Expiry
                </label>
                {isEditing ? (
                  <input
                    type="month"
                    name="licenseExpiry"
                    value={formDataState.licenseExpiry}
                    onChange={handleInputChange}
                    className="w-full h-11 rounded-lg border border-[#F4E9E2] px-4 text-xs font-bold focus:border-[#BC6641] outline-none bg-white"
                  />
                ) : (
                  <p className="text-sm font-bold text-[#2D2421] h-11 flex items-center">
                    {formDataState.licenseExpiry
                      ? formatMonthYear(formDataState.licenseExpiry)
                      : "—"}
                  </p>
                )}
              </div>

              <div className="col-span-1 md:col-span-2 border-t border-[#F4E9E2] pt-4">
                <label className="text-[9px] font-black uppercase tracking-widest text-[#BC6641] flex items-center gap-2 mb-2">
                  <AlertOctagon size={14} /> Legal Disclosure
                </label>

                {isEditing ? (
                  <div className="space-y-3">
                    <div className="flex gap-6">
                      {["no", "yes"].map((opt) => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="hasCriminalRecord"
                            value={opt}
                            checked={formDataState.hasCriminalRecord === opt}
                            onChange={handleInputChange}
                            className="accent-[#BC6641]"
                          />
                          <span className="text-[10px] font-black uppercase text-[#2D2421]">
                            {opt}
                          </span>
                        </label>
                      ))}
                    </div>

                    {formDataState.hasCriminalRecord === "yes" && (
                      <textarea
                        name="criminalOffenceDetails"
                        value={formDataState.criminalOffenceDetails}
                        onChange={handleInputChange}
                        placeholder="Details..."
                        className="w-full rounded-xl bg-white border border-[#F4E9E2] p-4 text-xs font-bold h-24 outline-none focus:border-[#BC6641] resize-none"
                      />
                    )}
                  </div>
                ) : (
                  <div className="bg-[#FAF8F6] p-4 rounded-xl border border-[#F4E9E2]">
                    <p className="text-xs font-bold text-[#2D2421] leading-relaxed">
                      {formDataState.hasCriminalRecord === "yes"
                        ? formDataState.criminalOffenceDetails
                        : "No existing criminal records declared."}
                    </p>
                  </div>
                )}
              </div>

              <div className="col-span-1 md:col-span-2 space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-[#BC6641]">
                  Current Address
                </label>
                {isEditing ? (
                  <textarea
                    name="address"
                    value={formDataState.address}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-[#F4E9E2] p-3 text-xs font-bold h-20 outline-none focus:border-[#BC6641] resize-none bg-white"
                  />
                ) : (
                  <p className="text-sm font-bold text-[#2D2421]">{formDataState.address || "—"}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap md:flex-nowrap gap-3 mt-6 pt-6 border-t border-[#F4E9E2]">
              {isEditing ? (
                <div className="grid grid-cols-2 w-full gap-3">
                  <Dropzone name="aadhaarImage" label="Aadhaar" setPreviews={setPreviews} setFiles={setFiles} previews={previews} />
                  <Dropzone name="panImage" label="PAN" setPreviews={setPreviews} setFiles={setFiles} previews={previews} />
                  <Dropzone name="licenseImage" label="License" setPreviews={setPreviews} setFiles={setFiles} previews={previews} />
                  <Dropzone name="driverPhoto" label="Portrait" setPreviews={setPreviews} setFiles={setFiles} previews={previews} />
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 w-full gap-3">
                  <Attachment url={kyc?.aadhaarImage} label="Aadhaar" />
                  <Attachment url={kyc?.panImage} label="PAN" />
                  <Attachment url={kyc?.licenseImage} label="License" />
                  <Attachment url={kyc?.driverPhoto} label="Selfie" />
                </div>
              )}
            </div>

            {isEditing && (
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={loading}
                className="w-full mt-8 py-4 bg-[#2D2421] text-white rounded-xl text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-[#BC6641] disabled:opacity-60 transition-all"
              >
                {loading ? "Saving..." : (
                  <>
                    <Save size={18} /> Save Changes
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ================= SUBMIT WIZARD MODE ================= */
  return (
    <div className="h-[calc(100vh-64px)] w-full bg-[#FDFCFB] flex items-center justify-center overflow-hidden">
      <div className="max-w-5xl w-full bg-white md:rounded-3xl shadow-2xl border border-[#F4E9E2] overflow-hidden flex flex-col md:flex-row h-full md:h-[580px]">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-[#FAF8F6] p-6 md:p-8 border-b md:border-b-0 md:border-r border-[#F4E9E2] flex flex-row md:flex-col justify-between shrink-0 items-center md:items-stretch">
          <div className="space-y-1 md:space-y-8">
            <h2 className="text-xl font-serif italic text-[#2D2421]">KYC Portal</h2>
            <nav className="hidden md:flex flex-col space-y-4">
              <StepIndicator num={1} label="Identity" active={activeStep === 1} done={activeStep > 1} onClick={() => setActiveStep(1)} />
              <StepIndicator num={2} label="License" active={activeStep === 2} done={activeStep > 2} onClick={() => setActiveStep(2)} />
              <StepIndicator num={3} label="Compliance" active={activeStep === 3} done={activeStep > 3} onClick={() => setActiveStep(3)} />
            </nav>
          </div>
          <div className="flex items-center gap-2 text-[#BC6641] opacity-60">
            <Scale size={14} />
            <span className="text-[8px] font-black uppercase tracking-widest">Step {activeStep}/3</span>
          </div>
        </div>

        <form onSubmit={handleFinalSubmit} className="flex-1 flex flex-col h-full bg-white relative">
          <div className="p-6 md:p-10 flex-1 overflow-y-auto">
            {activeStep === 1 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <FormHeader title="Identity Scan" subtitle="Submit government credentials" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <MiniInput label="Aadhaar Number" name="aadhaarNumber" value={formDataState.aadhaarNumber} onChange={handleInputChange} icon={<Fingerprint size={18} />} />
                  <MiniInput label="PAN Number" name="panNumber" value={formDataState.panNumber} onChange={handleInputChange} icon={<FileText size={18} />} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Dropzone name="aadhaarImage" label="Scan Aadhaar" setPreviews={setPreviews} setFiles={setFiles} previews={previews} />
                  <Dropzone name="panImage" label="Scan PAN" setPreviews={setPreviews} setFiles={setFiles} previews={previews} />
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <FormHeader title="License Data" subtitle="Verify operator qualifications" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <MiniInput label="License ID" name="licenseNumber" value={formDataState.licenseNumber} onChange={handleInputChange} icon={<ShieldCheck size={18} />} />
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-[#BC6641]">Expiry Date</label>
                    <input
                      type="month"
                      name="licenseExpiry"
                      value={formDataState.licenseExpiry}
                      onChange={handleInputChange}
                      className="w-full h-11 rounded-lg bg-[#FAF8F6] border border-[#F4E9E2] px-4 text-xs font-bold focus:border-[#BC6641] outline-none"
                    />
                  </div>
                </div>
                <Dropzone name="licenseImage" label="Upload Driver License" setPreviews={setPreviews} setFiles={setFiles} previews={previews} />
              </div>
            )}

            {activeStep === 3 && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <FormHeader title="Final Disclosure" subtitle="Legal declaration and portrait" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Dropzone name="driverPhoto" label="Chauffeur Portrait" setPreviews={setPreviews} setFiles={setFiles} previews={previews} />
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-[#BC6641] flex items-center gap-2">
                      <AlertOctagon size={12} /> Legal Disclosure
                    </label>
                    <div className="bg-[#FAF8F6] border border-[#F4E9E2] rounded-xl p-3">
                      <div className="flex gap-4">
                        {["no", "yes"].map((opt) => (
                          <label key={opt} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="hasCriminalRecord"
                              value={opt}
                              className="accent-[#BC6641]"
                              checked={formDataState.hasCriminalRecord === opt}
                              onChange={handleInputChange}
                            />
                            <span className="text-[10px] font-black uppercase text-[#2D2421]">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {formDataState.hasCriminalRecord === "yes" && (
                  <textarea
                    name="criminalOffenceDetails"
                    value={formDataState.criminalOffenceDetails}
                    onChange={handleInputChange}
                    placeholder="Details..."
                    className="w-full rounded-xl bg-red-50/10 border border-red-100 p-4 text-xs font-bold focus:outline-none h-20 resize-none"
                  />
                )}

                <textarea
                  name="address"
                  value={formDataState.address}
                  onChange={handleInputChange}
                  placeholder="Full address..."
                  className="w-full rounded-xl bg-[#FAF8F6] border border-[#F4E9E2] p-4 text-xs font-bold focus:outline-none h-20 resize-none"
                />
              </div>
            )}
          </div>

          <div className="p-6 border-t border-[#FAF8F6] flex justify-between items-center bg-white shrink-0">
            {activeStep > 1 ? (
              <button
                type="button"
                onClick={() => setActiveStep(activeStep - 1)}
                className="text-[9px] font-black uppercase tracking-widest text-[#8E817C] hover:text-[#2D2421] flex items-center gap-2"
              >
                <ArrowLeft size={14} /> Previous
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-4">
              {activeStep < 3 ? (
                <button
                  type="button"
                  onClick={() => setActiveStep(activeStep + 1)}
                  className="px-8 py-3 bg-[#2D2421] text-white rounded-lg text-[9px] font-black uppercase tracking-[0.2em] hover:bg-[#BC6641] transition-all flex items-center gap-2 shadow-lg"
                >
                  Next <ChevronRight size={14} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-[#BC6641] text-white rounded-lg text-[9px] font-black uppercase tracking-[0.2em] hover:bg-[#2D2421] transition-all disabled:opacity-50 shadow-lg"
                >
                  {loading ? "Syncing..." : "Submit"}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ================= HELPERS (SAME AS BEFORE) ================= */
function EditableField({ isEditing, label, name, value, onChange, icon, masked }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[9px] font-black uppercase tracking-widest text-[#BC6641]">{label}</label>
      <div className="relative group">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E817C] group-focus-within:text-[#BC6641] transition-colors">
          {icon}
        </div>
        {isEditing ? (
          <input
            name={name}
            value={value}
            onChange={onChange}
            className="w-full h-11 rounded-lg border border-[#F4E9E2] pl-10 pr-4 text-xs font-bold text-[#2D2421] outline-none focus:border-[#BC6641] bg-white transition-all shadow-sm"
          />
        ) : (
          <div className="w-full h-11 pl-10 flex items-center text-sm font-bold text-[#2D2421] truncate">
            {masked ? mask(value) : value || "—"}
          </div>
        )}
      </div>
    </div>
  );
}

function StepIndicator({ num, label, active, done, onClick }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-4 w-full group">
      <div
        className={`h-7 w-7 rounded-md flex items-center justify-center text-[9px] font-black transition-all ${
          active
            ? "bg-[#BC6641] text-white shadow-lg shadow-[#BC6641]/20"
            : done
            ? "bg-emerald-500 text-white"
            : "bg-white border border-[#F4E9E2] text-[#8E817C]"
        }`}
      >
        {done ? <CheckCircle2 size={12} /> : num}
      </div>
      <span className={`text-[10px] font-black uppercase tracking-widest ${active ? "text-[#2D2421]" : "text-[#8E817C] group-hover:text-[#2D2421]"}`}>
        {label}
      </span>
    </button>
  );
}

function FormHeader({ title, subtitle }) {
  return (
    <div className="space-y-0.5">
      <h3 className="text-xl font-serif italic text-[#2D2421]">{title}</h3>
      <p className="text-[9px] text-[#8E817C] uppercase font-bold tracking-wider">{subtitle}</p>
    </div>
  );
}

function MiniInput({ label, icon, ...props }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[9px] font-black uppercase tracking-widest text-[#BC6641]">{label}</label>
      <div className="relative group">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E817C] group-focus-within:text-[#BC6641] transition-colors">
          {icon}
        </div>
        <input
          {...props}
          className="w-full h-11 rounded-lg bg-[#FAF8F6] border border-[#F4E9E2] pl-10 pr-4 text-xs font-bold text-[#2D2421] focus:outline-none focus:border-[#BC6641] transition-all focus:bg-white"
        />
      </div>
    </div>
  );
}

function Dropzone({ label, name, previews, setPreviews, setFiles }) {
  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // revoke old url if exists
    if (previews?.[name]?.url?.startsWith("blob:")) {
      URL.revokeObjectURL(previews[name].url);
    }

    const url = URL.createObjectURL(file);
    setPreviews((prev) => ({ ...prev, [name]: { url, type: file.type } }));
    setFiles((prev) => ({ ...prev, [name]: file }));
  };

  return (
    <div className="space-y-1.5 flex-1">
      <label className="flex items-center justify-between p-3.5 bg-[#FAF8F6] border border-dashed border-[#EBD9D0] rounded-lg cursor-pointer hover:border-[#BC6641] hover:bg-white transition-all group">
        <div className="flex items-center gap-2">
          <UploadCloud className="text-[#8E817C] group-hover:text-[#BC6641]" size={16} />
          <span className="text-[8px] font-black uppercase tracking-widest text-[#8E817C] group-hover:text-[#2D2421]">
            {label}
          </span>
        </div>
        <input type="file" name={name} hidden onChange={handleChange} accept="image/*" />
        {previews?.[name] && <CheckCircle2 size={14} className="text-emerald-500 animate-in zoom-in" />}
      </label>
    </div>
  );
}

function Attachment({ url, label }) {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex-1 flex flex-col items-center justify-center py-2.5 bg-[#FAF8F6] border border-[#F4E9E2] rounded-lg hover:border-[#BC6641] hover:bg-white transition-all shadow-sm"
    >
      <Eye size={16} className="text-[#BC6641] mb-1" />
      <span className="text-[8px] font-black uppercase text-[#2D2421]">{label}</span>
    </a>
  );
}

function StatusBadge({ status }) {
  const isApproved = status === "approved";
  const label = status || "In Review";

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${
        isApproved
          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
          : "bg-amber-500/10 border-amber-500/20 text-amber-400"
      }`}
    >
      <div className={`w-1.5 h-1.5 rounded-full ${isApproved ? "bg-emerald-400" : "bg-amber-400 animate-pulse"}`} />
      {label}
    </div>
  );
}

function mask(val) {
  if (!val) return "—";
  const s = String(val);
  return s.length > 4 ? "**** " + s.slice(-4) : s;
}

function formatMonthYear(value) {
  if (!value) return "—";
  // expects YYYY-MM (input type="month")
  const [year, month] = String(value).split("-");
  if (!year || !month) return value;
  return `${month}/${year}`;
}
