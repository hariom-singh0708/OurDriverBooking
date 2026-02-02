import { useEffect, useState, useContext } from "react";
import { SocketContext } from "../../context/SocketContext";
import { getSOSList, resolveSOS } from "../../services/sos.admin.api";

function formatTime(t) {
  return new Date(t).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
let sirenCtx;

function playSiren(ms = 2200) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    sirenCtx = sirenCtx || new AudioCtx();

    // required on some browsers if audio context suspended
    if (sirenCtx.state === "suspended") sirenCtx.resume();

    const osc = sirenCtx.createOscillator();
    const gain = sirenCtx.createGain();

    osc.type = "sawtooth";
    osc.connect(gain);
    gain.connect(sirenCtx.destination);

    // gentle volume
    gain.gain.setValueAtTime(0.0001, sirenCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.15, sirenCtx.currentTime + 0.05);

    // siren pitch sweep
    const t0 = sirenCtx.currentTime;
    osc.frequency.setValueAtTime(650, t0);
    osc.frequency.linearRampToValueAtTime(1100, t0 + 0.45);
    osc.frequency.linearRampToValueAtTime(650, t0 + 0.9);

    // repeat sweep quickly by automation
    const repeats = Math.max(2, Math.floor(ms / 900));
    for (let i = 1; i < repeats; i++) {
      const t = t0 + i * 0.9;
      osc.frequency.setValueAtTime(650, t);
      osc.frequency.linearRampToValueAtTime(1100, t + 0.45);
      osc.frequency.linearRampToValueAtTime(650, t + 0.9);
    }

    osc.start();

    setTimeout(() => {
      try {
        gain.gain.exponentialRampToValueAtTime(0.0001, sirenCtx.currentTime + 0.05);
        osc.stop(sirenCtx.currentTime + 0.06);
      } catch {}
    }, ms);
  } catch (e) {
    // fallback: do nothing
    console.log(e)
  }
}
 
export default function AdminSOS() {
  const { socket } = useContext(SocketContext);
  const [live, setLive] = useState([]);
  const [list, setList] = useState([]);

  const load = async () => {
    const res = await getSOSList();
    setList(res.data || []);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("sos_triggered", (data) => {
        playSiren();
      setLive((prev) => [{ ...data, _local: Date.now() }, ...prev]);
    });
    return () => socket.off("sos_triggered");
  }, [socket]);

  const resolve = async (id) => {
    await resolveSOS(id);
    load();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      <h1 className="text-2xl font-extrabold text-red-700">🚨 SOS Control Center</h1>

      {/* 🔴 LIVE ALERTS */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <h2 className="font-bold text-red-800 mb-3">Live SOS Alerts</h2>
        {!live.length && <div className="text-red-600">No active alerts</div>}
        {live.map((s) => (
          <div key={s._local} className="bg-white border-l-4 border-red-600 p-4 rounded mb-3 shadow">
            <div className="font-bold text-red-700">
              {s.role?.toUpperCase()} triggered SOS
            </div>
            <div className="text-sm mt-1">
              Ride: <b>{s.rideId}</b>
            </div>
            <div className="text-xs text-gray-500">
              {formatTime(s.time)}
            </div>
          </div>
        ))}
      </div>

      {/* 📜 HISTORY */}
      <div className="bg-white border rounded-xl shadow-sm">
        <div className="p-4 border-b font-bold">SOS History</div>

        {list.map((s) => {
          const ride = s.rideId || {};
          const user = s.triggeredBy || {};

          return (
            <div key={s._id} className="border-b p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* LEFT */}
              <div>
                <div className="font-bold text-gray-900">
                  Ride #{ride._id?.slice(-6)}
                </div>
                <div className="text-sm text-gray-600">
                  {ride.pickupLocation?.address || "Unknown pickup"} → {ride.dropLocation?.address || "Unknown drop"}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatTime(s.createdAt)}
                </div>
              </div>

              {/* MIDDLE */}
              <div>
                <div className="font-semibold">
                  Triggered by: {user.name}
                </div>
                <div className="text-sm text-gray-600">
                  Role: {s.role}
                </div>
                <div className="text-sm text-gray-600">
                  Phone: {user.mobile}
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex flex-col justify-between items-end">
                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    s.resolved
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {s.resolved ? "Resolved" : "Open"}
                </div>

                {!s.resolved && (
                  <button
                    onClick={() => resolve(s._id)}
                    className="mt-3 bg-black text-white px-4 py-2 rounded-lg"
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {!list.length && (
          <div className="p-6 text-center text-gray-500">
            No SOS history
          </div>
        )}
      </div>
    </div>
  );
}
