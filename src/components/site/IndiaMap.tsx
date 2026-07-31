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
      <img
        src={mpDistrictMap}
        alt="Madhya Pradesh"
        className={`absolute left-1/2 top-1/2 transition-all duration-1000 ${
          zoomed
            ? "-translate-x-1/2 -translate-y-1/2 w-[72%] opacity-100"
            : "translate-x-[220px] translate-y-[140px] w-28 opacity-0"
        }`}
      />

    </div>
  );
}
