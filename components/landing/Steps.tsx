import { Target } from "lucide-react";

export function Steps() {
  return (
    <section className="flex w-full flex-col items-center px-6 py-32">
      <div className="mb-20 max-w-2xl text-center">
        <h2 className="mb-6 text-[12px] font-bold tracking-[0.2em] text-[#ff4500] uppercase">
          HOW IT WORKS
        </h2>
        <h3 className="mb-6 text-[40px] leading-tight font-extrabold tracking-tight text-zinc-900 md:text-[56px]">
          Validate your <span className="text-[#ff4500]">SaaS ideas</span>
          <br /> in 3 simple steps
        </h3>
        <p className="text-[18px] font-medium text-zinc-500">
          Enter a niche, and we&apos;ll do the deep research to extract the real
          problems your potential users are actively trying to solve.
        </p>
      </div>

      <div className="grid w-full max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
        {/* Step 1 */}
        <div className="group flex flex-col items-start rounded-[24px] border border-black/5 bg-white/60 p-8 shadow-sm transition-all hover:bg-white hover:border-[#ff4500]/15 hover:shadow-md">
          <div className="mb-8 flex h-7 w-7 items-center justify-center rounded-full bg-[#ff4500] text-[13px] font-bold text-white shadow-xs">
            1
          </div>

          <div className="mb-8 flex h-40 w-full items-center justify-center overflow-hidden rounded-xl border border-black/5 bg-zinc-50 shadow-inner transition-transform duration-500 group-hover:scale-[1.02]">
            {/* Search text box mockup */}
            <div className="flex w-[80%] items-center gap-2 rounded-full border border-black/5 bg-white px-5 py-3 shadow-sm">
              <span className="text-[15px] font-bold text-[#ff4500]">#</span>
              <span className="animate-pulse border-r-2 border-[#ff4500] pr-1.5 text-[15px] font-medium tracking-wide text-zinc-900">
                SaaS marketing
              </span>
            </div>
          </div>
          <h3 className="mb-3 text-[22px] font-extrabold tracking-tight text-zinc-900">
            1. Define your niche
          </h3>
          <p className="text-[15px] leading-relaxed font-medium text-zinc-500">
            Enter a keyword like &quot;SEO tools&quot; or &quot;property
            management&quot; to target the exact subreddits relevant to your
            SaaS.
          </p>
        </div>

        {/* Step 2 */}
        <div className="group flex flex-col items-start rounded-[24px] border border-black/5 bg-white/60 p-8 shadow-sm transition-all hover:bg-white hover:border-[#ff4500]/15 hover:shadow-md">
          <div className="mb-8 flex h-7 w-7 items-center justify-center rounded-full bg-[#ff4500] text-[13px] font-bold text-white shadow-xs">
            2
          </div>

          <div className="relative mb-8 flex h-40 w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border border-black/5 bg-zinc-50 shadow-inner transition-transform duration-500 group-hover:scale-[1.02]">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-[#ff4500]/5"></div>
            {/* Feed mockup */}
            <div className="w-[75%] translate-x-4 rounded-lg border border-black/5 bg-white p-3 shadow-xs">
              <div className="mb-1.5 h-1.5 w-[60%] rounded bg-zinc-200 animate-pulse"></div>
              <div className="h-1.5 w-full rounded bg-zinc-100"></div>
            </div>
            <div className="w-[75%] -translate-x-4 rounded-lg border border-black/5 bg-white p-3 opacity-60 shadow-xs">
              <div className="mb-1.5 h-1.5 w-[40%] rounded bg-zinc-200"></div>
              <div className="h-1.5 w-[90%] rounded bg-zinc-100"></div>
            </div>
          </div>
          <h3 className="mb-3 text-[22px] font-extrabold tracking-tight text-zinc-900">
            2. We analyze discussions
          </h3>
          <p className="text-[15px] leading-relaxed font-medium text-zinc-500">
            Our system scans recent discussions, identifies repeated
            frustrations, and clusters similar complaints automatically.
          </p>
        </div>

        {/* Step 3 */}
        <div className="group flex flex-col items-start rounded-[24px] border border-black/5 bg-white/60 p-8 shadow-sm transition-all hover:bg-white hover:border-[#ff4500]/15 hover:shadow-md">
          <div className="mb-8 flex h-7 w-7 items-center justify-center rounded-full bg-[#ff4500] text-[13px] font-bold text-white shadow-xs">
            3
          </div>

          <div className="relative mb-8 flex h-40 w-full items-center justify-center overflow-hidden rounded-xl border border-black/5 bg-zinc-50 shadow-inner transition-transform duration-500 group-hover:scale-[1.02]">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-[#ff4500]/10"></div>
            {/* Ping mockup */}
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#ff4500]/20 bg-white shadow-xs">
              <Target className="h-8 w-8 text-[#ff4500]" />
              <div className="absolute top-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-red-500"></div>
            </div>
          </div>
          <h3 className="mb-3 text-[22px] font-extrabold tracking-tight text-zinc-900">
            3. Review Pain Points
          </h3>
          <p className="text-[15px] leading-relaxed font-medium text-zinc-500">
            Get structured reports detailing common pain points, demand signals,
            and user language to validate your next feature.
          </p>
        </div>
      </div>
    </section>
  );
}
