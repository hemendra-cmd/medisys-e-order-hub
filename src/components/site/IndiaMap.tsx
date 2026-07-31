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

      {/* Blue ambient glow */}
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

      {/* MP */}
      <div
        className={`absolute left-1/2 top-1/2 w-[84%] -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ${
          zoomed
            ? "scale-100 opacity-100"
            : "scale-50 opacity-0"
        }`}
      >
        <img
          src={mpDistrictMap}
          alt="Madhya Pradesh"
          className="w-full object-contain"
          style={{
            filter:
              "invert(1) brightness(.82) contrast(1.3) saturate(.15) hue-rotate(180deg)",
            mixBlendMode: "screen",
          }}
        />
      </div>
    </div>
  );
}
