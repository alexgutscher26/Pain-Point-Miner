/* eslint-disable @next/next/no-img-element */
"use client";

export function Testimonial() {
  return (
    <section className="w-full py-32 px-6 flex justify-center bg-[#0a0a0a] border-y-2 border-white/[0.03]">
      <div className="max-w-5xl flex flex-col md:flex-row items-center md:items-start gap-16 md:gap-[100px] w-full mt-4">
        <div className="flex flex-col items-start shrink-0 pt-16 ml-0 lg:ml-8">
          <div className="w-[180px] h-[180px] rounded-[24px] bg-[#141414] border border-white/[0.1] overflow-hidden relative shadow-2xl mb-4">
            <img
              src="https://images.unsplash.com/photo-1543132220-3ec99c6094dc?q=80&w=256&auto=format&fit=crop"
              className="w-full h-full object-cover"
              alt="Founder avatar"
            />
          </div>

          <div className="flex items-center gap-2 -ml-6 opacity-80 mt-2">
            <span className="text-zinc-300 font-serif text-[17px] tracking-wide -rotate-3">
              This is me 👋
            </span>
            <svg
              width="24"
              height="40"
              viewBox="0 0 24 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-zinc-500"
            >
              <path
                d="M4 35C8 28 16 20 20 5M20 5C16 10 12 16 10 20M20 5C18 12 17 18 18 24"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Right Side: Text Content */}
        <div className="flex flex-col text-left flex-1 max-w-[660px]">
          <h2 className="text-[12px] font-extrabold tracking-widest text-[#ff4500] uppercase mb-4">
            FROM THE FOUNDER
          </h2>

          <h3 className="text-[34px] md:text-[40px] font-extrabold text-white mb-8 leading-[1.2] tracking-tight">
            Built by a founder tired of building{" "}
            <span className="text-[#ff4500]">
              products
              <br className="hidden md:block" /> nobody wants
            </span>
          </h3>

          <p className="text-[16px] text-zinc-400 font-medium leading-relaxed mb-6">
            I&apos;ve launched multiple SaaS products and learned the hard way
            that building first and validating later leads to dead-ends. But
            manually scrolling through subreddits to find real pain points?
            That&apos;s exhausting.
          </p>

          <p className="text-[16px] text-zinc-400 font-medium leading-relaxed mb-6">
            I wanted a tool that would analyze Reddit for me, extract complaints
            with AI, and deliver structured validation reports so I could build
                exactly what people need. So I built ThreddIQ.
          </p>

          <p className="text-[17px] text-white font-bold leading-relaxed mb-10">
            Now I validate ideas with concrete data before writing a single line
            of code. I hope it helps you too.
          </p>

          <div className="border-t border-white/[0.05] pt-6 flex items-center">
            <span className="text-[15px] font-extrabold text-white tracking-wide italic">
              - Axel Schapmann
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
