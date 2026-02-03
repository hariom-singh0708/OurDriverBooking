import { useEffect, useState, useContext } from "react";
import { SocketContext } from "../../context/SocketContext";
import { getSOSList, resolveSOS } from "../../services/sos.admin.api";
import {
  AlertCircle,
  History,
  CheckCircle2,
  Phone,
  Navigation,
  ShieldAlert,
} from "lucide-react";

/* ---------------- helpers ---------------- */
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
    if (sirenCtx.state === "suspended") sirenCtx.resume();
    const osc = sirenCtx.createOscillator();
    const gain = sirenCtx.createGain();
    osc.type = "sawtooth";
    osc.connect(gain);
    gain.connect(sirenCtx.destination);
    gain.gain.setValueAtTime(0.0001, sirenCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.15,
      sirenCtx.currentTime + 0.05
    );
    const t0 = sirenCtx.currentTime;
    osc.frequency.setValueAtTime(650, t0);
    osc.frequency.linearRampToValueAtTime(1100, t0 + 0.45);
    osc.frequency.linearRampToValueAtTime(650, t0 + 0.9);
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
        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          sirenCtx.currentTime + 0.05
        );
        osc.stop(sirenCtx.currentTime + 0.06);
      } catch {}
    }, ms);
  } catch (e) {
    console.log(e);
  }
}

// ✅ small helper to sanitize tel:
function telHref(mobile) {
  if (!mobile) return null;
  const clean = String(mobile).replace(/[^\d+]/g, "");
  return clean ? `tel:${clean}` : null;
}

export default function AdminSOS() {
  const { socket } = useContext(SocketContext);
  const [live, setLive] = useState([]);
  const [list, setList] = useState([]);

  const load = async () => {
    const res = await getSOSList();
    setList(res.data || []);
  };

  useEffect(() => {
    load();
  }, []);

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
    <div className="p-4 sm:p-8 bg-[#FBF9F6] min-h-screen space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <span className="text-[#C05D38] text-[10px] font-black uppercase tracking-[0.4em]">
            Emergency Response
          </span>
          <h1 className="text-3xl font-black text-stone-900 tracking-tighter uppercase mt-1 flex items-center gap-3">
            SOS Control Center
          </h1>
        </div>
      </div>

      {/* 🔴 LIVE ALERTS SECTION */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-red-600 animate-ping" />
          <h2 className="text-xs font-black uppercase tracking-widest text-red-600">
            Active Live Emergencies
          </h2>
        </div>

        {!live.length && (
          <div className="bg-white border border-stone-100 rounded-2xl p-8 text-center shadow-sm">
            <ShieldAlert className="mx-auto text-stone-200 mb-3" size={32} />
            <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest">
              No active alerts at this time
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {live.map((s) => {
            // ✅ LIVE payload me mobile alag naming ho sakti hai — safe fallbacks
            const mobile =
              s?.triggeredBy?.mobile ||
              s?.user?.mobile ||
              s?.mobile ||
              s?.phone ||
              s?.contact;

            const href = telHref(mobile);

            return (
              <div
                key={s._local}
                className="bg-white border-l-4 border-red-600 p-5 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-4 duration-500"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-red-100">
                    {s.role} triggered
                  </span>
                  <span className="text-[10px] text-stone-400 font-bold">
                    {formatTime(s.time)}
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-stone-500 uppercase tracking-tighter">
                    Ride ID
                  </p>
                  <p className="font-mono text-stone-900 font-black tracking-widest">
                    #{s.rideId?.slice(-6)}
                  </p>
                </div>

                {/* ✅ Direct call button for the person who pressed SOS */}
                {href ? (
                  <a
                    href={href}
                    className="mt-4 w-full py-3 bg-stone-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 hover:bg-stone-800 transition-all"
                  >
                    <Phone size={14} className="text-[#C05D38]" />
                    Call SOS Trigger ({mobile})
                  </a>
                ) : (
                  <div className="mt-4 w-full py-3 bg-stone-100 text-stone-400 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center">
                    No phone available
                  </div>
                )}

                <button className="mt-3 w-full py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-200">
                  Acknowledge Alert
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 📜 HISTORY SECTION */}
      <div className="bg-white border border-stone-100 rounded-[2rem] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-50 flex items-center gap-3 bg-[#F9F6F0]/30">
          <History size={18} className="text-stone-400" />
          <h2 className="text-sm font-black text-stone-900 uppercase tracking-tight">
            SOS Incident History
          </h2>
        </div>

        <div className="divide-y divide-stone-50">
          {list.map((s) => {
            const ride = s.rideId || {};
            const user = s.triggeredBy || {};
            const href = telHref(user.mobile);

            return (
              <div
                key={s._id}
                className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center hover:bg-[#F9F6F0]/10 transition-colors"
              >
                {/* RIDE INFO */}
                <div className="md:col-span-4 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-stone-900 uppercase tracking-tighter">
                      Ride #{ride._id?.slice(-6)}
                    </span>
                    <span className="text-[9px] text-stone-400 font-bold">
                      {formatTime(s.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-stone-500">
                    <Navigation size={12} className="mt-0.5 shrink-0" />
                    <p className="text-[11px] leading-relaxed font-medium">
                      {ride.pickupLocation?.address || "—"} <br />
                      <span className="text-[#C05D38]">→</span>{" "}
                      {ride.dropLocation?.address || "—"}
                    </p>
                  </div>
                </div>

                {/* USER INFO */}
                <div className="md:col-span-4 space-y-1">
                  <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                    Triggered By
                  </div>
                  <div className="text-sm font-bold text-stone-900">
                    {user.name}{" "}
                    <span className="text-[10px] font-black text-[#C05D38] ml-2">
                      ({s.role})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-stone-500">
                      <Phone size={12} />
                      <span className="text-xs font-bold">{user.mobile}</span>
                    </div>

                    {/* ✅ Direct call option in history too */}
                    {href && (
                      <a
                        href={href}
                        className="ml-auto px-4 py-2 rounded-xl bg-stone-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-stone-800 transition-all shadow-md active:scale-95 flex items-center gap-2"
                      >
                        <Phone size={12} className="text-[#C05D38]" />
                        Call
                      </a>
                    )}
                  </div>
                </div>

                {/* STATUS & ACTION */}
                <div className="md:col-span-4 flex flex-row md:flex-col justify-between items-center md:items-end gap-3">
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${
                      s.resolved
                        ? "bg-green-50 text-green-600 border-green-100"
                        : "bg-red-50 text-red-600 border-red-100 animate-pulse"
                    }`}
                  >
                    {s.resolved ? (
                      <CheckCircle2 size={10} />
                    ) : (
                      <AlertCircle size={10} />
                    )}
                    {s.resolved ? "Resolved" : "Awaiting Action"}
                  </div>

                  {!s.resolved && (
                    <button
                      onClick={() => resolve(s._id)}
                      className="bg-stone-900 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-stone-800 transition-all active:scale-95"
                    >
                      Resolve Case
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {!list.length && (
            <div className="p-12 text-center text-stone-400 text-xs font-bold uppercase tracking-widest">
              Secure Environment: No history found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
