import { IndiaMap } from "./IndiaMap";
export function WhereWeWork() {
  return (
    <section className="relative overflow-hidden bg-slate-950 px-4 py-24 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-cyan-400/5 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-400">
            Medisys Service Network
          </p>

          <h2 className="mt-5 font-display text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Where We Work
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Supporting laboratories and healthcare professionals through our
            growing diagnostic distribution network across Madhya Pradesh.
          </p>
        </div>

        <div className="mt-16 rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-4 shadow-2xl backdrop-blur-sm sm:p-8">
          <div className="relative min-h-[520px] overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80">
            <div
              className="pointer-events-none absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(125,211,252,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(125,211,252,0.12) 1px, transparent 1px)",
                backgroundSize: "42px 42px",
              }}
            />

            <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/10 blur-3xl" />

            <div className="relative z-10 flex flex-col gap-4 border-b border-white/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-400">
                  Live Service Coverage
                </p>

                <h3 className="mt-1 text-xl font-semibold">
                  Madhya Pradesh Network
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                  Headquarters: Bhopal
                </div>

                <div className="rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-sm text-sky-300">
                  Growing Coverage
                </div>
              </div>
            </div>

            <div className="relative z-10 grid min-h-[430px] items-center gap-8 px-6 py-10 lg:grid-cols-[0.72fr_1.28fr] lg:px-10">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-400">
                  Regional Reach
                </p>

                <h4 className="mt-4 text-3xl font-semibold tracking-tight">
                  Connecting laboratories across Madhya Pradesh.
                </h4>

                <p className="mt-5 leading-7 text-slate-400">
                  Our Bhopal-based distribution network supports diagnostic
                  centres, laboratories and healthcare professionals throughout
                  the state.
                </p>

                <div className="mt-8 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-2xl font-semibold text-white">Bhopal</p>
                    <p className="mt-1 text-sm text-slate-400">
                      Central hub
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-2xl font-semibold text-white">MP</p>
                    <p className="mt-1 text-sm text-slate-400">
                      Service region
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative min-h-[420px] overflow-hidden rounded-3xl border border-white/10 bg-black/20">
  <IndiaMap />
</div>

                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
