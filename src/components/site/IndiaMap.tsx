import { useEffect, useState } from "react";

import indiaOutline from "@/assets/India_outline.svg";
import mpDistrictMap from "@/assets/Madhya_Pradesh_district_map.svg";

export function IndiaMap() {
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setZoomed(true);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative h-full min-h-[420px] overflow-hidden rounded-3xl">
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.12),transparent_60%)]" />

      {/* India */}
      <img
        src={indiaOutline}
        alt="India"
        className={`absolute left-1/2 top-1/2 w-[70%] -translate-x-1/2 -translate-y-1/2 object-contain transition-all duration-1000 ${
          zoomed
            ? "scale-[2.8] opacity-0"
            : "scale-100 opacity-90"
        }`}
      />

      {/* Madhya Pradesh */}
      <div
        className={`absolute left-1/2 top-1/2 w-[84%] -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ${
          zoomed
            ? "scale-100 opacity-100"
            : "scale-50 opacity-0"
        }`}
      >
        {/* Glow behind map */}
        <div className="absolute inset-0 rounded-full bg-cyan-400/10 blur-3xl" />

        {/* MP map */}
        <img
          src={mpDistrictMap}
          alt="Madhya Pradesh"
          className="relative z-10 w-full object-contain"
          style={{
            filter:
              "invert(1) brightness(.82) contrast(1.45) saturate(.2) hue-rotate(180deg)",
            mixBlendMode: "screen",
          }}
        />

        {/* Routes */}
        <svg
          className="pointer-events-none absolute inset-0 z-20 h-full w-full"
          viewBox="0 0 1000 800"
          preserveAspectRatio="none"
        >
          <path
            d="M520 420 Q610 250 760 230"
            stroke="#38bdf8"
            strokeWidth="3"
            strokeDasharray="10 10"
            fill="none"
            opacity="0.9"
          />

          <path
            d="M520 420 Q650 420 820 520"
            stroke="#38bdf8"
            strokeWidth="3"
            strokeDasharray="10 10"
            fill="none"
            opacity="0.9"
          />

          <path
            d="M520 420 Q430 520 300 600"
            stroke="#38bdf8"
            strokeWidth="3"
            strokeDasharray="10 10"
            fill="none"
            opacity="0.9"
          />

          <path
            d="M520 420 Q450 250 360 180"
            stroke="#38bdf8"
            strokeWidth="3"
            strokeDasharray="10 10"
            fill="none"
            opacity="0.9"
          />
        </svg>

        {/* Bhopal */}
        <div
          className="absolute z-30 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500 shadow-[0_0_25px_8px_rgba(255,60,60,.8)]"
          style={{
            left: "52%",
            top: "53%",
          }}
        />

        {/* Service points */}
        <div
          className="absolute z-30 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-400 shadow-[0_0_18px_6px_rgba(56,189,248,.75)]"
          style={{ left: "76%", top: "29%" }}
        />

        <div
          className="absolute z-30 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-400 shadow-[0_0_18px_6px_rgba(56,189,248,.75)]"
          style={{ left: "82%", top: "65%" }}
        />

        <div
          className="absolute z-30 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-400 shadow-[0_0_18px_6px_rgba(56,189,248,.75)]"
          style={{ left: "30%", top: "75%" }}
        />

        <div
          className="absolute z-30 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-400 shadow-[0_0_18px_6px_rgba(56,189,248,.75)]"
          style={{ left: "36%", top: "22%" }}
        />
      </div>
    </div>
  );
}
