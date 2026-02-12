// src/pages/auth/Signup.jsx
import { useState, useContext, useRef } from "react";
import { signupEmail, verifySignupOTP } from "../../services/auth.api";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [step, setStep] = useState("EMAIL");
  const [email, setEmail] = useState("");
  const [otpValues, setOtpValues] = useState(Array(6).fill(""));

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    password: "",
    role: "client",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  /* ---------------- VALIDATION ---------------- */
  const validateEmail = () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateDetails = () => {
    if (form.name.trim().length < 3) return "Name must be at least 3 characters";
    if (!/^[6-9]\d{9}$/.test(form.mobile)) return "Enter valid 10-digit mobile number";
    if (form.password.length < 6) return "Password must be at least 6 characters";
    return null;
  };

  /* ---------------- HANDLERS ---------------- */
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    if (!validateEmail()) return setError("Please enter a valid email address");
    try {
      setLoading(true);
      await signupEmail(email);
      setStep("OTP");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    const fullOtp = otpValues.join("");
    if (fullOtp.length !== 6) return setError("OTP must be 6 digits");
    setStep("DETAILS");
  };

  const handleCompleteSignup = async (e) => {
    e.preventDefault();
    setError("");
    const validationError = validateDetails();
    if (validationError) return setError(validationError);
    try {
      setLoading(true);
      const res = await verifySignupOTP({
        email,
        otp: otpValues.join(""),
        ...form,
      });
      login(res.data.data.token, res.data.data.role);
      res.data.data.role === "client" ? navigate("/client") : navigate("/driver");
    } catch (err) {
      setError(err?.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url('/cab5.webp')` }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>

      <div className="relative w-full max-w-sm sm:max-w-md rounded-[2.5rem] 
                      bg-black/40 backdrop-blur-2xl border border-white/10 
                      shadow-2xl p-6 sm:p-10 text-white transition-all 
                      duration-500 overflow-hidden">

        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold">
            Driver<span className="text-brand">Book</span>
          </h1>
          <p className="text-[10px] sm:text-xs text-white/50 mt-1 uppercase tracking-widest font-light">
            Trusted drivers. Your car.
          </p>
        </div>

        <StepIndicator step={step} />

        {error && (
          <div className="mt-6 text-[10px] sm:text-[11px] bg-red-500/10 border border-red-500/30 text-red-200 p-3 rounded-xl text-center animate-shake">
            {error}
          </div>
        )}

        {/* STEP 1: EMAIL */}
        {step === "EMAIL" && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <form className="mt-8 space-y-6">
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-white ml-1">Email Address</label>
                <GlassInput type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <PrimaryButton loading={loading} onClick={handleSendOTP}>Send OTP</PrimaryButton>
            </form>
          </div>
        )}

        {/* STEP 2: OTP */}
        {step === "OTP" && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <form className="mt-8 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[9px] uppercase tracking-widest text-white">Enter 6-digit Code</label>
                  <button type="button" onClick={() => setStep("EMAIL")} className="text-[9px] font-bold text-brand hover:text-brand">Change Email</button>
                </div>
                <OTPBox values={otpValues} onChange={setOtpValues} />
              </div>
              <PrimaryButton loading={loading} onClick={handleVerifyOTP}>Verify OTP</PrimaryButton>
            </form>
          </div>
        )}

        {/* STEP 3: DETAILS */}
        {step === "DETAILS" && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <form className="mt-8 space-y-4">
              <label className="text-[9px] uppercase tracking-widest text-white">Full Name</label>

              <GlassInput placeholder="Full Name" onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <label className="text-[9px] uppercase tracking-widest text-white">Mobile Number</label>

              <GlassInput placeholder="Mobile Number" onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
              <label className="text-[9px] uppercase tracking-widest text-white">Create Password</label>

              <GlassInput type="password" placeholder="Create Password" onChange={(e) => setForm({ ...form, password: e.target.value })} />

              <div className="flex justify-center gap-2 mt-2">

                <RoleButton active={form.role === "client"} onClick={() => setForm({ ...form, role: "client" })}>Client</RoleButton>
                <RoleButton active={form.role === "driver"} onClick={() => setForm({ ...form, role: "driver" })}>Driver</RoleButton>
              </div>

              <PrimaryButton loading={loading} onClick={handleCompleteSignup}>Register</PrimaryButton>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- UI COMPONENTS ---------------- */

function OTPBox({ values, onChange }) {
  const inputs = useRef([]);
  const handleChange = (e, index) => {
    const val = e.target.value;
    if (isNaN(val)) return;
    const newValues = [...values];
    newValues[index] = val.substring(val.length - 1);
    onChange(newValues);
    if (val && index < 5) inputs.current[index + 1].focus();
  };
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !values[index] && index > 0) inputs.current[index - 1].focus();
  };
  return (
    <div className="flex justify-between gap-1 sm:gap-2">
      {values.map((v, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          type="text"
          maxLength="1"
          value={v}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          className="w-9 h-11 sm:w-12 sm:h-14 rounded-lg bg-black/30 border border-white/10 
                     text-center text-lg font-bold text-brand focus:outline-none 
                     focus:ring-2 focus:ring-[#A9564B] transition-all"
        />
      ))}
    </div>
  );
}

function GlassInput(props) {
  return (
    <input
      {...props}
      required
      className="w-full h-12 rounded-xl bg-black/20 border border-white/5
      px-4 placeholder:text-white/10 focus:outline-none focus:ring-1
      focus:ring-[#A9564B] focus:border-brand transition-all text-white text-sm"
    />
  );
}

function PrimaryButton({ children, loading, ...props }) {
  return (
    <div className="flex justify-center w-full">
      <button
        {...props}
        disabled={loading}
        className="w-[50%] sm:w-[50%] h-10 rounded-2xl bg-brand hover:bg-brand 
                   text-white font-bold tracking-widest uppercase text-xs md:text-sm
                   transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? "Please wait..." : children}
      </button>
    </div>
  );
}


function RoleButton({ active, children, ...props }) {
  return (
    <button
      {...props}
      type="button"
      className={`px-4 h-8 rounded-lg text-[9px] uppercase tracking-widest font-black transition-all duration-300
        ${active ? "bg-brand text-white shadow-xl" : "text-white/30 hover:text-white bg-black/20"}
      `}
    >
      {children}
    </button>
  );
}


function StepIndicator({ step }) {
  const steps = ["EMAIL", "OTP", "DETAILS"];
  return (
    <div className="mt-8 relative flex justify-between items-center px-4">
      <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10 z-0"></div>
      {steps.map((s) => (
        <div
          key={s}
          className="relative z-10 px-3 rounded-full transition-all duration-700"
          style={{ background: 'rgb(24, 24, 27)' }}
        >
          <span className={`text-[8px] sm:text-[9px] uppercase tracking-[0.2em] transition-all duration-500 block ${step === s ? "text-brand font-black scale-110" : "text-white/20"
            }`}>
            {s}
          </span>
        </div>
      ))}
    </div>
  );
}