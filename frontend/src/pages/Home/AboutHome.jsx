import React from "react";
import { Link } from "react-router-dom";
import girlImage from "../../assets/girlImage.png";
import callIcon from "../../assets/callIcon.png";
import mapIcon from "../../assets/mapIcon.png";
import driverIcon from "../../assets/driverIcon.png";

export default function AboutHome() {
    return (
        <section className="bg-[#F3F3F3] py-4 md:py-24 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                <div className="grid md:grid-cols-2 items-center gap-14">

                    {/* ================= LEFT SIDE ================= */}
                    <div className="relative flex justify-center md:justify-start">

                        {/* Circle + Girl Wrapper */}
                        <div className="relative w-[320px] sm:w-[380px] md:w-[460px] lg:w-[520px] aspect-square">

                            {/* Orange Circle */}
                            <div className="absolute inset-0 bg-[#D08C2F] rounded-full overflow-hidden">

                                {/* Girl Image */}
                                <img
                                    src={girlImage}
                                    alt="Taxi App"
                                    className="
                                            absolute
                                            bottom-[-8px]
                                            left-1/2
                                            -translate-x-1/2
                                            h-[118%]
                                            md:h-[120%]
                                            object-contain
                                        "
                                />
                            </div>



                            {/* ===== Floating Icons (Right Side Aligned Like Screenshot) ===== */}

                            {/* Top Icon */}
                            <div className="absolute top-[12%] right-[40px] bg-white rounded-full shadow-xl p-3">
                                <img src={mapIcon} alt="Location" className="w-6 h-6" />
                            </div>

                            {/* Middle Icon */}
                            <div className="absolute top-[45%] right-[-20px] bg-white rounded-full shadow-xl p-3">
                                <img src={driverIcon} alt="Driver" className="w-6 h-6" />
                            </div>

                            {/* Bottom Icon */}
                            <div className="absolute bottom-[10%] right-[40px] bg-white rounded-full shadow-xl p-3">
                                <img src={callIcon} alt="Call" className="w-6 h-6" />
                            </div>

                        </div>
                    </div>

                    {/* ================= RIGHT SIDE ================= */}
                    <div className="text-center md:text-left">
                        <p className="text-sm text-gray-500 mb-3 tracking-wider">
                            — About Us
                        </p>

                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6">
                            About <span className="text-[#D08C2F]">Our Driver</span> <br />
                            Booking App
                        </h2>

                        <ul className="space-y-4 mb-8">
                            {[
                                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed",
                                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed",
                                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed",
                                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed",
                            ].map((item, index) => (
                                <li key={index} className="flex items-start gap-3 justify-center md:justify-start">
                                    <span className="text-[#D08C2F] text-lg mt-[2px]">●</span>
                                    <span className="text-gray-600 text-sm md:text-base">
                                        {item}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        {/* Button with route */}
            <Link
              to="/about"
              className="
                inline-block
                bg-[#D08C2F]
                hover:bg-[#b87720]
                text-white
                px-8 py-3
                rounded-full
                font-medium
                shadow-lg
                hover:shadow-xl
                transition
                duration-300
                hover:scale-105
              "
            >
              Get More Info
            </Link>
                    </div>

                </div>
            </div>
        </section>
    );
}
