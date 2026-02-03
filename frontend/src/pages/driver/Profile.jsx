import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import {
  getDriverProfile,
  updateDriverProfile,
  updateDriverBankDetails,
  uploadDriverProfilePhoto,
} from "../../services/driver.api";
import { getKYCStatus } from "../../services/kyc.api";

const CAR_OPTIONS = ["Manual", "Automatic", "SUV", "Luxury Cars"];

export default function DriverProfile() {
  const [profile, setProfile] = useState(null);
  const [kycStatus, setKycStatus] = useState(null);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingBank, setIsEditingBank] = useState(false);

  const fileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    getDriverProfile()
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

  /* ================= PHOTO UPLOAD ================= */

const handlePhotoChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("photo", file);

  const res = await uploadDriverProfilePhoto(formData);
  setProfile(res.data.data);
};


  /* ================= SAVE HANDLERS ================= */

  const saveProfileDetails = async () => {
    await updateDriverProfile({
      carTypes: profile.carTypes,
      preferredLanguage: profile.preferredLanguage,
      dob: profile.dob,
      preferredCity: profile.preferredCity,
      gender: profile.gender,
    });
    setIsEditingProfile(false);
  };

  const saveBankDetails = async () => {
    await updateDriverBankDetails({
      bankDetails: profile.bankDetails,
    });
    setIsEditingBank(false);
  };

  /* ================= CAR TYPE MULTI SELECT ================= */

  const toggleCarType = (type) => {
    setProfile((prev) => {
      const exists = prev.carTypes?.includes(type);
      return {
        ...prev,
        carTypes: exists
          ? prev.carTypes.filter((t) => t !== type)
          : [...(prev.carTypes || []), type],
      };
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#020617] p-6">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* ================= HEADER ================= */}
        <div className="rounded-3xl p-[1px] bg-gradient-to-r from-indigo-600/60 to-cyan-500/60">
          <div className="rounded-3xl bg-[#020617] p-6 shadow-2xl flex items-center justify-between gap-5">
            <div className="flex items-center gap-5">

              {/* PROFILE PHOTO */}
              <div
                onClick={() => fileRef.current.click()}
                className="relative h-16 w-16 rounded-full bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center text-white cursor-pointer overflow-hidden"
              >
                {profile.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt="driver"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-semibold">Edit</span>
                )}

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handlePhotoChange}
                />
              </div>

              <div>
                <h1 className="text-2xl font-extrabold text-white">
                  {profile.name}
                </h1>
                <p className="text-gray-400 text-sm">{profile.email}</p>
              </div>
            </div>

            <KYCStatusBadge status={kycStatus} />
          </div>
        </div>

        {/* ================= BASIC DETAILS ================= */}
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

        {/* ================= ADDITIONAL DRIVER DETAILS ================= */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
          <h2 className="text-lg font-bold text-white mb-5">
            Additional Driver Information
          </h2>

          {!isEditingProfile ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Vehicle Types"
                  value={(profile.carTypes || []).join(", ") || "—"}
                />
                <Field
                  label="Preferred Language"
                  value={profile.preferredLanguage || "—"}
                />
                <Field label="Gender" value={profile.gender || "—"} />
                <Field
                  label="Preferred City"
                  value={profile.preferredCity || "—"}
                />
                <Field
                  label="DOB"
                  value={
                    profile.dob
                      ? new Date(profile.dob).toDateString()
                      : "—"
                  }
                />
              </div>

              <button
                onClick={() => setIsEditingProfile(true)}
                className="mt-6 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 py-3 px-6 text-white font-bold"
              >
                ✏️ Edit Driver Details
              </button>
            </>
          ) : (
            <div className="space-y-4">

              <div>
                <p className="text-sm text-gray-400 mb-2">
                  Vehicle Types You Can Drive
                </p>
                <div className="flex flex-wrap gap-3">
                  {CAR_OPTIONS.map((type) => (
                    <button
                      key={type}
                      onClick={() => toggleCarType(type)}
                      className={`px-4 py-2 rounded-xl border text-sm ${
                        profile.carTypes?.includes(type)
                          ? "bg-indigo-600 text-white"
                          : "bg-[#020617] border-white/20 text-gray-300"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <select
                value={profile.preferredLanguage || ""}
                onChange={(e) =>
                  setProfile({ ...profile, preferredLanguage: e.target.value })
                }
                className="w-full rounded-xl bg-[#020617] border border-white/10 p-3 text-white"
              >
                <option value="">Preferred Language</option>
                <option value="Hindi">Hindi</option>
                <option value="English">English</option>
              </select>

              <select
                value={profile.gender || ""}
                onChange={(e) =>
                  setProfile({ ...profile, gender: e.target.value })
                }
                className="w-full rounded-xl bg-[#020617] border border-white/10 p-3 text-white"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>

              <input
                type="date"
                value={profile.dob ? profile.dob.split("T")[0] : ""}
                onChange={(e) =>
                  setProfile({ ...profile, dob: e.target.value })
                }
                className="w-full rounded-xl bg-[#020617] border border-white/10 p-3 text-white"
              />

              <input
                type="text"
                placeholder="Preferred City to Drive"
                value={profile.preferredCity || ""}
                onChange={(e) =>
                  setProfile({ ...profile, preferredCity: e.target.value })
                }
                className="w-full rounded-xl bg-[#020617] border border-white/10 p-3 text-white"
              />

              <div className="flex gap-3">
                <button
                  onClick={saveProfileDetails}
                  className="flex-1 rounded-xl bg-green-600 py-3 text-white font-bold"
                >
                  💾 Save
                </button>
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="flex-1 rounded-xl bg-white/10 py-3 text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ================= BANK DETAILS ================= */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
          <h2 className="text-lg font-bold text-white mb-5">
            Bank Details
          </h2>

          {!isEditingBank ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Account Holder Name"
                  value={profile.bankDetails?.accountHolderName || "—"}
                />
                <Field
                  label="Account Number"
                  value={
                    profile.bankDetails?.accountNumber
                      ? "XXXXXX" +
                        profile.bankDetails.accountNumber.slice(-4)
                      : "—"
                  }
                />
                <Field
                  label="IFSC Code"
                  value={profile.bankDetails?.ifscCode || "—"}
                />
                <Field
                  label="Bank Name"
                  value={profile.bankDetails?.bankName || "—"}
                />
                <Field
                  label="UPI ID"
                  value={profile.bankDetails?.upiId || "—"}
                />
              </div>

              <button
                onClick={() => setIsEditingBank(true)}
                className="mt-6 rounded-xl bg-white/10 border border-white/20 py-3 px-6 text-white font-semibold hover:bg-white/20"
              >
                🏦 Edit Bank Details
              </button>
            </>
          ) : (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Account Holder Name"
                value={profile.bankDetails?.accountHolderName || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    bankDetails: {
                      ...profile.bankDetails,
                      accountHolderName: e.target.value,
                    },
                  })
                }
                className="w-full rounded-xl bg-[#020617] border border-white/10 p-3 text-white"
              />

              <input
                type="text"
                placeholder="Account Number"
                value={profile.bankDetails?.accountNumber || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    bankDetails: {
                      ...profile.bankDetails,
                      accountNumber: e.target.value,
                    },
                  })
                }
                className="w-full rounded-xl bg-[#020617] border border-white/10 p-3 text-white"
              />

              <input
                type="text"
                placeholder="IFSC Code"
                value={profile.bankDetails?.ifscCode || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    bankDetails: {
                      ...profile.bankDetails,
                      ifscCode: e.target.value,
                    },
                  })
                }
                className="w-full rounded-xl bg-[#020617] border border-white/10 p-3 text-white"
              />

              <input
                type="text"
                placeholder="Bank Name"
                value={profile.bankDetails?.bankName || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    bankDetails: {
                      ...profile.bankDetails,
                      bankName: e.target.value,
                    },
                  })
                }
                className="w-full rounded-xl bg-[#020617] border border-white/10 p-3 text-white"
              />

              <input
                type="text"
                placeholder="UPI ID"
                value={profile.bankDetails?.upiId || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    bankDetails: {
                      ...profile.bankDetails,
                      upiId: e.target.value,
                    },
                  })
                }
                className="w-full rounded-xl bg-[#020617] border border-white/10 p-3 text-white"
              />

              <div className="flex gap-3">
                <button
                  onClick={saveBankDetails}
                  className="flex-1 rounded-xl bg-green-600 py-3 text-white font-bold"
                >
                  💾 Save Bank Details
                </button>
                <button
                  onClick={() => setIsEditingBank(false)}
                  className="flex-1 rounded-xl bg-white/10 py-3 text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ================= ACTIONS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
