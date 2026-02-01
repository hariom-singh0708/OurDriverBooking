export default function ChoiceSection({ leftImage, smallImage }) {
  return (
    <section className="pb-14">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div className="rounded-md overflow-hidden bg-gray-100 shadow">
            <img
              src={leftImage}
              alt="Traffic city"
              className="h-[360px] md:h-[420px] w-full object-cover"
              loading="lazy"
            />
          </div>

          <div className="pt-2">
            <h2 className="text-2xl md:text-3xl font-extrabold leading-tight">
              Your first choice for
              <br />
              traveling anywhere
            </h2>

            <p className="mt-4 text-gray-600 max-w-md leading-relaxed">
              Move through your city with comfort, speed, and complete confidence.
              Book reliable rides in seconds and enjoy a smooth, stress-free journey
              to your destination—anytime, anywhere you need to go.
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="rounded-md border border-gray-200 p-4 bg-white shadow-sm">
                <div className="text-sm font-semibold">We’re specialized in</div>
                <div className="text-gray-600 text-sm mt-1">
                  providing a high quality service
                </div>
              </div>

              <div className="rounded-md overflow-hidden border border-gray-200 bg-white shadow-sm">
                <img
                  src={smallImage}
                  alt="Taxi"
                  className="h-[120px] w-full object-cover"
                  loading="lazy"
                />
                <div className="p-3 flex items-center justify-between">
                  <div className="text-sm font-semibold text-gray-800">Taxi</div>
                  <button className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-black hover:bg-yellow-300">
                    ▶
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-black" />
              <div>
                <div className="text-xs text-gray-500">Call us now!</div>
                <div className="text-sm font-bold tracking-wide">111 222 8888</div>
              </div>
            </div>

            <div className="mt-6 text-xs text-gray-400">
              Images: Unsplash (loaded via source.unsplash.com)
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
