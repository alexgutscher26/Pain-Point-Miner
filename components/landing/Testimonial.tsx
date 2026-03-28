"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "The problem with most scrapers is noise. ThreddIQ uses LLMs to filter out the fluff and give me the raw, unvarnished pain points. It's transformed our entire product roadmap.",
    author: "Elena",
    role: "Lead Researcher",
  },
  {
    quote:
      "I went from 'I think this is a problem' to 'Here are dozens of people actively complaining about this' in under 5 minutes. The ROI on a single search is frankly insane.",
    author: "David",
    role: "Founder",
  },
  {
    quote:
      "We use ThreddIQ to find sub-niches for our client's ad campaigns. Seeing the exact language users use to describe their frustration is a goldmine for high-converting copy.",
    author: "Jordan",
    role: "Agency CEO",
  },
];

export function Testimonial() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () =>
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () =>
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length,
    );

  useEffect(() => {
    const timer = setInterval(next, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="w-full overflow-hidden border-y border-white/5 bg-[#0a0a0a] font-sans">
      {/* Testimonial Carousel */}
      <div className="flex justify-center px-6 py-24 md:py-32">
        <div className="relative w-full max-w-4xl">
          <div className="absolute -top-12 -left-4 opacity-10 md:-left-12">
            <Quote className="h-24 w-24 text-[#ff4500]" strokeWidth={3} />
          </div>

          <div className="relative z-10 space-y-10 text-center">
            <div className="flex min-h-[160px] items-center justify-center md:min-h-[180px]">
              <h2 className="animate-in fade-in slide-in-from-bottom-4 text-[24px] leading-relaxed font-bold tracking-tight text-white transition-all duration-500 md:text-[32px]">
                &ldquo;{testimonials[currentIndex].quote}&rdquo;
              </h2>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div>
                <p className="text-lg font-black text-white">
                  {testimonials[currentIndex].author}
                </p>
                <p className="font-mono text-[11px] font-bold tracking-widest text-[#ff4500] uppercase opacity-80">
                  {testimonials[currentIndex].role}
                </p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-center gap-4 pt-4">
              <button
                aria-label="Previous testimonial"
                onClick={prev}
                className="border border-white/10 bg-white/5 p-3 text-zinc-400 shadow-[2px_2px_0px_px_rgba(0,0,0,0.5)] transition-all hover:border-white/20 hover:text-white"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                aria-label="Next testimonial"
                onClick={next}
                className="border border-white/10 bg-white/5 p-3 text-zinc-400 shadow-[2px_2px_0px_px_rgba(0,0,0,0.5)] transition-all hover:border-white/20 hover:text-white"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2">
              {testimonials.map((t, i) => (
                <div
                  key={t.author}
                  className={`h-1 rounded-full transition-all duration-500 ${i === currentIndex ? "w-8 bg-[#ff4500]" : "w-3 bg-white/10"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
