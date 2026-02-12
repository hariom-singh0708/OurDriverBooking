// src/pages/auth/Login.jsx
import { useState, useContext, useRef, useEffect } from "react";
import { loginUser, sendLoginOTP } from "../../services/auth.api";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [otpValues, setOtpValues] = useState(Array(6).fill(""));
  const [loginByOTP, setLoginByOTP] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const redirectUser = (res) => {
 const token = res.data.data.token;
  const role = res.data.data.role;

  login(token); // ✅ only token    const role = res.data.data.role;
    if (role === "client") navigate("/client");
    else if (role === "driver") navigate("/driver");
    else if (role === "admin") navigate("/admin/dashboard");
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await loginUser({ email: form.email, password: form.password });
      await redirectUser(res);
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!form.email) return setError("Please enter your email first");
    setLoading(true);
    setError("");
    try {
      await sendLoginOTP(form.email);
    } catch {
      setError("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPLogin = async (e) => {
    e.preventDefault();
    const fullOtp = otpValues.join("");
    if (fullOtp.length < 6) return setError("Please enter the full code");
    
    setLoading(true);
    setError("");
    try {
      const res = await loginUser({ email: form.email, otp: fullOtp });
      await redirectUser(res);
    } catch {
      setError("Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 bg-cover bg-center"
      style={{ backgroundImage: `url('/cab5.webp')` }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>

      <div className="relative w-full max-w-[95%] sm:max-w-md rounded-[2.5rem] 
                      bg-white/5 backdrop-blur-md border border-white/10 
                      shadow-2xl p-6 sm:p-10 text-white transition-all 
                      duration-500 hover:bg-black/40 hover:backdrop-blur-2xl hover:border-white/20">
        
        <div className="text-center mb-4 md:mb-8 ">
          <h1 className="text-3xl sm:text-4xl font-bold">
            Driver<span className="text-brand">Book</span>
          </h1>
          <p className="text-xs text-white/50 mt-2 uppercase tracking-widest">Secure Access</p>
        </div>

        <div className="flex bg-black/40 rounded-2xl p-1 border border-white/10 mb-8">
          <ToggleButton active={!loginByOTP} onClick={() => setLoginByOTP(false)}>Password</ToggleButton>
          <ToggleButton active={loginByOTP} onClick={() => setLoginByOTP(true)}>OTP</ToggleButton>
        </div>

        {error && (
          <div className="mb-6 text-[11px] bg-red-500/10 border border-red-500/30 text-red-200 p-3 rounded-xl text-center">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={loginByOTP ? handleOTPLogin : handlePasswordLogin}>
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-white ml-1">Account Email</label>
            <GlassInput name="email" type="email" placeholder="driver@mail.com" value={form.email} onChange={handleChange} />
          </div>

          {!loginByOTP ? (
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-white ml-1">Password</label>
              <GlassInput name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] uppercase tracking-widest text-white/40">6-Digit Code</label>
                <button type="button" onClick={handleSendOTP} className="text-[10px] font-bold text-brand hover:text-brand transition-colors hover:cursor-pointer">
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </div>
              <OTPBox values={otpValues} onChange={setOtpValues} />
            </div>
          )}

          <button
            disabled={loading}
            className="w-full h-14 rounded-2xl bg-brand hover:bg-brand 
                       text-white font-bold tracking-widest uppercase text-sm
                       transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 hover:cursor-pointer"
          >
            {loading ? "Verifying..." : "Sign In"}
          </button>
        </form>
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

    if (val && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !values[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  return (
    <div className="flex justify-between gap-2">
      {values.map((v, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          type="text"
          maxLength="1"
          value={v}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          className="w-10 h-12 sm:w-12 sm:h-14 rounded-xl bg-black/30 border border-white/10 
                     text-center text-lg font-bold text-brand focus:outline-none 
                     focus:ring-2 focus:ring-[#A9564B] focus:border-transparent transition-all"
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

function ToggleButton({ active, children, ...props }) {
  return (
    <button
      {...props}
      type="button"
      className={`flex-1 h-11 rounded-xl text-[10px] uppercase tracking-widest font-black transition-all duration-300 hover:cursor-pointer
        ${active ? "bg-brand text-white shadow-xl" : "text-white/30 hover:text-white hover:bg-white/5"}
      `}
    >
      {children}
    </button>
  );
}