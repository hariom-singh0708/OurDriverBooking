import { useState, useEffect, useContext, useRef, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { toggleDriverStatus, getDriverStatus } from "../../services/driver.api";
import { Power, User, LogOut, ChevronDown, Menu, X, ShieldCheck } from "lucide-react";
import { DriverStatusContext } from "../../context/DriverStatusContext";

function readJSON(key) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useContext(AuthContext);

  const isClient = location.pathname.startsWith("/client");
  const isDriver = location.pathname.startsWith("/driver");
  const isAdmin = location.pathname.startsWith("/admin");

  const isLandingOrAuth =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/signup";

  const { driverOnline, setDriverOnline } = useContext(DriverStatusContext);
  const [statusLoading, setStatusLoading] = useState(false);

  const currentRole = isClient ? "Client" : isDriver ? "Driver" : isAdmin ? "Admin" : null;

  // ✅ Fallback user from storage (so name shows instantly)
  const storedUser = useMemo(() => readJSON("user"), []);
  const displayUser = user || storedUser;

  // ✅ Close dropdown on route change / role change / user change
  useEffect(() => {
    setProfileOpen(false);
    setMenuOpen(false);
  }, [location.pathname, currentRole, displayUser?._id, displayUser?.id]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!isDriver || !token) return;

    const loadStatus = async () => {
      try {
        const res = await getDriverStatus();
        setDriverOnline(res.data.data.isOnline);
      } catch {
        setDriverOnline(false);
      }
    };

    loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDriver]);

  const toggleDriverOnlineStatus = async () => {
    try {
      setStatusLoading(true);
      const res = await toggleDriverStatus({
        isOnline: !driverOnline,
        lat: 28.6,
        lng: 77.2,
      });
      setDriverOnline(res.data.data.isOnline);
    } catch (err) {
      console.log("Failed to toggle status");
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBrandClick = () => {
    if (isClient) navigate("/client");
    else if (isDriver) navigate("/driver");
    else if (isAdmin) navigate("/admin/dashboard");
    else navigate("/");
  };

  const handleProfileClick = () => {
    const path = isClient ? "/client/profile" : isDriver ? "/driver/profile" : "/admin/profile";
    navigate(path);
    setProfileOpen(false);
  };

  const handleLogout = () => {
    setProfileOpen(false);
    setMenuOpen(false);
    logout();
    navigate("/");
  };

  const getNavbarStyles = () => {
    if (isLandingOrAuth) {
      return scrolled
        ? "fixed top-0 left-0 bg-white border-[#F4E9E2] shadow-md py-2"
        : "fixed top-0 left-0 bg-white/20 border-transparent py-2";
    }
    return "sticky top-0 left-0 bg-[#FAF8F6] border-[#EBD9D0] py-3 shadow-sm";
  };

  return (
    <header className={`w-full z-[100] transition-all duration-500 border-b group ${getNavbarStyles()}`}>
      {/* NOISE TEXTURE LAYER (CSS BASE) */}
      {!isLandingOrAuth || scrolled ? (
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.05] mix-blend-multiply"
          style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/p6.png')` }}
        ></div>
      ) : null}

      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 relative z-10">
        {/* LOGO */}
        <div onClick={handleBrandClick} className="flex items-center gap-3 group/logo cursor-pointer">
          <div className="h-10 w-12 bg-brand rounded-[15px] flex items-center justify-center transition-all duration-500 group-hover/logo:scale-110 shadow-lg shadow-[#BC6641]/20">
            <span className="text-xl">🚕</span>
          </div>

          <div className="flex flex-col -space-y-1">
            <span
              className={`text-xl font-serif font-bold tracking-tight transition-colors duration-300 ${
                !scrolled && isLandingOrAuth ? "text-brand" : "text-[#2D2421]"
              }`}
            >
              DRIVER<span className={` italic font-medium ${
                !scrolled && isLandingOrAuth ? "text-white" : "text-brand"
              }`}>BOOK</span>
            </span>
          </div>
        </div>

        {/* PUBLIC NAVIGATION */}
        {!currentRole && (
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/"
              className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                !scrolled && isLandingOrAuth ? "text-brand" : "text-[#BC6641]"
              } hover:opacity-60`}
            >
              Home
            </Link>
            <Link
              to="/about"
              className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                !scrolled && isLandingOrAuth ? "text-brand" : "text-[#BC6641]"
              } hover:opacity-60`}
            >
              About Us
            </Link>

            <Link
              to="/contact"
              className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                !scrolled && isLandingOrAuth ? "text-brand" : "text-[#BC6641]"
              } hover:opacity-60`}
            >
              Contact
            </Link>

            <Link
              to="/services"
              className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                !scrolled && isLandingOrAuth ? "text-brand" : "text-[#BC6641]"
              } hover:opacity-60`}
            >
              Services
            </Link>

            <Link
              to="/login"
              className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                !scrolled && isLandingOrAuth ? "text-brand" : "text-[#BC6641]"
              } hover:opacity-60`}
            >
              Sign In
            </Link>

            <Link
              to="/signup"
              className="rounded-2xl bg-brand px-8 py-3.5 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-black/10 transition-all duration-300 hover:bg-[hsl(18,49%,50%)] hover:-translate-y-0.5"
            >
              Register
            </Link>
          </div>
        )}

        {/* LOGGED IN SECTION */}
        {currentRole && (
          <div className="relative flex items-center gap-4" ref={dropdownRef}>
            {isDriver && (
              <button
                onClick={toggleDriverOnlineStatus}
                disabled={statusLoading || driverOnline === null}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all border duration-300 ${
                  driverOnline
                    ? "bg-emerald-50 border-emerald-100 text-emerald-700 shadow-sm"
                    : "bg-white border-[#F4E9E2] text-[#8E817C]"
                } hover:scale-105 active:scale-95`}
              >
                <div className={`h-1.5 w-1.5 rounded-full ${driverOnline ? "bg-emerald-500 animate-pulse" : "bg-gray-300"}`} />
                <span className="text-[9px] font-black uppercase tracking-widest hidden sm:block">
                  {statusLoading ? "Wait" : driverOnline ? "Online" : "Offline"}
                </span>
                {!statusLoading && <Power size={13} className={driverOnline ? "text-emerald-600" : "text-gray-400"} />}
              </button>
            )}

            <div
              onClick={(e) => {
                e.stopPropagation();
                setProfileOpen((v) => !v);
              }}
              className="flex items-center gap-3 pl-3 pr-2 py-1.5 bg-white border border-[#F4E9E2] rounded-full cursor-pointer hover:shadow-md transition-all duration-300 group"
            >
              <div className="flex flex-col items-end hidden sm:flex">
                <p className="text-[10px] font-bold text-[#2D2421] leading-none tracking-tight">
                  {displayUser?.name || "User"}
                </p>
                <p className="text-[7px] font-black uppercase tracking-widest text-[#BC6641] mt-0.5">
                  {currentRole}
                </p>
              </div>

              <div className="h-8 w-8 bg-[#BC6641] rounded-full flex items-center justify-center text-white font-bold border-2 border-white shadow-md overflow-hidden transition-transform group-hover:rotate-12">
                {displayUser?.profileImage ? (
                  <img src={displayUser.profileImage} alt="profile" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs">
                    {displayUser?.name ? displayUser.name.charAt(0).toUpperCase() : currentRole?.charAt(0)}
                  </span>
                )}
              </div>

              <ChevronDown size={14} className={`text-gray-400 transition-transform duration-500 ${profileOpen ? "rotate-180" : ""}`} />
            </div>

            {/* DROPDOWN MENU */}
            {profileOpen && (
              <div className="absolute right-0 top-[60px] w-60 bg-white rounded-[2rem] shadow-2xl border border-[#F4E9E2] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="px-7 py-6 border-b border-[#FAF8F6] bg-[#FAF8F6]">
                  <p className="text-sm font-bold text-[#2D2421] tracking-tight">
                    {displayUser?.name || "User"}
                  </p>
                  <p className="text-[8px] text-[#BC6641] uppercase font-black tracking-[0.2em] mt-1.5 flex items-center gap-1.5">
                    <ShieldCheck size={11} /> Authorized {currentRole}
                  </p>
                </div>
                <div className="p-3 text-[#6B5E59]">
                  <button
                    onClick={handleProfileClick}
                    className="w-full flex items-center gap-3 px-5 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-[#FAF8F6] hover:text-[#BC6641] rounded-2xl transition-all"
                  >
                    <User size={15} /> My Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-red-400 hover:bg-red-50 rounded-2xl transition-all"
                  >
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MOBILE MENU */}
        {!currentRole && (
          <button className="md:hidden p-2 rounded-xl text-[#BC6641]" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        )}
      </div>

      {/* MOBILE NAVIGATION DROPDOWN */}
      {menuOpen && (
        <div className="md:hidden absolute top-[68px] right-6 left-6 bg-white rounded-[2.5rem] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.15)] border border-[#F4E9E2] z-[100] p-4 flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex flex-col gap-1">
            {[
              { name: "Home", path: "/" },
              { name: "About Us", path: "/about" },
              { name: "Services", path: "/services" },
              { name: "Contact", path: "/contact" },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className="px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-[#2D2421] hover:bg-[#FAF8F6] active:bg-[#BC6641]/10 transition-all flex items-center justify-between group"
              >
                {item.name}
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[#BC6641]">→</span>
              </Link>
            ))}
          </div>

          <div className="h-px bg-[#F4E9E2] mx-4 my-2" />

          <div className="flex flex-col gap-2 p-1">
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="text-center py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#BC6641] bg-[#FAF8F6]"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              onClick={() => setMenuOpen(false)}
              className="text-center py-4 bg-brand text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#a9564b]/20"
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
