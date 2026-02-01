import { useContext, useEffect, useState } from "react";
import { SocketContext } from "../../context/SocketContext";
import { getAllSOS, resolveSOS } from "../../services/sos.admin.api";

export default function AdminSOS() {
  const { socket } = useContext(SocketContext);
  const [live, setLive] = useState([]);
  const [list, setList] = useState([]);

  const load = async () => {
    const res = await getAllSOS();
    setList(res.data || []);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("sos_triggered", (data) => {
      setLive((prev) => [data, ...prev]);
    });

    return () => socket.off("sos_triggered");
  }, [socket]);

  const resolve = async (id) => {
    await resolveSOS(id);
    load();
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold">🚨 SOS Alerts</h1>

      {/* LIVE */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="font-bold mb-2">Live Alerts</div>
        {!live.length && <div className="text-gray-600">No live SOS</div>}
        {live.map((s, i) => (
          <div key={i} className="bg-white p-3 rounded-lg shadow mb-2">
            <div className="font-bold text-red-700">Ride: {s.rideId}</div>
            <div className="text-sm">Triggered by: {s.by}</div>
          </div>
        ))}
      </div>

      {/* HISTORY */}
      <div className="bg-white border rounded-xl p-4">
        <div className="font-bold mb-2">SOS History</div>
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th>Ride</th>
              <th>By</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.map((s) => (
              <tr key={s._id} className="border-t">
                <td>{s.rideId}</td>
                <td>{s.by}</td>
                <td>{s.resolved ? "Resolved" : "Open"}</td>
                <td>
                  {!s.resolved && (
                    <button
                      onClick={() => resolve(s._id)}
                      className="bg-black text-white px-3 py-1 rounded"
                    >
                      Resolve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
