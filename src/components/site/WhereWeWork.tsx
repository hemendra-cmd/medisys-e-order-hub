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
          <div className="flex min-h-[420px] items-center justify-center rounded-[2rem] border border-dashed border-white/15 bg-black/20">
            <div className="max-w-md px-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/10">
                <span className="text-2xl">⌖</span>
              </div>

              <h3 className="mt-6 text-2xl font-semibold">
                Interactive service map
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                The accurate Madhya Pradesh district map will be added here in
                the next step.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
