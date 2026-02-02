import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getClientProfile,
  uploadProfilePhoto,
  updateSavedAddresses,
  updateClientProfile,
} from "../../services/client.api";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState("");
  const [showWallet, setShowWallet] = useState(false);
  const [showInbox, setShowInbox] = useState(false);
  const [isEditingExtra, setIsEditingExtra] = useState(true);

  const fileRef = useRef(null);
  const navigate = useNavigate();

  /* ================= LOAD PROFILE ================= */
  useEffect(() => {
    getClientProfile()
      .then((res) => {
        const data = res.data.data;
        setProfile(data);
        setSavedAddresses(data.savedAddresses || []);

        if (
          data.gender ||
          data.dob ||
          data.alternateMobile ||
          data.driverNotes
        ) {
          setIsEditingExtra(false);
        }
      })
      .catch(() => navigate("/"));
  }, [navigate]);

  /* ================= PHOTO UPLOAD ================= */
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("photo", file);

    const res = await uploadProfilePhoto(formData);
    setProfile(res.data.data);
  };

  /* ================= ADD / REMOVE ADDRESS ================= */
  const addAddress = async () => {
    if (!newAddress.trim()) return;

    const updated = [
      ...savedAddresses,
      { label: "Other", address: newAddress.trim() },
    ];

    setSavedAddresses(updated);
    setNewAddress("");
    await updateSavedAddresses({ addresses: updated });
  };

  const removeAddress = async (index) => {
    const updated = savedAddresses.filter((_, i) => i !== index);
    setSavedAddresses(updated);
    await updateSavedAddresses({ addresses: updated });
  };

  /* ================= SAVE EXTRA PROFILE ================= */
  const saveProfile = async () => {
    const res = await updateClientProfile({
      gender: profile.gender,
      dob: profile.dob,
      alternateMobile: profile.alternateMobile,
      emergencyContact: profile.emergencyContact,
      driverNotes: profile.driverNotes,
    });

    setProfile(res.data.data);
    setIsEditingExtra(false);
    alert("Profile updated successfully");
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] text-gray-400">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#020617] p-6">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* ================= HEADER ================= */}
        <div className="rounded-3xl bg-[#020617] p-6 shadow-2xl flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div
              onClick={() => fileRef.current.click()}
              className="relative h-16 w-16 rounded-full bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center text-2xl font-bold text-white cursor-pointer overflow-hidden"
            >
              {profile.profileImage ? (
                <img
                  src={profile.profileImage}
                  className="h-full w-full object-cover"
                />
              ) : (
                profile.name?.charAt(0)
              )}
              <input ref={fileRef} type="file" hidden onChange={handlePhotoChange} />
            </div>

            <div>
              <h1 className="text-2xl font-extrabold text-white">
                {profile.name}
              </h1>
              <p className="text-gray-400 text-sm">{profile.email}</p>
            </div>
          </div>

          {/* ⭐ RATING + WALLET + INBOX */}
          <div className="flex items-center gap-4">
            {/* ⭐ RATING */}
            <div className="text-right">
              <p className="text-xs text-gray-400">Rating</p>
              <p className="text-lg font-bold text-yellow-400">
                ⭐ {profile.rating?.average || 0}
                <span className="text-xs text-gray-400 ml-1">
                  ({profile.rating?.totalRatings || 0})
                </span>
              </p>
            </div>

            <button
              onClick={() => setShowInbox(true)}
              className="rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-white hover:bg-white/10"
            >
              📥 Inbox
            </button>

            <button
              onClick={() => setShowWallet(true)}
              className="rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-white hover:bg-white/10"
            >
              💰 Wallet
            </button>
          </div>
        </div>

        {/* ================= BASIC DETAILS ================= */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <h2 className="text-lg font-bold text-white mb-5">
            Profile Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ProfileField label="Full Name" value={profile.name} />
            <ProfileField label="Email" value={profile.email} />
            <ProfileField label="Mobile" value={profile.mobile || "—"} />
            <ProfileField label="Role" value={profile.role} />
          </div>
        </div>

        {/* ================= EXTRA DETAILS ================= */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">
              Additional Information
            </h2>
            {!isEditingExtra && (
              <button
                onClick={() => setIsEditingExtra(true)}
                className="text-cyan-400 text-sm font-semibold"
              >
                ✏️ Edit
              </button>
            )}
          </div>

          {!isEditingExtra ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ProfileField label="Gender" value={profile.gender || "—"} />
              <ProfileField label="DOB" value={profile.dob?.slice(0,10) || "—"} />
              <ProfileField label="Alternate Mobile" value={profile.alternateMobile || "—"} />
              <ProfileField label="Notes" value={profile.driverNotes || "—"} />
            </div>
          ) : (
            <>
              <Input label="Gender" value={profile.gender || ""} onChange={(v)=>setProfile({...profile, gender:v})}/>
              <Input type="date" label="DOB" value={profile.dob?.slice(0,10)||""} onChange={(v)=>setProfile({...profile, dob:v})}/>
              <Input label="Alternate Mobile" value={profile.alternateMobile||""} onChange={(v)=>setProfile({...profile, alternateMobile:v})}/>
              <Textarea label="Notes for Driver" value={profile.driverNotes||""} onChange={(v)=>setProfile({...profile, driverNotes:v})}/>

              <button
                onClick={saveProfile}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 py-3 text-white font-bold"
              >
                Save Profile
              </button>
            </>
          )}
        </div>

        {/* ================= SAVED ADDRESSES ================= */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">
            📍 Saved Addresses
          </h2>

          {savedAddresses.map((addr, i) => (
            <div key={i} className="flex justify-between bg-[#020617] p-3 rounded-xl mb-2">
              <span className="text-white">{addr.address}</span>
              <button
                onClick={() => removeAddress(i)}
                className="text-red-400 text-xs"
              >
                Remove
              </button>
            </div>
          ))}

          <div className="flex gap-2">
            <input
              value={newAddress}
              onChange={(e)=>setNewAddress(e.target.value)}
              className="flex-1 rounded-xl bg-[#020617] border border-white/10 p-3 text-white"
              placeholder="Add new address"
            />
            <button
              onClick={addAddress}
              className="px-4 rounded-xl bg-indigo-600 text-white"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* ================= WALLET POPUP ================= */}
      {showWallet && (
        <Popup title="Wallet" icon="💰" onClose={()=>setShowWallet(false)} />
      )}

      {/* ================= INBOX POPUP ================= */}
      {showInbox && (
        <Popup title="Inbox" icon="📥" onClose={()=>setShowInbox(false)}>
          <p className="text-gray-400 mt-2">
            Offers & Notifications coming soon 🚀
          </p>
        </Popup>
      )}
    </div>
  );
}

/* ================= POPUP ================= */
function Popup({ title, icon, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#020617] border border-white/10 rounded-2xl p-8 w-full max-w-sm text-center">
        <div className="text-4xl mb-4">{icon}</div>
        <h2 className="text-xl font-bold text-white">{title}</h2>
        {children || <p className="text-gray-400 mt-2">Coming Soon 🚧</p>}
        <button
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 py-3 text-white font-bold"
        >
          Close
        </button>
      </div>
    </div>
  );
}

/* ================= SMALL COMPONENTS ================= */
function ProfileField({ label, value }) {
  return (
    <div className="rounded-xl bg-[#020617] border border-white/10 p-4">
      <p className="text-xs uppercase text-gray-400">{label}</p>
      <p className="font-semibold text-white mt-1">{value}</p>
    </div>
  );
}
function Input({ label, value, onChange, type="text" }) {
  return (
    <div>
      <label className="text-xs uppercase text-gray-400">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e)=>onChange(e.target.value)}
        className="w-full rounded-xl bg-[#020617] border border-white/10 p-3 text-white"
      />
    </div>
  );
}
function Textarea({ label, value, onChange }) {
  return (
    <div>
      <label className="text-xs uppercase text-gray-400">{label}</label>
      <textarea
        value={value}
        onChange={(e)=>onChange(e.target.value)}
        className="w-full rounded-xl bg-[#020617] border border-white/10 p-3 text-white resize-none"
      />
    </div>
  );
}
