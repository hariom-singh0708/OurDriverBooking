export default function Hero({ image }) {
  return (
    <section className="relative">
      <div
        className="relative h-[340px] md:h-[420px] w-full bg-center bg-cover"
        style={{ backgroundImage: `url(${image})` }}
      >
        <div className="absolute inset-0 bg-black/35" />

        <div className="relative mx-auto max-w-6xl px-4 h-full flex items-center">
          <div className="max-w-lg">
            <h1 className="text-white text-3xl md:text-4xl font-extrabold italic leading-tight drop-shadow">
              Go anywhere,
              <br />
              without the wait
            </h1>

            <button className="mt-6 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black shadow hover:bg-white/90">
              Book Rides
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
