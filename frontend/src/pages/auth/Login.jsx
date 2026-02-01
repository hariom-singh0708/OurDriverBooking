import { useState, useContext } from "react";
import { loginUser } from "../../services/auth.api";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({});
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await loginUser(form);
    login(res.data.data.token, res.data.data.role);

    if (res.data.data.role === "client") navigate("/client");
    else navigate("/driver");
  };

  return (
    <div className="min-h-screen flex justify-center items-center">
      <form className="w-96 p-6 shadow space-y-3" onSubmit={handleSubmit}>
        <h2 className="text-xl font-bold">Login</h2>

        <input name="email" placeholder="Email" className="input" onChange={handleChange} />
        <input name="password" placeholder="Password (optional)" className="input" onChange={handleChange} />
        <input name="otp" placeholder="OTP (optional)" className="input" onChange={handleChange} />

        <button className="w-full bg-black text-white p-2">
          Login
        </button>
      </form>
    </div>
  );
}
