import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminProfile } from "../../services/admin.api";
import { User, Mail, Phone, Shield, Calendar, LogOut, ArrowLeft } from "lucide-react";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getAdminProfile()
      .then((res) => setProfile(res.data))
      .catch((err) => {
        console.error("Profile fetch failed", err);
        navigate("/");
      });
  }, [navigate]);

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FBF9F6] p-4">
        <div className="animate-spin h-8 w-8 border-4 border-[#C05D38] border-t-transparent rounded-full mb-4" />
        <p className="text-stone-400 text-[10px] font-black uppercase tracking-[0.3em]">Accessing Identity Manifest...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF9F6] p-4 sm:p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* HEADER / BRANDING */}
        <div className="text-center sm:text-left border-b border-stone-200 pb-8">
          <span className="text-[#C05D38] text-[10px] font-black uppercase tracking-[0.4em]">Administrative Profile</span>
          <h1 className="text-3xl font-black text-stone-900 tracking-tighter uppercase mt-1">Personnel Details</h1>
        </div>

        {/* PROFILE CARD */}
        <div className="relative bg-white rounded-[2.5rem] p-8 shadow-sm border border-stone-100 overflow-hidden">
          {/* Subtle Background Accent */}
          <div className="absolute top-0 right-0 h-32 w-32 bg-[#F9F6F0] rounded-bl-full -z-0" />
          
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-8">
            {/* Avatar */}
            <div className="h-24 w-24 rounded-3xl bg-stone-900 flex items-center justify-center text-4xl font-black text-[#C05D38] shadow-xl">
              {profile.name?.charAt(0)}
            </div>
            
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-black text-stone-900 uppercase tracking-tight">
                {profile.name}
              </h2>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                  Authorized {profile.role}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-stone-100">
          <div className="flex items-center gap-2 mb-8">
            <User size={16} className="text-[#C05D38]" />
            <h3 className="text-[10px] font-black text-stone-900 uppercase tracking-[0.2em]">Credential Overview</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProfileField icon={<User size={14} />} label="Full Name" value={profile.name} />
            <ProfileField icon={<Mail size={14} />} label="Email Address" value={profile.email} />
            <ProfileField icon={<Phone size={14} />} label="Contact Number" value={profile.mobile || "—"} />
            <ProfileField icon={<Shield size={14} />} label="Security Role" value={profile.role} />
            <ProfileField icon={<Calendar size={14} />} label="Registration Date" value={new Date(profile.createdAt).toDateString()} isWide />
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => navigate("/admin")}
            className="flex items-center justify-center gap-3 rounded-2xl bg-white border border-stone-200 py-4 text-stone-900 text-[10px] font-black uppercase tracking-widest hover:bg-stone-50 shadow-sm transition-all active:scale-95"
          >
            <ArrowLeft size={16} className="text-[#C05D38]" /> Back to Dashboard
          </button>

          <button
            onClick={() => {
              localStorage.clear();
              navigate("/");
            }}
            className="flex items-center justify-center gap-3 rounded-2xl bg-stone-900 py-4 text-white text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-stone-800 transition-all active:scale-95"
          >
            <LogOut size={16} className="text-[#C05D38]" /> Terminate Session
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENT: FIELD ================= */

function ProfileField({ icon, label, value, isWide }) {
  return (
    <div className={`space-y-2 ${isWide ? "md:col-span-2" : ""}`}>
      <div className="flex items-center gap-2 ml-1">
        <span className="text-[#C05D38]">{icon}</span>
        <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">
          {label}
        </p>
      </div>
      <div className="p-4 rounded-2xl bg-[#F9F6F0] border border-stone-50 font-bold text-stone-800 text-sm shadow-inner-sm">
        {value}
      </div>
    </div>
  );
}