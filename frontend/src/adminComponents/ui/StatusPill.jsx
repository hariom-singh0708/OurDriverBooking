export default function StatusPill({ value }) {
  const v = String(value || "").toUpperCase();
  const map = {
    REQUESTED: "bg-gray-100 text-gray-700",
    DISPATCHING: "bg-yellow-100 text-yellow-800",
    ACCEPTED: "bg-blue-100 text-blue-700",
    ARRIVED: "bg-purple-100 text-purple-700",
    ON_RIDE: "bg-indigo-100 text-indigo-700",
    COMPLETED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${map[v] || "bg-gray-100 text-gray-700"}`}>
      {v || "—"}
    </span>
  );
}
