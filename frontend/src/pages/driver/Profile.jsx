import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getDriverProfile,
  updateDriverProfile,
  updateDriverBankDetails,
  uploadDriverProfilePhoto,
  deleteDriverAccount
} from "../../services/driver.api";
import toast from "react-hot-toast";

import { getKYCStatus } from "../../services/kyc.api";
import { 
  Camera, 
  User, 
  CreditCard, 
  Award, 
  LogOut, 
  ShieldCheck, 
  Save, 
  Trash2,
  Settings,
  MapPin,
  Calendar,
  Briefcase
} from "lucide-react";

const CAR_OPTIONS = ["Manual", "Automatic", "SUV", "Luxury Cars"];

export default function DriverProfile() {
  const [profile, setProfile] = useState(null);
  const [kycStatus, setKycStatus] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingBank, setIsEditingBank] = useState(false);

  const fileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
    getKYCStatus().then((res) => {
      setKycStatus(res.data.data?.status);
    }).catch(() => setKycStatus(null));
  }, [navigate]);

  const fetchProfile = () => {
    getDriverProfile()
      .then((res) => setProfile(res.data.data))
      .catch(() => navigate("/"));
  };

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB]">
      <div className="w-10 h-10 border-4 border-[#EBD9D0] border-t-[#BC6641] rounded-full animate-spin" />
    </div>
  );

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("photo", file);
    try {
      const res = await uploadDriverProfilePhoto(formData);
      setProfile(res.data.data);
    } catch (err) {
      toast.error("Photo upload failed");
    }
  };

  const saveProfileDetails = async () => {
    try {
      await updateDriverProfile({
        carTypes: profile.carTypes || [],
        preferredLanguage: profile.preferredLanguage || "",
        preferredCity: profile.preferredCity || "",
        gender: profile.gender || "",
      });
      setIsEditingProfile(false);
      fetchProfile(); 
    } catch (err) {
      toast.error("Failed to update preferences");
    }
  };

  const saveBankDetails = async () => {
    try {
      await updateDriverBankDetails({ 
        bankDetails: {
          accountHolderName: profile.bankDetails?.accountHolderName || "",
          accountNumber: profile.bankDetails?.accountNumber || "",
          bankName: profile.bankDetails?.bankName || "",
          branchName: profile.bankDetails?.branchName || "",
          ifscCode: profile.bankDetails?.ifscCode || "",
          upiId: profile.bankDetails?.upiId || ""
        }
      });
      setIsEditingBank(false);
      fetchProfile();
    } catch (err) {
      toast.error("Failed to update bank details");
    }
  };

  const toggleCarType = (type) => {
    const currentTypes = profile.carTypes || [];
    const exists = currentTypes.includes(type);
    setProfile({
      ...profile,
      carTypes: exists ? currentTypes.filter((t) => t !== type) : [...currentTypes, type],
    });
  };

const handleDeleteAccount = async () => {
  const confirm = window.confirm(
    "⚠️ WARNING:\nThis will permanently delete your driver account, rides, bank data and access.\nThis action cannot be undone.\n\nDo you want to continue?"
  );

  if (!confirm) return;

  try {
    await deleteDriverAccount();

    localStorage.clear();
    toast.success("Account deleted successfully");
    navigate("/");
  } catch (err) {
    console.error(err);
    toast.error("Failed to delete account. Please try again.");
  }
};

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2D2421] pb-24 font-sans selection:bg-[#BC6641]/10">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0" 
           style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/p6.png')` }}></div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-12 space-y-8">
        
        {/* ================= PROFILE HEADER ================= */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-[#BC6641]/5 border border-[#F4E9E2] flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative group">
              <div onClick={() => fileRef.current.click()} className="h-32 w-32 rounded-[2.2rem] bg-[#FAF8F6] border-2 border-[#F4E9E2] flex items-center justify-center text-[#BC6641] cursor-pointer overflow-hidden shadow-inner transition-transform active:scale-95">
                {profile.profileImage ? <img src={profile.profileImage} className="h-full w-full object-cover" /> : <User size={40} />}
              </div>
              <button className="absolute -bottom-2 -right-2 bg-[#BC6641] text-white p-2.5 rounded-2xl shadow-lg hover:scale-110 transition-transform"><Camera size={18} /></button>
              <input ref={fileRef} type="file" hidden accept="image/*" onChange={handlePhotoChange} />
            </div>
            <div className="text-center md:text-left space-y-2">
              <h1 className="text-4xl font-serif font-bold text-[#2D2421] tracking-tight">{profile.name}</h1>
              <p className="text-[#8E817C] font-medium italic">{profile.email}</p>
              <div className="flex items-center justify-center md:justify-start gap-3 pt-1">
                <div className="bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100 text-yellow-700 text-xs font-bold">⭐ {profile.rating?.average || 0}</div>
                <KYCStatusBadge status={kycStatus} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* ================= RESTORED: IDENTITY PROFILE (FETCHED DETAILS) ================= */}
            <section className="bg-white rounded-[2rem] p-8 border border-[#F4E9E2] shadow-sm">
              <h2 className="text-xl font-serif italic mb-8 flex items-center gap-3">
                <Award className="text-[#BC6641]" size={20} /> Identity Profile
              </h2>
              <div className="grid sm:grid-cols-2 gap-5">
                <InfoTile label="Official Name" value={profile.name} icon={<User size={14}/>} />
                <InfoTile label="Mobile Contact" value={profile.mobile || "—"} icon={<ShieldCheck size={14}/>} />
                <InfoTile label="Joined Portfolio" value={new Date(profile.createdAt).toDateString()} icon={<Calendar size={14}/>} />
                <InfoTile label="Operational Role" value={profile.role} icon={<Briefcase size={14}/>} />
              </div>
            </section>

            {/* ================= WORK PREFERENCES (EDITABLE) ================= */}
            <section className="bg-white rounded-[2rem] p-8 border border-[#F4E9E2] shadow-sm space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-serif italic flex items-center gap-3">
                   <Settings className="text-[#BC6641]" size={20} /> Work Preferences
                </h2>
                {!isEditingProfile && (
                  <button onClick={() => setIsEditingProfile(true)} className="text-[10px] font-black uppercase text-[#BC6641] border-b-2 border-[#BC6641] tracking-widest">
                    Update Preferences
                  </button>
                )}
              </div>

              {isEditingProfile ? (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase text-[#8E817C] tracking-widest ml-2">Qualified Vehicle Types</p>
                    <div className="flex flex-wrap gap-2">
                      {CAR_OPTIONS.map((type) => (
                        <button key={type} type="button" onClick={() => toggleCarType(type)} className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all border ${profile.carTypes?.includes(type) ? "bg-[#BC6641] border-[#BC6641] text-white shadow-md shadow-[#BC6641]/20" : "bg-[#FAF8F6] border-[#F4E9E2] text-[#8E817C] hover:border-[#BC6641]"}`}>
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <SelectBox label="Gender" value={profile.gender} options={["Male", "Female", "Other"]} onChange={(v) => setProfile({...profile, gender: v})} />
                    <SelectBox label="Language" value={profile.preferredLanguage} options={["Hindi", "English", "Punjabi", "Marathi"]} onChange={(v) => setProfile({...profile, preferredLanguage: v})} />
                    <div className="space-y-1.5 col-span-2">
                      <label className="text-[10px] font-black uppercase text-[#BC6641] ml-2">Base Location (City)</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8E817C]" size={16} />
                        <input type="text" value={profile.preferredCity || ""} onChange={(e) => setProfile({...profile, preferredCity: e.target.value})} className="w-full h-12 bg-[#FAF8F6] border border-[#F4E9E2] rounded-xl pl-12 pr-4 text-sm font-bold focus:border-[#BC6641] outline-none transition-all" placeholder="Enter City" />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4 border-t border-[#F4E9E2]">
                    <button onClick={saveProfileDetails} className="flex-1 h-14 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-colors shadow-lg flex items-center justify-center gap-2"><Save size={18} /> Save Preferences</button>
                    <button onClick={() => setIsEditingProfile(false)} className="flex-1 h-14 bg-[#FAF8F6] text-[#8E817C] rounded-2xl font-bold">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-6">
                  <InfoTile label="Vehicle Expertise" value={(profile.carTypes || []).join(", ") || "—"} />
                  <InfoTile label="Gender" value={profile.gender || "—"} />
                  <InfoTile label="Base City" value={profile.preferredCity || "—"} />
                  <InfoTile label="Language" value={profile.preferredLanguage || "—"} />
                </div>
              )}
            </section>
          </div>

          {/* RIGHT COLUMN: FINANCE HUB */}
          <div className="lg:col-span-4 space-y-8">
            <section className="bg-[#2D2421] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="flex items-center gap-3 mb-8 relative z-10">
                <CreditCard className="text-[#BC6641]" size={24} />
                <h2 className="text-xl font-serif italic">Finance Hub</h2>
              </div>
              
              {isEditingBank ? (
                <div className="space-y-4 animate-in fade-in relative z-10 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
                  <BankInput label="Holder Name" value={profile.bankDetails?.accountHolderName} onChange={(v) => setProfile({...profile, bankDetails: {...profile.bankDetails, accountHolderName: v}})} />
                  <BankInput label="Bank Name" value={profile.bankDetails?.bankName} onChange={(v) => setProfile({...profile, bankDetails: {...profile.bankDetails, bankName: v}})} />
                  <BankInput label="Branch" value={profile.bankDetails?.branchName} onChange={(v) => setProfile({...profile, bankDetails: {...profile.bankDetails, branchName: v}})} />
                  <BankInput label="A/C Number" value={profile.bankDetails?.accountNumber} onChange={(v) => setProfile({...profile, bankDetails: {...profile.bankDetails, accountNumber: v}})} />
                  <BankInput label="IFSC Code" value={profile.bankDetails?.ifscCode} onChange={(v) => setProfile({...profile, bankDetails: {...profile.bankDetails, ifscCode: v}})} />
                  <BankInput label="UPI ID" value={profile.bankDetails?.upiId} onChange={(v) => setProfile({...profile, bankDetails: {...profile.bankDetails, upiId: v}})} />
                  
                  <div className="flex gap-2 pt-2">
                    <button onClick={saveBankDetails} className="flex-1 py-3 bg-white text-[#2D2421] rounded-xl font-bold text-xs">Save</button>
                    <button onClick={() => setIsEditingBank(false)} className="flex-1 py-3 bg-white/10 text-white rounded-xl text-xs">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5 relative z-10">
                  <BankTile label="Bank" value={profile.bankDetails?.bankName} />
                  <BankTile label="Account" value={profile.bankDetails?.accountNumber ? `**** ${profile.bankDetails.accountNumber.slice(-4)}` : "—"} />
                  <BankTile label="IFSC" value={profile.bankDetails?.ifscCode} />
                  <BankTile label="UPI Address" value={profile.bankDetails?.upiId} />
                  <button onClick={() => setIsEditingBank(true)} className="w-full mt-6 py-4 bg-[#BC6641] hover:bg-[#A35232] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-[#BC6641]/20">Modify Bank Data</button>
                </div>
              )}
            </section>

            {/* QUICK ACTIONS */}
            <div className="grid grid-cols-2 gap-4">
              <QuickAction icon={<ShieldCheck size={20}/>} label="KYC Panel" onClick={() => navigate("/driver/kyc")} />
              <button onClick={handleDeleteAccount} className="col-span-1 flex flex-col items-center justify-center p-5 rounded-[1.8rem] gap-2 bg-red-50 border border-red-100 text-red-600 transition-all hover:bg-red-100">
                <Trash2 size={20}/>
                <span className="text-[10px] font-black uppercase tracking-widest">Delete Account</span>
              </button>
              <QuickAction icon={<LogOut size={20}/>} label="Sign Out" onClick={() => { localStorage.clear(); navigate("/"); }} color="text-[#BC6641] bg-white border border-[#F4E9E2]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= HELPERS ================= */

function BankInput({ label, value, onChange }) {
  return (
    <div className="space-y-1">
      <p className="text-[9px] font-black uppercase text-[#BC6641] ml-1">{label}</p>
      <input type="text" value={value || ""} onChange={(e) => onChange(e.target.value)} className="w-full h-10 bg-white/5 border border-white/10 rounded-xl px-4 text-xs text-white outline-none focus:border-[#BC6641] transition-all" />
    </div>
  );
}

function InfoTile({ label, value, icon }) {
  return (
    <div className="p-4 rounded-2xl bg-[#FAF8F6] border border-[#F4E9E2] group hover:border-[#BC6641]/30 transition-colors">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[#BC6641] opacity-60">{icon}</span>
        <p className="text-[10px] font-black uppercase tracking-widest text-[#8E817C]">{label}</p>
      </div>
      <p className="font-bold text-[#2D2421] text-sm truncate">{value}</p>
    </div>
  );
}

function BankTile({ label, value }) {
  return (
    <div className="flex justify-between items-center border-b border-white/5 pb-2">
      <span className="text-[10px] font-black uppercase text-[#BC6641]">{label}</span>
      <span className="text-sm font-medium text-white/90">{value || "—"}</span>
    </div>
  );
}

function QuickAction({ icon, label, onClick, color = "text-[#8E817C] bg-white border border-[#F4E9E2]" }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center p-5 rounded-[1.8rem] gap-2 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 ${color}`}>
      {icon} <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}

function SelectBox({ label, value, options, onChange }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase text-[#BC6641] ml-2">{label}</label>
      <select value={value || ""} onChange={(e) => onChange(e.target.value)} className="w-full h-12 bg-[#FAF8F6] border border-[#F4E9E2] rounded-xl px-4 text-sm font-bold appearance-none cursor-pointer">
        <option value="" disabled>Select {label}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function KYCStatusBadge({ status }) {
  const styles = { approved: "bg-emerald-50 text-emerald-700 border-emerald-100", default: "bg-amber-50 text-amber-700 border-amber-100" };
  const s = styles[status] || styles.default;
  return <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border ${s}`}>KYC: {status || 'Pending'}</span>;
}