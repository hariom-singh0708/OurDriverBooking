import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminProfile } from "../../services/admin.api";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getAdminProfile()
      .then((res) => setProfile(res.data.data))
      .catch((err) => {
        console.error("Profile fetch failed", err);
        navigate("/");
      });
  }, [navigate]);

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
        {/* HEADER */}
        <div className="relative rounded-3xl p-[1px] bg-gradient-to-r from-indigo-600/60 to-cyan-500/60">
          <div className="rounded-3xl bg-[#020617] p-6 shadow-2xl flex items-center gap-5">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center text-2xl font-bold text-white">
              {profile.name?.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">
                {profile.name}
              </h1>
              <p className="text-gray-400 text-sm">
                {profile.email}
              </p>
            </div>
          </div>
        </div>

        {/* DETAILS */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-5">
            Profile Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ProfileField label="Full Name" value={profile.name} />
            <ProfileField label="Email Address" value={profile.email} />
            <ProfileField
              label="Mobile Number"
              value={profile.mobile || "—"}
            />
            <ProfileField label="Role" value={profile.role} />
            <ProfileField
              label="Joined On"
              value={new Date(profile.createdAt).toDateString()}
            />
          </div>
        </div>

        {/* ACTIONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => navigate("/client")}
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 py-3 text-white font-bold hover:opacity-90"
          >
            ← Back to Dashboard
          </button>

          <button
            onClick={() => {
              localStorage.clear();
              navigate("/");
            }}
            className="rounded-xl bg-red-500/90 hover:bg-red-600 py-3 text-white font-bold"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= FIELD ================= */

function ProfileField({ label, value }) {
  return (
    <div className="rounded-xl bg-[#020617] border border-white/10 p-4">
      <p className="text-xs uppercase tracking-wide text-gray-400">
        {label}
      </p>
      <p className="font-semibold text-white mt-1">
        {value}
      </p>
    </div>
  );
}
