import { useState, useRef } from "react";

export default function OTPBox({ onSubmit }) {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputs = useRef([]);

  const handleChange = (value, index) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 3) {
      inputs.current[index + 1].focus();
    }

    if (newOtp.every((digit) => digit !== "")) {
      onSubmit(newOtp.join(""));
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-[280px] mx-auto">
      {/* Individual Digit Inputs - Sizes Reduced */}
      <div className="flex gap-2 justify-center">
        {otp.map((digit, index) => (
          <input
            key={index}
            type="text"
            inputMode="numeric"
            ref={(el) => (inputs.current[index] = el)}
            value={digit}
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className="
              w-10 h-12 text-center text-xl font-black
              bg-white text-[#2D1B18]
              border border-slate-200 rounded-xl
              outline-none transition-all duration-300
              focus:border-brand focus:ring-2 focus:ring-[#D27D56]/10
              shadow-sm
            "
          />
        ))}
      </div>

      {/* Manual Submit Button - Made Slim and Compact */}
      <button
        onClick={() => onSubmit(otp.join(""))}
        className="
          w-full py-2.5 rounded-xl
          bg-brand hover:bg-brand
          text-white text-[9px] font-black uppercase tracking-[0.2em]
          shadow-md shadow-[#D27D56]/15
          transition-all active:scale-[0.98]
        "
      >
        Verify Code
      </button>
    </div>
  );
}