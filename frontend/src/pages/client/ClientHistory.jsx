import { useEffect, useState } from "react";
import { getClientHistory } from "../../services/history.api";
import RideSummary from "../common/RideSummary";

export default function ClientHistory() {
  const [rides, setRides] = useState([]);

  useEffect(() => {
    getClientHistory().then((res) => setRides(res.data.data));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#020617] p-6">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Ride History
            </h1>
            <p className="text-gray-400 mt-1">
              Your journey, beautifully tracked
            </p>
          </div>

          <div className="bg-gradient-to-r from-indigo-600 to-cyan-500 px-6 py-4 rounded-2xl shadow-lg">
            <p className="text-xs uppercase text-white/80">Total Rides</p>
            <p className="text-3xl font-extrabold text-white">
              {rides.length}
            </p>
          </div>
        </div>

        {/* EMPTY STATE */}
        {rides.length === 0 && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-16 text-center shadow-xl">
            <div className="text-6xl mb-4">🛣️</div>
            <h2 className="text-2xl font-bold text-white">
              No rides yet
            </h2>
            <p className="text-gray-400 mt-2 max-w-md mx-auto">
              Once you book your first driver, your ride history will
              appear here with full details and status.
            </p>
          </div>
        )}

        {/* RIDES GRID */}
        {rides.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rides.map((ride) => (
              <div
                key={ride._id}
                className="group relative rounded-3xl p-[1px] bg-gradient-to-r from-indigo-600/60 to-cyan-500/60"
              >
                <div className="h-full rounded-3xl bg-[#020617] p-6 shadow-xl transition-transform duration-300 group-hover:-translate-y-1">
                  {/* Accent header */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs uppercase tracking-wider text-cyan-400">
                      Completed Ride
                    </span>
                    <span className="text-xs text-gray-500">
                      ID: {ride._id.slice(-6)}
                    </span>
                  </div>

                  {/* Ride Summary (logic untouched) */}
                  <RideSummary ride={ride} />

                  {/* Footer hint */}
                  <div className="mt-4 flex items-center justify-end">
                    <span className="text-xs text-gray-500 group-hover:text-cyan-400 transition">
                      View details →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
