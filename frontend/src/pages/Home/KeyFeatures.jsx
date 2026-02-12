import React from "react";
import chat from "../../assets/chat.png";
import journey from "../../assets/journey.png";
import live from "../../assets/live.png";

const features = [
  {
    title: "Easy Booking Process",
    desc:
      "Lorem ipsum dolor sit amet,consectettur adipiscing elit,sed Lorem ipsum dolor sit amet,consectettur adipiscing elit,sed",
    img: chat,
    cardType: "top", // image TOP
  },
  {
    title: "Personalized Ride Tracking",
    desc:
      "Lorem ipsum dolor sit amet,consectettur adipiscing elit,sed Lorem ipsum dolor sit amet,consectettur adipiscing elit,sed",
    img: journey,
    cardType: "bottom", // image BOTTOM
  },
  {
    title: "Easy Booking Process",
    desc:
      "Lorem ipsum dolor sit amet,consectettur adipiscing elit,sed Lorem ipsum dolor sit amet,consectettur adipiscing elit,sed",
    img: live,
    cardType: "top",
  },
];

/* =========================
   IMAGE (FULL WIDTH, BIGGER)
   ========================= */
function CardImage({ src }) {
  return (
    // ✅ fixed height, full width, no padding
    <div className="w-full h-[220px] sm:h-[240px] md:h-[260px] bg-white">
      <img
        src={src}
        alt=""
        loading="lazy"
        className="w-full h-full object-contain"
        // ✅ optional: if still looks small due to empty whitespace inside png
        style={{ transform: "scale(1.08)" }}
      />
    </div>
  );
}

/* =========================
   FEATURE CARD
   ========================= */
function FeatureCard({ title, desc, img, cardType }) {
  const imageTop = cardType === "top";

  return (
    <div className="relative h-full shadow shadow-md rounded-2xl border-brand-glow ">
      {/* orange vertical line */}
      <div className="absolute -left-2 top-8 hidden h-[70%] w-[3px] rounded-full bg-brand md:block" />

      <div className="h-full min-h-[400px] rounded-2xl bg-white shadow-[0_16px_50px_rgba(0,0,0,0.18)] ring-1 ring-black/5 overflow-hidden flex flex-col">
        {/* IMAGE TOP */}
        {imageTop && <CardImage src={img} />}

        {/* CONTENT */}
        <div className="px-5 py-5 text-center flex-1 flex flex-col justify-center">
          <h3 className="text-[15px] font-extrabold text-slate-900">
            {title}
          </h3>
          <p className="mt-2 text-[12px] leading-5 text-slate-500">
            {desc}
          </p>
        </div>

        {/* IMAGE BOTTOM */}
        {!imageTop && <CardImage src={img} />}
      </div>
    </div>
  );
}

/* =========================
   MAIN SECTION
   ========================= */
export default function KeyFeaturesSection() {
  return (
    <section className="relative overflow-hidden bg-[#0B0B0C] py-3 md:py-10">
      {/* ✅ GRID BACKGROUND */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.6) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.6) 1px, transparent 1px)
          `,
          backgroundSize: "90px 90px",
          backgroundPosition: "center",
        }}
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/70" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-white" />

      <div className="relative mx-auto max-w-6xl px-4 pb-14 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="flex flex-col gap-6 md:flex-row md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-[2px] w-3 bg-brand" />
              <span className="text-[12px] font-semibold text-slate-300">
                Key Features
              </span>
            </div>

            <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
              Key Features of
            </h2>
            <h3 className="mt-1 text-3xl font-black text-brand sm:text-4xl">
              Driver Services
            </h3>
          </div>

          <div className="max-w-xl md:pt-6">
            <div className="flex gap-3">
              <div className="mt-1 h-8 w-[3px] rounded-full bg-brand" />
              <p className="text-[12px] leading-5 text-slate-300">
                Lorem ipsum dolor sit amet,consectettur adipiscing elit,sed
                Lorem ipsum dolor sit amet,consectettur adipiscing elit,sed
              </p>
            </div>
          </div>
        </div>

        {/* CARDS */}
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch hover:cursor-pointer">
          {features.map((f, i) => (
            <FeatureCard key={i} {...f} />
          ))}
        </div>
      </div>
    </section>
  );
}
