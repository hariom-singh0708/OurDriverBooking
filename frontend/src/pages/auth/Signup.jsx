import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signupEmail } from "../../services/auth.api";

export default function Signup() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await signupEmail(email);
    navigate("/verify-otp", { state: { email } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-96 p-6 shadow rounded space-y-4"
      >
        <h2 className="text-2xl font-bold">Signup</h2>

        <input
          type="email"
          placeholder="Enter Email"
          className="w-full border p-2"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button className="w-full bg-black text-white p-2">
          Send OTP
        </button>
      </form>
    </div>
  );
}
