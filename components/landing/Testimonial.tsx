"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

const logos = [
  {
    name: "Y Combinator",
    src: "https://upload.wikimedia.org/wikipedia/commons/b/b2/Y_Combinator_logo.svg",
  },
  {
    name: "Indie Hackers",
    src: "https://www.indiehackers.com/images/logos/indie-hackers-logo-dark.svg",
  },
  {
    name: "Product Hunt",
    src: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Product_Hunt_Logo.svg",
  },
  {
    name: "Stripe",
    src: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg",
  },
  {
    name: "Vercel",
    src: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Vercel_logo_black.svg",
  },
];

const testimonials = [
  {
    quote:
      "ThreddIQ changed how I validate SaaS ideas. I found 3 high-intent pain points in r/sales that I'd never have spotted manually. It saved me weeks of dev time.",
    author: "James Chen",
    role: "Founder, OutreachSync",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=256&auto=format&fit=crop",
  },
  {
    quote:
      "The ability to see exactly what people are complaining about, with upvote counts and sentiment analysis, is like having a cheat code for market research.",
    author: "Sarah Jenkins",
    role: "Growth Lead at Mercury",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=256&auto=format&fit=crop",
  },
  {
    quote:
      "Finally, a tool that doesn't just scrape data but actually extracts *problems*. ThreddIQ is now a core part of our product discovery workflow.",
    author: "Marcus Thorne",
    role: "Product Manager, ScalePath",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop",
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
    <section className="w-full bg-[#0a0a0a] border-y border-white/5 overflow-hidden">
      {/* Logo Marquee */}
      <div className="py-12 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-[11px] font-black tracking-[0.2em] text-zinc-500 uppercase mb-10">
            Trusted by founders from
          </p>
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
            {logos.map((logo) => (
              <div key={logo.name} className="h-6 md:h-8 w-auto relative">
                <span className="text-white font-black text-xl md:text-2xl tracking-tighter">
                  {logo.name}
                </span>
                {/* Note: In a real app we'd use <Image src={logo.src} .../> but for demo text branding looks premium too */}
              </div>
            ))}
          </div>
        </div>
      </div>

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

            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full border-2 border-[#ff4500]/30 p-1 bg-[#0a0a0a]">
                <div className="w-full h-full rounded-full overflow-hidden relative">
                  <Image
                    src={testimonials[currentIndex].avatar}
                    alt={testimonials[currentIndex].author}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div>
                <p className="text-white font-black text-lg">
                  {testimonials[currentIndex].author}
                </p>
                <p className="text-[#ff4500] font-mono text-[12px] font-bold uppercase tracking-widest">
                  {testimonials[currentIndex].role}
                </p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-center gap-4 pt-4">
              <button
                onClick={prev}
                aria-label="Previous testimonial"
                className="p-3 rounded-full border border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:border-white/20 transition-all"
              >
                <ChevronLeft className="w-5 h-5" aria-hidden="true" />
              </button>
              <button
                onClick={next}
                aria-label="Next testimonial"
                className="p-3 rounded-full border border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:border-white/20 transition-all"
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
