"use client";

export function Opportunities() {
  return (
    <section className="w-full py-32 px-6 flex flex-col items-center bg-[#000] border-t-2 border-white/[0.02]">
      <div className="text-center max-w-2xl mb-24">
        <h2 className="text-[12px] font-bold tracking-[0.2em] text-[#ff4500] uppercase mb-6">
          UNDERSTAND YOUR MARKET
        </h2>
        <h3 className="text-[40px] md:text-[56px] font-extrabold tracking-tight text-white mb-6 leading-tight">
          Find <span className="text-[#ff4500]">real user problems</span>
        </h3>
        <p className="text-[18px] text-zinc-400 font-medium leading-relaxed">
          Discover underlying frustrations, competitor complaints, and active
          requests for solutions in your niche.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl w-full">
        {/* Card 1 */}
        <div className="bg-[#0f0f0f] border-2 border-white/[0.03] rounded-[24px] p-8 h-full flex flex-col hover:border-white/[0.08] transition-colors group relative shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none transition-colors"></div>

          <h4 className="font-extrabold text-[22px] text-white mb-4">
            Underlying frustrations
          </h4>
          <p className="text-[15px] text-zinc-400 mb-10 flex-1 leading-relaxed font-medium">
            See users actively complaining about workflows that your software
            could automate or simplify.
          </p>

          <div className="bg-[#141414] rounded-xl p-6 border-2 border-white/[0.03] shadow-inner mt-auto relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[11px] font-extrabold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                r/SaaS
              </div>
              <span className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase">
                2 hrs ago
              </span>
            </div>
            <div className="text-[15px] text-white font-extrabold mb-3 leading-snug tracking-tight">
              How do you guys automate this without losing your mind?
            </div>
            <div className="text-[13px] text-zinc-400 leading-relaxed font-medium">
              I&apos;ve been spending 10 hours a week on this. Is there a better
              way? Feeling burnt out trying to string 4 different tools together
              manually...
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[#0f0f0f] border-2 border-white/[0.03] rounded-[24px] p-8 h-full flex flex-col hover:border-white/[0.08] transition-colors group relative shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none transition-colors"></div>

          <h4 className="font-extrabold text-[22px] text-white mb-4">
            Competitor weaknesses
          </h4>
          <p className="text-[15px] text-zinc-400 mb-10 flex-1 leading-relaxed font-medium">
            Discover exactly what features are lacking or broken in competing
            tools to position yourself better.
          </p>

          <div className="bg-[#141414] rounded-xl p-6 border-2 border-white/[0.03] shadow-inner mt-auto relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[11px] font-extrabold text-amber-500 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                r/marketing
              </div>
              <span className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase">
                5 hrs ago
              </span>
            </div>
            <div className="text-[15px] text-white font-extrabold mb-3 leading-snug tracking-tight">
              Looking for a [Competitor] alternative
            </div>
            <div className="text-[13px] text-zinc-400 leading-relaxed font-medium">
              Their prices just doubled and support is terrible. Need something
              else fast that actually responds when things break. Any ideas?
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-[#0f0f0f] border-2 border-white/[0.03] rounded-[24px] p-8 h-full flex flex-col hover:border-white/[0.08] transition-colors group relative shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#9333ea]/10 rounded-full blur-[80px] pointer-events-none transition-colors"></div>

          <h4 className="font-extrabold text-[22px] text-white mb-4">
            Feature requests
          </h4>
          <p className="text-[15px] text-zinc-400 mb-10 flex-1 leading-relaxed font-medium">
            Validate roadmaps based on users explicitly asking &quot;Is there a
            tool that does X?&quot;
          </p>

          <div className="bg-[#141414] rounded-xl p-6 border-2 border-white/[0.03] shadow-inner mt-auto relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[11px] font-extrabold text-[#9333ea] uppercase tracking-widest bg-[#9333ea]/10 px-3 py-1 rounded-full border border-[#9333ea]/20">
                r/productivity
              </div>
              <span className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase">
                1 day ago
              </span>
            </div>
            <div className="text-[15px] text-white font-extrabold mb-3 leading-snug tracking-tight">
              Tool needed to extract Reddit insights?
            </div>
            <div className="text-[13px] text-zinc-400 leading-relaxed font-medium">
              I want to find SaaS ideas from subreddits without reading them
              manually. Does this exist? Would pay good money for this.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
