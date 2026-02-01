export default function CallButton({ phone }) {
  return (
    <a
      href={`tel:${phone}`}
      className="bg-green-600 text-white px-4 py-1 rounded"
    >
      Call
    </a>
  );
}
