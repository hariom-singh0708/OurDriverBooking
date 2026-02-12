import React from "react";
import carImg from "../../assets/car.png";

export default function TopVehiclesBanner() {
  return (<>
  <section className="w-full bg-[#1f1f1f]">
        <div className="flex items-center justify-between rounded-sm bg-[#1f1f1f] px-6 py-5">
          
          {/* LEFT SIDE */}
          <div>
            <div className="flex items-center gap-2">
              <span className="h-[2px] w-3 bg-[#d89a33]" />
              <span className="text-[11px] font-semibold text-white/80">
                Top Vehicles
              </span>
            </div>

            <h2 className="mt-2 text-[26px] font-extrabold text-white leading-tight">
              World Class{" "}
              <span className="text-[#d89a33]">Vehicles</span>
            </h2>
          </div>

          {/* RIGHT SIDE */}
          <div className="hidden sm:flex items-start gap-3 max-w-[360px]">
            <span className="mt-1 h-8 w-[3px] rounded-full bg-[#d89a33]" />
            <p className="text-[11px] leading-5 text-white/70">
              Curated selection of premium automobiles for a distinguished travel
              experience
            </p>
          </div>
      </div>
    </section>
    <section className="w-full overflow-hidden bg-white">
      <img
        src={carImg}
        alt="World Class Vehicle"
        draggable={false}
        className="
        w-full
        h-auto
        object-cover
        "
        />
    </section>
        </>
  );
}
