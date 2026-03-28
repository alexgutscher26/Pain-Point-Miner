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
    <section className="w-full bg-[#0a0a0a] border-y border-white/5 overflow-hidden font-sans">
      {/* Testimonial Carousel */}
      <div className="py-24 md:py-32 flex justify-center px-6">
        <div className="max-w-4xl w-full relative">
          <div className="absolute -top-12 -left-4 md:-left-12 opacity-10">
            <Quote className="w-24 h-24 text-[#ff4500]" strokeWidth={3} />
          </div>

          <div className="relative z-10 text-center space-y-10">
            <div className="min-h-[160px] md:min-h-[180px] flex items-center justify-center">
              <h2 className="text-[24px] md:text-[32px] font-bold text-white leading-relaxed tracking-tight transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
                &ldquo;{testimonials[currentIndex].quote}&rdquo;
              </h2>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div>
                <p className="text-white font-black text-lg">
                  {testimonials[currentIndex].author}
                </p>
                <p className="text-[#ff4500] font-mono text-[11px] font-bold uppercase tracking-widest opacity-80">
                  {testimonials[currentIndex].role}
                </p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-center gap-4 pt-4">
              <button
                aria-label="Previous testimonial"
                onClick={prev}
                className="p-3 bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-all shadow-[2px_2px_0px_px_rgba(0,0,0,0.5)]"
              >
                <ChevronLeft className="w-5 h-5" aria-hidden="true" />
              </button>
              <button
                aria-label="Next testimonial"
                onClick={next}
                className="p-3 bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-all shadow-[2px_2px_0px_px_rgba(0,0,0,0.5)]"
              >
                <ChevronRight className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2">
              {testimonials.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 transition-all duration-500 rounded-full ${i === currentIndex ? "w-8 bg-[#ff4500]" : "w-3 bg-white/10"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
