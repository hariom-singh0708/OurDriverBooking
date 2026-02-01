import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getClientProfile } from "../../services/client.api";
import { getKYCStatus } from "../../services/kyc.api";

export default function DriverProfile() {
  const [profile, setProfile] = useState(null);
  const [kycStatus, setKycStatus] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getClientProfile()
      .then((res) => setProfile(res.data.data))
      .catch(() => navigate("/"));

    getKYCStatus().then((res) => {
      setKycStatus(res.data.data?.status);
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
        <div className="rounded-3xl p-[1px] bg-gradient-to-r from-indigo-600/60 to-cyan-500/60">
          <div className="rounded-3xl bg-[#020617] p-6 shadow-2xl flex items-center justify-between gap-5">
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center text-2xl font-bold text-white">
                {profile.name?.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-white">
                  {profile.name}
                </h1>
                <p className="text-gray-400 text-sm">{profile.email}</p>
              </div>
            </div>

            {/* KYC STATUS BADGE */}
            <KYCStatusBadge status={kycStatus} />
          </div>
        </div>

        {/* DETAILS */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
          <h2 className="text-lg font-bold text-white mb-5">
            Driver Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name" value={profile.name} />
            <Field label="Email" value={profile.email} />
            <Field label="Mobile" value={profile.mobile || "—"} />
            <Field label="Role" value={profile.role} />
            <Field
              label="Joined On"
              value={new Date(profile.createdAt).toDateString()}
            />
          </div>
        </div>

        {/* ACTIONS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* ✅ VIEW KYC BUTTON */}
          <button
            onClick={() => navigate("/driver/kyc")}
            className="rounded-xl bg-white/5 border border-white/10 py-3 text-white font-semibold hover:bg-white/10"
          >
            📄 View / Manage KYC
          </button>

          <button
            onClick={() => navigate("/driver")}
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 py-3 text-white font-bold"
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

/* ================= COMPONENTS ================= */

function Field({ label, value }) {
  return (
    <div className="rounded-xl bg-[#020617] border border-white/10 p-4">
      <p className="text-xs uppercase tracking-wide text-gray-400">
        {label}
      </p>
      <p className="font-semibold text-white mt-1">{value}</p>
    </div>
  );
}

function KYCStatusBadge({ status }) {
  if (!status) {
    return (
      <span className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-500/20 text-gray-300">
        KYC: Not Submitted
      </span>
    );
  }

  if (status === "approved") {
    return (
      <span className="px-4 py-2 rounded-xl text-xs font-semibold bg-green-500/20 text-green-400">
        ✔ KYC Approved
      </span>
    );
  }

  if (status === "under_review" || status === "submitted") {
    return (
      <span className="px-4 py-2 rounded-xl text-xs font-semibold bg-yellow-500/20 text-yellow-400">
        ⏳ KYC Under Review
      </span>
    );
  }

  return (
    <span className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-500/20 text-red-400">
      ✖ KYC Rejected
    </span>
  );
}
