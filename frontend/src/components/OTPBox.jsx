import { useState } from "react";

export default function OTPBox({ onSubmit }) {
  const [otp, setOtp] = useState("");

  return (
    <div className="space-y-4">
      <input
        type="text"
        inputMode="numeric"
        maxLength={4}
        placeholder="Enter 4-digit OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        className="
          w-full px-4 py-2
          bg-gray-800 text-gray-100
          border border-gray-700 rounded-lg
          text-center tracking-widest text-lg
          placeholder-gray-500
          focus:outline-none focus:ring-2 focus:ring-blue-600
        "
      />

      <button
        onClick={() => onSubmit(otp)}
        className="
          w-full py-2 rounded-lg
          bg-blue-600 hover:bg-blue-700
          text-white font-semibold
          transition
        "
      >
        Verify OTP & Start Ride
      </button>
    </div>
  );
}
