export function IndiaMap() {
  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-24 w-24 rounded-full border border-sky-400/30 bg-sky-400/10 animate-pulse" />

          <h3 className="mt-6 text-2xl font-semibold text-white">
            Interactive Coverage Map
          </h3>

          <p className="mt-3 text-slate-400">
            Loading India & Madhya Pradesh...
          </p>
        </div>
      </div>
    </div>
  );
}
