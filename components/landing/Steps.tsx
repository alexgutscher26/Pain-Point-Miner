import { Target } from "lucide-react";

export function Steps() {
  return (
    <section className="flex w-full flex-col items-center bg-[#000] px-6 py-32">
      <div className="mb-20 max-w-2xl text-center">
        <h2 className="mb-6 text-[12px] font-bold tracking-[0.2em] text-[#ff4500] uppercase">
          HOW IT WORKS
        </h2>
        <h3 className="mb-6 text-[40px] leading-tight font-extrabold tracking-tight text-white md:text-[56px]">
          Validate your <span className="text-[#ff4500]">SaaS ideas</span>
          <br /> in 3 simple steps
        </h3>
        <p className="text-[18px] font-medium text-zinc-400">
          Enter a niche, and we&apos;ll do the deep research to extract the real
          problems your potential users are actively trying to solve.
        </p>
      </div>

      <div className="grid w-full max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
        {/* Step 1 */}
        <div className="group flex flex-col items-start rounded-[24px] border border-white/[0.03] bg-[#0f0f0f] p-8 shadow-xl transition-colors hover:border-white/[0.08]">
          <div className="mb-8 flex h-7 w-7 items-center justify-center rounded bg-[#ff4500] text-[13px] font-bold text-white shadow-[0_4px_15px_rgba(255,69,0,0.5)]">
            1
          </div>

          <div className="mb-8 flex h-40 w-full items-center justify-center overflow-hidden rounded-xl border border-white/[0.03] bg-black shadow-inner transition-transform duration-500 group-hover:scale-[1.02]">
            {/* Search text box mockup */}
            <div className="flex w-[80%] items-center gap-2 rounded-full border border-white/5 bg-[#1a1a1a] px-5 py-3 shadow-lg">
              <span className="text-[15px] font-bold text-[#ff4500]">#</span>
              <span className="animate-pulse border-r-2 border-[#ff4500] pr-1.5 text-[15px] font-medium tracking-wide text-white">
                SaaS marketing
              </span>
            </div>
          </div>
          <h3 className="mb-3 text-[22px] font-extrabold tracking-tight text-white">
            1. Define your niche
          </h3>
          <p className="text-[15px] leading-relaxed font-medium text-zinc-400">
            Enter a keyword like &quot;SEO tools&quot; or &quot;property
            management&quot; to target the exact subreddits relevant to your
            SaaS.
          </p>
        </div>

        {/* Step 2 */}
        <div className="group flex flex-col items-start rounded-[24px] border border-white/[0.03] bg-[#0f0f0f] p-8 shadow-xl transition-colors hover:border-white/[0.08]">
          <div className="mb-8 flex h-7 w-7 items-center justify-center rounded bg-[#ff4500] text-[13px] font-bold text-white shadow-[0_4px_15px_rgba(255,69,0,0.5)]">
            2
          </div>

          <div className="relative mb-8 flex h-40 w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border border-white/[0.03] bg-black shadow-inner transition-transform duration-500 group-hover:scale-[1.02]">
            <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent to-[#ff4500]/5"></div>
            {/* Feed mockup */}
            <div className="w-[75%] translate-x-4 rounded-lg border border-white/[0.05] bg-[#1a1a1a] p-3 shadow-lg">
              <div className="mb-1.5 h-1.5 w-[60%] rounded bg-zinc-700"></div>
              <div className="h-1.5 w-full rounded bg-zinc-800"></div>
            </div>
            <div className="w-[75%] -translate-x-4 rounded-lg border border-white/[0.05] bg-[#1a1a1a] p-3 opacity-60 shadow-lg">
              <div className="mb-1.5 h-1.5 w-[40%] rounded bg-zinc-700"></div>
              <div className="h-1.5 w-[90%] rounded bg-zinc-800"></div>
            </div>
          </div>
          <h3 className="mb-3 text-[22px] font-extrabold tracking-tight text-white">
            2. We analyze discussions
          </h3>
          <p className="text-[15px] leading-relaxed font-medium text-zinc-400">
            Our system scans recent discussions, identifies repeated
            frustrations, and clusters similar complaints automatically.
          </p>
        </div>

        {/* Step 3 */}
        <div className="group flex flex-col items-start rounded-[24px] border border-white/[0.03] bg-[#0f0f0f] p-8 shadow-xl transition-colors hover:border-white/[0.08]">
          <div className="mb-8 flex h-7 w-7 items-center justify-center rounded bg-[#ff4500] text-[13px] font-bold text-white shadow-[0_4px_15px_rgba(255,69,0,0.5)]">
            3
          </div>

          <div className="relative mb-8 flex h-40 w-full items-center justify-center overflow-hidden rounded-xl border border-white/[0.03] bg-black shadow-inner transition-transform duration-500 group-hover:scale-[1.02]">
            <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent to-[#ff4500]/10"></div>
            {/* Ping mockup */}
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#ff4500]/30 bg-black shadow-[0_0_30px_rgba(255,69,0,0.2)]">
              <Target className="h-8 w-8 text-[#ff4500]" />
              <div className="absolute top-1 right-1 h-4 w-4 animate-pulse rounded-full border-2 border-black bg-red-500"></div>
            </div>
          </div>
          <h3 className="mb-3 text-[22px] font-extrabold tracking-tight text-white">
            3. Review Pain Points
          </h3>
          <p className="text-[15px] leading-relaxed font-medium text-zinc-400">
            Get structured reports detailing common pain points, demand signals,
            and user language to validate your next feature.
          </p>
        </div>
      </div>
    </section>
  );
}
