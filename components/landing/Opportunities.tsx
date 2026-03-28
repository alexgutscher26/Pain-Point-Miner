"use client";

export function Opportunities() {
  return (
    <section className="flex w-full flex-col items-center border-t-2 border-white/[0.02] bg-[#000] px-6 py-32">
      <div className="mb-24 max-w-2xl text-center">
        <h2 className="mb-6 text-[12px] font-bold tracking-[0.2em] text-[#ff4500] uppercase">
          UNDERSTAND YOUR MARKET
        </h2>
        <h3 className="mb-6 text-[40px] leading-tight font-extrabold tracking-tight text-white md:text-[56px]">
          Find <span className="text-[#ff4500]">real user problems</span>
        </h3>
        <p className="text-[18px] leading-relaxed font-medium text-zinc-400">
          Discover underlying frustrations, competitor complaints, and active
          requests for solutions in your niche.
        </p>
      </div>

      <div className="grid w-full max-w-6xl grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Card 1 */}
        <div className="group relative flex h-full flex-col overflow-hidden rounded-[24px] border-2 border-white/[0.03] bg-[#0f0f0f] p-8 shadow-2xl transition-colors hover:border-white/[0.08]">
          <div className="pointer-events-none absolute top-0 right-0 h-48 w-48 rounded-full bg-blue-500/10 blur-[80px] transition-colors"></div>

          <h3 className="mb-4 text-[22px] font-extrabold text-white">
            Underlying frustrations
          </h3>
          <p className="mb-10 flex-1 text-[15px] leading-relaxed font-medium text-zinc-400">
            See users actively complaining about workflows that your software
            could automate or simplify.
          </p>

          <div className="relative z-10 mt-auto rounded-xl border-2 border-white/[0.03] bg-[#141414] p-6 shadow-inner">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[11px] font-extrabold tracking-widest text-blue-400 uppercase">
                r/SaaS
              </div>
              <span className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase">
                2 hrs ago
              </span>
            </div>
            <div className="mb-3 text-[15px] leading-snug font-extrabold tracking-tight text-white">
              How do you guys automate this without losing your mind?
            </div>
            <div className="text-[13px] leading-relaxed font-medium text-zinc-400">
              I&apos;ve been spending 10 hours a week on this. Is there a better
              way? Feeling burnt out trying to string 4 different tools together
              manually...
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="group relative flex h-full flex-col overflow-hidden rounded-[24px] border-2 border-white/[0.03] bg-[#0f0f0f] p-8 shadow-2xl transition-colors hover:border-white/[0.08]">
          <div className="pointer-events-none absolute top-0 right-0 h-48 w-48 rounded-full bg-amber-500/10 blur-[80px] transition-colors"></div>

          <h3 className="mb-4 text-[22px] font-extrabold text-white">
            Competitor weaknesses
          </h3>
          <p className="mb-10 flex-1 text-[15px] leading-relaxed font-medium text-zinc-400">
            Discover exactly what features are lacking or broken in competing
            tools to position yourself better.
          </p>

          <div className="relative z-10 mt-auto rounded-xl border-2 border-white/[0.03] bg-[#141414] p-6 shadow-inner">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[11px] font-extrabold tracking-widest text-amber-500 uppercase">
                r/marketing
              </div>
              <span className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase">
                5 hrs ago
              </span>
            </div>
            <div className="mb-3 text-[15px] leading-snug font-extrabold tracking-tight text-white">
              Looking for a [Competitor] alternative
            </div>
            <div className="text-[13px] leading-relaxed font-medium text-zinc-400">
              Their prices just doubled and support is terrible. Need something
              else fast that actually responds when things break. Any ideas?
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="group relative flex h-full flex-col overflow-hidden rounded-[24px] border-2 border-white/[0.03] bg-[#0f0f0f] p-8 shadow-2xl transition-colors hover:border-white/[0.08]">
          <div className="pointer-events-none absolute top-0 right-0 h-48 w-48 rounded-full bg-[#9333ea]/10 blur-[80px] transition-colors"></div>

          <h3 className="mb-4 text-[22px] font-extrabold text-white">
            Feature requests
          </h3>
          <p className="mb-10 flex-1 text-[15px] leading-relaxed font-medium text-zinc-400">
            Validate roadmaps based on users explicitly asking &quot;Is there a
            tool that does X?&quot;
          </p>

          <div className="relative z-10 mt-auto rounded-xl border-2 border-white/[0.03] bg-[#141414] p-6 shadow-inner">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-full border border-[#9333ea]/20 bg-[#9333ea]/10 px-3 py-1 text-[11px] font-extrabold tracking-widest text-[#9333ea] uppercase">
                r/productivity
              </div>
              <span className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase">
                1 day ago
              </span>
            </div>
            <div className="mb-3 text-[15px] leading-snug font-extrabold tracking-tight text-white">
              Tool needed to extract Reddit insights?
            </div>
            <div className="text-[13px] leading-relaxed font-medium text-zinc-400">
              I want to find SaaS ideas from subreddits without reading them
              manually. Does this exist? Would pay good money for this.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
