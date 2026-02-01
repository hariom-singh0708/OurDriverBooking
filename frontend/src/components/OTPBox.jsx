import { useState } from "react";

export default function OTPBox({ onSubmit }) {
  const [otp, setOtp] = useState("");

  return (
    <div className="space-y-3">
      <input
        placeholder="Enter 4-digit OTP"
        className="border p-2 w-full"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />

      <button
        onClick={() => onSubmit(otp)}
        className="w-full bg-black text-white p-2"
      >
        Verify OTP & Start Ride
      </button>
    </div>
  );
}
