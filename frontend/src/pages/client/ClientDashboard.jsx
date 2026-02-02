import { useEffect, useState } from "react";
import { getClientProfile, getClientRides } from "../../services/client.api";
import { useNavigate } from "react-router-dom";

export default function ClientDashboard() {
  const [profile, setProfile] = useState(null);
  const [rides, setRides] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getClientProfile().then((res) => setProfile(res.data.data));
    getClientRides().then((res) => setRides(res.data.data));
  }, []);

  if (!profile)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] text-gray-400">
        Loading dashboard...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#020617]">
      {/* HEADER */}
      <header className="px-6 py-6">
        <p className="text-sm text-gray-400">Welcome back</p>
        <h1 className="text-2xl font-extrabold text-white">
          {profile.name}
        </h1>
      </header>

      {/* ACTION CARDS */}
      <section className="px-6 py-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <ActionCard
          title="Book a Driver"
          subtitle="New Ride"
          icon="🚗"
          onClick={() => navigate("/client/book")}
        />
        <ActionCard
          title="Ride History"
          subtitle="Past Trips"
          icon="📜"
          onClick={() => navigate("/client/history")}
        />
        <ActionCard
          title="My Profile"
          subtitle="Account"
          icon="👤"
          onClick={() => navigate("/client/profile")}
        />
      </section>

      {/* RECENT RIDES */}
      <div className="px-6 pb-10">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">
            Recent Rides
          </h2>

          {rides.length === 0 ? (
            <p className="text-gray-400">No rides yet</p>
          ) : (
            <ul className="space-y-3">
              {rides.slice(0, 5).map((ride) => (
                <li
                  key={ride._id}
                  className="flex justify-between items-center rounded-xl border border-white/10 p-3 text-gray-300"
                >
                  <span className="font-mono text-sm">
                    {ride._id}
                  </span>
                  <button
                    onClick={() =>
                      navigate(`/client/live/${ride._id}`)
                    }
                    className="text-cyan-400 hover:underline text-sm"
                  >
                    View →
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= CARD ================= */

function ActionCard({ title, subtitle, icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group relative rounded-3xl p-[1px] bg-gradient-to-r from-indigo-600/60 to-cyan-500/60"
    >
      <div className="rounded-3xl bg-[#020617] p-6 text-left shadow-xl group-hover:-translate-y-1 transition">
        <p className="text-sm text-gray-400">{subtitle}</p>
        <p className="text-xl font-bold text-white mt-1">
          {icon} {title}
        </p>
      </div>
    </button>
  );
}
