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

  if (!profile) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-black text-white p-4 flex justify-between">
        <h1 className="text-xl">
          Dear, <span className="font-bold">{profile.name}</span>
        </h1>
        <button
          onClick={() => {
            localStorage.clear();
            navigate("/");
          }}
          className="bg-red-500 px-3 py-1 rounded"
        >
          Logout
        </button>
      </header>

      {/* Navigation */}
      <nav className="bg-white p-4 shadow flex gap-4">
        <button className="border px-3 py-1 rounded">Dashboard</button>
        <button
          onClick={() => navigate("/client/book")}
          className="border px-3 py-1 rounded"
        >
          Book Ride
        </button>
        <button className="border px-3 py-1 rounded">Profile</button>
        <button onClick={() => navigate("/client/history")}>
  Ride History
</button>

      </nav>

      {/* Content */}
      <main className="p-6">
        <h2 className="text-lg font-bold mb-4">Ride History</h2>

        {rides.length === 0 ? (
          <p className="text-gray-500">No rides yet</p>
        ) : (
          <ul>
            {rides.map((ride) => (
              <li key={ride._id}>{ride._id}</li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
