import indiaOutline from "@/assets/India_outline.svg";
import mpDistrictMap from "@/assets/Madhya_Pradesh_district_map.svg";

export function IndiaMap() {
  return (
    <div className="relative h-full min-h-[420px] overflow-hidden rounded-3xl bg-transparent">

      {/* India Map */}
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src={indiaOutline}
          alt="India Map"
          className="w-[72%] max-w-[520px] object-contain opacity-90 transition-all duration-700"
        />
      </div>

      {/* MP Preview */}
      <div className="absolute bottom-5 right-5 rounded-xl border border-white/10 bg-white p-2 shadow-xl">
        <img
          src={mpDistrictMap}
          alt="Madhya Pradesh Districts"
          className="w-28"
        />
      </div>

    </div>
  );
}
