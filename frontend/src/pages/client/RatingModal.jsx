export default function RatingModal({
  showRating,
  setShowRating,
  driver,
  rating,
  setRating,
  feedback,
  setFeedback,
  submitRating,
  navigate,
}) {
  if (!showRating) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#2D1B18]/40 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="relative bg-white rounded-[3rem] p-8 md:p-10 w-full max-w-sm text-center shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300">

        <button
          onClick={() => {
            setShowRating(false);
            navigate("/client");
          }}
          className="absolute top-6 right-6 h-8 w-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-[#FFF1EC] hover:text-brand transition-all active:scale-90"
        >
          ✕
        </button>

        <div className="text-4xl mb-4">🎉</div>

        <h3 className="text-xl font-black text-[#2D1B18] uppercase mb-6">
          Ride Completed
        </h3>

        {driver && (
          <div className="mb-6 space-y-2">
            <img
              src={driver.profileImage || driver.photo}
              className="w-20 h-20 rounded-[2rem] mx-auto object-cover"
              alt={driver.name}
            />
            <p className="text-sm font-black uppercase">
              {driver.name}
            </p>
          </div>
        )}

        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              onClick={() => setRating(s)}
              className={`text-3xl ${
                s <= rating ? "text-brand scale-110" : "text-slate-200"
              }`}
            >
              ★
            </button>
          ))}
        </div>

        <textarea
          placeholder="Share your experience..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="w-full bg-slate-50 rounded-2xl p-3 text-xs mb-4 outline-none"
          rows={3}
        />

        <button
          onClick={submitRating}
          className="w-full bg-[#2D1B18] text-white py-4 rounded-[2rem] text-[10px] font-black uppercase shadow-lg hover:bg-brand transition-all active:scale-95"
        >
          Submit Feedback
        </button>
      </div>
    </div>
  );
}
