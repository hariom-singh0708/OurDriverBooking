import { useState } from "react";
import { submitKYC } from "../../services/kyc.api";
import { useNavigate } from "react-router-dom";

export default function KYC() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);

    await submitKYC(formData);

    alert("KYC submitted");
    navigate("/driver");
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h2 className="text-xl font-bold">Driver KYC</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input name="aadhaarNumber" placeholder="Aadhaar Number" className="input" />
        <input type="file" name="aadhaarImage" />

        <input name="panNumber" placeholder="PAN Number" className="input" />
        <input type="file" name="panImage" />

        <input name="licenseNumber" placeholder="License Number" className="input" />
        <input type="file" name="licenseImage" />

        <input type="file" name="driverPhoto" />

        <textarea
          name="address"
          placeholder="Address"
          className="input"
        />

        <button className="w-full bg-black text-white p-2">
          {loading ? "Submitting..." : "Submit KYC"}
        </button>
      </form>
    </div>
  );
}
