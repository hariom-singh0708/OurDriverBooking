import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verifySignupOTP } from "../../services/auth.api";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function VerifyOTP() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    password: "",
    role: "client",
    otp: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await verifySignupOTP({
      ...form,
      email: state.email,
    });

    login(res.data.data.token, res.data.data.role);

    if (res.data.data.role === "client") navigate("/client");
    else navigate("/driver");
  };

  return (
    <div className="min-h-screen flex justify-center items-center">
      <form className="w-96 p-6 shadow space-y-3" onSubmit={handleSubmit}>
        <h2 className="text-xl font-bold">Verify OTP</h2>

        <input name="otp" placeholder="OTP" className="input" onChange={handleChange} />
        <input name="name" placeholder="Name" className="input" onChange={handleChange} />
        <input name="mobile" placeholder="Mobile" className="input" onChange={handleChange} />
        <input name="password" type="password" placeholder="Password" className="input" onChange={handleChange} />

        <select name="role" onChange={handleChange} className="input">
          <option value="client">Client</option>
          <option value="driver">Driver</option>
        </select>

        <button className="w-full bg-black text-white p-2">
          Complete Signup
        </button>
      </form>
    </div>
  );
}
