import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getClientProfile,
  uploadProfilePhoto,
  updateSavedAddresses,
  updateClientProfile,
  deleteClientAccount
} from "../../services/client.api";
import { 
  Camera, MapPin, Wallet, Mail, LogOut, Edit3, Trash2, 
  ShieldCheck, LifeBuoy, Plus, Settings, User, Phone, 
  ShieldAlert, ChevronRight, XCircle, Clock, BadgeCheck,
  Zap, Compass, Bookmark, AlertCircle 
} from "lucide-react";
import toast from "react-hot-toast";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState("");
  const [showWallet, setShowWallet] = useState(false);
  const [showInbox, setShowInbox] = useState(false);
  const [isEditingExtra, setIsEditingExtra] = useState(false);
  const [loading, setLoading] = useState(false);

  const fileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, [navigate]);

  const fetchProfile = () => {
    getClientProfile()
      .then((res) => {
        const data = res.data.data;
        setProfile(data);
        setSavedAddresses(data.savedAddresses || []);
      })
      .catch(() => navigate("/"));
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("photo", file);
    try {
      const res = await uploadProfilePhoto(formData);
      setProfile(res.data.data);
    } catch (err) {
      toast.error("Photo update failed");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

const handleDeleteAccount = async () => {
  toast(
    (t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold">
          This action is permanent. Your account will be deleted.
        </p>

        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 rounded bg-gray-200 text-gray-800 text-xs"
          >
            Cancel
          </button>

          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await deleteClientAccount();
                toast.success("Account deleted successfully");
                localStorage.clear();
                navigate("/login");
              } catch (err) {
                toast.error("Failed to delete account. Please try again.");
              }
            }}
            className="px-3 py-1 rounded bg-red-600 text-white text-xs"
          >
            Delete
          </button>
        </div>
      </div>
    ),
    {
      duration: 8000,
    }
  );
};



  const addAddress = async () => {
    if (!newAddress.trim()) return;
    const updated = [...savedAddresses, { label: "Other", address: newAddress.trim() }];
    setSavedAddresses(updated);
    setNewAddress("");
    await updateSavedAddresses({ addresses: updated });
  };

  const removeAddress = async (index) => {
    const updated = savedAddresses.filter((_, i) => i !== index);
    setSavedAddresses(updated);
    await updateSavedAddresses({ addresses: updated });
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      const res = await updateClientProfile({
        gender: profile.gender,
        dob: profile.dob,
        alternateMobile: profile.alternateMobile,
        emergencyContact: profile.emergencyContact,
        driverNotes: profile.driverNotes,
      });
      setProfile(res.data.data);
      setIsEditingExtra(false);
      toast.error("Profile Updated.");
    } catch (err) {
      toast.error("Update failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return (
    <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#BC6641]/20 border-t-[#BC6641] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2D2421] pb-24 font-sans selection:bg-[#BC6641]/20">
      {/* Dynamic Aura Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#BC6641]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[40%] bg-[#2D2421]/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-10 space-y-10">

        {/* ================= MODERN FLOATING HEADER ================= */}
        <div className="grid lg:grid-cols-3 gap-8 items-center bg-white rounded-[3.5rem] p-10 shadow-[0_32px_64px_-16px_rgba(188,102,65,0.1)] border border-[#F4E9E2]">
          <div className="lg:col-span-2 flex flex-col md:flex-row items-center gap-10">
            <div className="relative">
              <div 
                onClick={() => fileRef.current.click()}
                className="h-44 w-44 rounded-[3.5rem] bg-[#FAF8F6] border-8 border-white shadow-2xl flex items-center justify-center text-6xl font-serif text-[#BC6641] cursor-pointer overflow-hidden group transition-all duration-700 hover:rounded-3xl"
              >
                {profile.profileImage ? (
                  <img src={profile.profileImage} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Profile" />
                ) : (
                  profile.name?.charAt(0)
                )}
                <div className="absolute inset-0 bg-[#2D2421]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="text-white" size={32} />
                </div>
              </div>
              <input ref={fileRef} type="file" hidden onChange={handlePhotoChange} />
            </div>
            
            <div className="space-y-4 text-center md:text-left">
              <div className="space-y-1">
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <h1 className="text-5xl font-serif font-bold text-[#2D2421] tracking-tight">{profile.name}</h1>
                  <BadgeCheck className="text-[#BC6641]" size={28} />
                </div>
                <p className="text-[#8E817C] text-xl font-light italic">{profile.email}</p>
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
                <div className="px-5 py-2 bg-[#2D2421] text-white rounded-full flex items-center gap-2 shadow-lg shadow-[#2D2421]/20">
                  <Zap size={14} className="fill-yellow-500 text-yellow-500" />
                  <span className="text-[11px] font-black uppercase tracking-widest">{profile.role}</span>
                </div>
                <div className="px-5 py-2 bg-white border border-[#F4E9E2] text-[#BC6641] rounded-full flex items-center gap-2">
                  <span className="text-yellow-600 font-bold">★ {profile.rating?.average || 0}</span>
                  <span className="text-[10px] font-black uppercase opacity-60">Performance</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex lg:flex-col xl:flex-row items-center justify-center gap-4">
             <div className="flex gap-2 bg-[#FAF8F6] p-2 rounded-[2rem] border border-[#F4E9E2]">
                <NavBtn icon={<Wallet />} label="Assets" onClick={() => setShowWallet(true)} />
                <NavBtn icon={<Mail />} label="Inbox" onClick={() => setShowInbox(true)} />
                <NavBtn icon={<LogOut />} label="Leave" onClick={handleLogout} danger />
             </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
          
          {/* LEFT: CORE INTELLIGENCE */}
          <div className="lg:col-span-8 space-y-10">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <StatTile icon={<User />} label="Client ID" value={profile.name} />
              <StatTile icon={<Phone />} label="Registry" value={profile.mobile || "N/A"} />
              <StatTile icon={<Compass />} label="Tier" value={profile.role} />
              <StatTile icon={<Clock />} label="Uptime" value="Active" />
              <StatTile icon={<AlertCircle  />} label="Penalty Amount" value={profile.pendingPenaltyAmount || "₹0"} />
            </div>

            {/* PREFERENCES SECTION */}
            <div className="bg-white rounded-[3.5rem] p-12 border border-[#F4E9E2] shadow-sm relative group overflow-hidden">
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-[#FAF8F6] rounded-2xl flex items-center justify-center text-[#BC6641] shadow-inner">
                    <Settings size={24} />
                  </div>
                  <h2 className="text-3xl font-serif italic font-bold">Other Details</h2>
                </div>
                {!isEditingExtra && (
                  <button onClick={() => setIsEditingExtra(true)} className="group flex items-center gap-2 px-6 py-3 bg-[#2D2421] rounded-2xl text-white text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:bg-[#BC6641] hover:-translate-y-1">
                    <Edit3 size={16} /> Edit Profile
                  </button>
                )}
              </div>

              {!isEditingExtra ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <DetailRow label="Gender Identity" value={profile.gender} />
                  <DetailRow label="Date of Birth" value={profile.dob?.slice(0,10)} />
                  <DetailRow label="Secondary Access" value={profile.alternateMobile} />
                  <DetailRow label="Driver Protocols" value={profile.driverNotes} />
                </div>
              ) : (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <LuxuryInput label="Gender" value={profile.gender || ""} onChange={(v)=>setProfile({...profile, gender:v})}/>
                    <LuxuryInput type="date" label="Birth Date" value={profile.dob?.slice(0,10)||""} onChange={(v)=>setProfile({...profile, dob:v})}/>
                    <LuxuryInput label="Emergency Line" value={profile.alternateMobile||""} onChange={(v)=>setProfile({...profile, alternateMobile:v})}/>
                  </div>
                  <LuxuryTextarea label="Private Driver Instructions" value={profile.driverNotes||""} onChange={(v)=>setProfile({...profile, driverNotes:v})}/>
                  <div className="flex gap-4">
                    <button onClick={() => setIsEditingExtra(false)} className="flex-1 h-16 rounded-2xl bg-[#FAF8F6] text-[#8E817C] font-black uppercase tracking-[0.2em] text-[11px] hover:bg-white border border-transparent hover:border-[#F4E9E2] transition-all">Cancel</button>
                    <button onClick={saveProfile} disabled={loading} className="flex-[2] h-16 rounded-2xl bg-[#2D2421] text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-[#2D2421]/30 hover:bg-[#BC6641] transition-all active:scale-95">
                      {loading ? "Synchronizing..." : "Update Dossier"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* SECURITY SECTION */}
            <div className="bg-red-50/50 rounded-[3rem] p-10 border border-red-100/50 group hover:bg-red-50 transition-colors duration-500">
               <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 bg-white rounded-3xl flex items-center justify-center text-red-500 shadow-xl shadow-red-200/50 group-hover:rotate-6 transition-transform">
                      <ShieldAlert size={32} />
                    </div>
                    <div className="text-center md:text-left space-y-1">
                      <h3 className="text-xl font-serif font-bold text-[#2D2421]">Security Clearance</h3>
                      <p className="text-[11px] text-red-600/60 font-black uppercase tracking-widest leading-relaxed">Account termination is permanent & irreversible.</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleDeleteAccount}
                    className="flex items-center gap-3 px-10 py-5 bg-white border border-red-200 text-red-600 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-95"
                  >
                    <Trash2 size={18} /> Delete Account
                  </button>
               </div>
            </div>
          </div>

          {/* RIGHT: THE VAULT (Saved Addresses) */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-[#2D2421] rounded-[3.5rem] p-10 text-white shadow-2xl h-fit relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#BC6641] opacity-10 rounded-full blur-[100px] -mr-20 -mt-20 group-hover:opacity-20 transition-opacity duration-1000" />
              
              <div className="flex items-center justify-between mb-10 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-[#BC6641] rounded-2xl flex items-center justify-center shadow-xl shadow-[#BC6641]/30"><MapPin size={24} /></div>
                  <h2 className="text-2xl font-serif italic font-bold tracking-tight">Location Vault</h2>
                </div>
                <Bookmark className="text-[#BC6641]" size={20} />
              </div>

              <div className="space-y-4 mb-10 max-h-[400px] overflow-y-auto pr-3 custom-scrollbar relative z-10">
                {savedAddresses.length > 0 ? savedAddresses.map((addr, i) => (
                  <div key={i} className="flex justify-between items-center p-6 bg-white/5 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-all group/item hover:translate-x-1 duration-300">
                    <div className="flex-1 truncate pr-6">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#BC6641] mb-1">{addr.label || 'Saved Place'}</p>
                      <p className="text-[13px] font-light text-white/80 truncate leading-relaxed">{addr.address}</p>
                    </div>
                    <button onClick={() => removeAddress(i)} className="opacity-0 group-hover/item:opacity-100 text-white/20 hover:text-red-400 transition-all p-2">
                      <XCircle size={20} />
                    </button>
                  </div>
                )) : (
                  <div className="text-center py-16 space-y-4 opacity-20">
                    <Compass size={48} className="mx-auto" />
                    <p className="text-xs font-black uppercase tracking-widest">Vault Empty</p>
                  </div>
                )}
              </div>

              <div className="relative z-10">
                <input
                  value={newAddress}
                  onChange={(e)=>setNewAddress(e.target.value)}
                  className="w-full h-18 rounded-3xl bg-white/5 border border-white/10 pl-6 pr-20 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#BC6641] focus:bg-white/10 transition-all"
                  placeholder="Street, City, Landmark..."
                />
                <button
                  onClick={addAddress}
                  className="absolute right-2 top-2 h-14 w-14 bg-[#BC6641] text-white rounded-[1.2rem] flex items-center justify-center hover:scale-105 active:scale-90 shadow-2xl transition-all"
                >
                  <Plus size={28} />
                </button>
              </div>
            </div>
            
            <button onClick={() => navigate("/client/help-support")} className="group w-full flex items-center justify-between p-10 bg-white rounded-[3.5rem] border border-[#F4E9E2] hover:border-[#BC6641] transition-all duration-700 shadow-sm overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#FAF8F6] rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-[3] duration-1000 z-0" />
              <div className="flex items-center gap-6 relative z-10">
                <div className="h-16 w-16 bg-[#FAF8F6] text-[#BC6641] rounded-[1.5rem] flex items-center justify-center shadow-inner group-hover:bg-white transition-colors"><LifeBuoy size={28} /></div>
                <div className="text-left">
                  <span className="block text-[12px] font-black uppercase tracking-[0.2em] text-[#2D2421]">Service Concierge</span>
                  <span className="block text-[10px] text-[#8E817C] uppercase tracking-widest mt-1">Status: Online</span>
                </div>
              </div>
              <ChevronRight size={24} className="text-[#EBD9D0] group-hover:text-[#BC6641] transition-all relative z-10" />
            </button>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {showWallet && <LuxuryPopup title="Asset Portfolio" icon={<Wallet size={64}/>} onClose={()=>setShowWallet(false)} />}
      {showInbox && <LuxuryPopup title="Communication Vault" icon={<Mail size={64}/>} onClose={()=>setShowInbox(false)} />}
    </div>
  );
}

/* ================= LUXURY COMPONENTS ================= */

function NavBtn({ icon, label, onClick, danger }) {
  return (
    <button onClick={onClick} className={`group flex flex-col items-center gap-2 px-6 py-4 rounded-[1.5rem] transition-all active:scale-95 ${danger ? 'hover:bg-red-50 text-red-400' : 'hover:bg-white hover:shadow-xl text-[#BC6641]'}`}>
      <div className="transition-transform group-hover:scale-110">{icon}</div>
      <span className={`text-[9px] font-black uppercase tracking-widest ${danger ? 'text-red-400' : 'text-[#8E817C]'}`}>{label}</span>
    </button>
  );
}

function StatTile({ icon, label, value }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-[#F4E9E2] flex flex-col items-center text-center gap-3 transition-all hover:shadow-lg hover:-translate-y-1">
      <div className="text-[#BC6641] opacity-40">{icon}</div>
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[#8E817C] mb-1">{label}</p>
        <p className="text-xs font-bold text-[#2D2421] truncate max-w-[100px]">{value || "—"}</p>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="space-y-2 border-l-2 border-[#FAF8F6] pl-6 transition-all hover:border-[#BC6641]/40 group">
      <p className="text-[11px] font-black uppercase tracking-widest text-[#BC6641] opacity-50 group-hover:opacity-100 transition-opacity">{label}</p>
      <p className="text-lg font-medium text-[#2D2421] tracking-tight">{value || "Not provided"}</p>
    </div>
  );
}

function LuxuryInput({ label, value, onChange, type="text" }) {
  return (
    <div className="space-y-3">
      <label className="text-[11px] font-black uppercase tracking-widest text-[#BC6641] ml-4">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e)=>onChange(e.target.value)}
        className="w-full h-18 rounded-[1.5rem] bg-[#FAF8F6] border-2 border-[#F4E9E2] px-8 text-sm font-bold text-[#2D2421] focus:outline-none focus:border-[#BC6641] focus:bg-white transition-all shadow-inner"
      />
    </div>
  );
}

function LuxuryTextarea({ label, value, onChange }) {
  return (
    <div className="space-y-3">
      <label className="text-[11px] font-black uppercase tracking-widest text-[#BC6641] ml-4">{label}</label>
      <textarea
        rows="4"
        value={value}
        onChange={(e)=>onChange(e.target.value)}
        className="w-full rounded-[2rem] bg-[#FAF8F6] border-2 border-[#F4E9E2] p-8 text-sm font-bold text-[#2D2421] focus:outline-none focus:border-[#BC6641] focus:bg-white transition-all resize-none shadow-inner"
      />
    </div>
  );
}

function LuxuryPopup({ title, icon, onClose }) {
  return (
    <div className="fixed inset-0 bg-[#2D2421]/90 backdrop-blur-2xl flex items-center justify-center z-[200] p-6 animate-in fade-in zoom-in duration-500">
      <div className="bg-white rounded-[4rem] p-16 w-full max-w-md text-center shadow-[0_48px_80px_-16px_rgba(0,0,0,0.5)] border border-white/20">
        <div className="flex justify-center text-[#BC6641] mb-10 transition-transform hover:scale-110 duration-500">{icon}</div>
        <h2 className="text-4xl font-serif italic font-bold mb-12 text-[#2D2421] tracking-tight">{title}</h2>
        <button onClick={onClose} className="w-full py-6 bg-[#2D2421] text-white rounded-3xl font-black uppercase tracking-[0.3em] text-[12px] hover:bg-[#BC6641] transition-all shadow-2xl active:scale-95">Dismiss Portal</button>
      </div>
    </div>
  );
}