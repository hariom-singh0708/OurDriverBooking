import { useNavigate, useLocation } from "react-router-dom";

export default function AppNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  // 🔍 role detect from URL
  const isClient = location.pathname.startsWith("/client");
  const isDriver = location.pathname.startsWith("/driver");
  const isAdmin = location.pathname.startsWith("/admin");

  const handleProfileClick = () => {
    if (isClient) navigate("/client/profile");
    else if (isDriver) navigate("/driver/profile");
    else if (isAdmin) navigate("/admin/profile");
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#020617] border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* BRAND */}
        <div
          onClick={() => {
            if (isClient) navigate("/client");
            if (isDriver) navigate("/driver");
            if (isAdmin) navigate("/admin/dashboard");
          }}
          className="text-white font-extrabold text-lg cursor-pointer"
        >
          🚘 DriverBooking
        </div>

        {/* PROFILE ONLY */}
        {(isClient || isDriver ||isAdmin) && (
          <button
            onClick={handleProfileClick}
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-5 py-2 text-white font-semibold hover:opacity-90"
          >
            👤 Profile
          </button>
        )}
      </div>
    </nav>
  );
}
