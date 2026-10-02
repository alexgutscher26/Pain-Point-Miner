"use client";

import { useEffect, useRef, useState } from "react";

const TAGLINE_TEXT =
  "Great software is never invented in isolation. It is uncovered inside the unfiltered complaints of frustrated users.";

export function TaglineReveal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeWordsCount, setActiveWordsCount] = useState<number>(0);
  const words = TAGLINE_TEXT.split(" ");

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Start revealing when the element enters top 80% and finish when it hits middle of viewport
      const startTrigger = windowHeight * 0.85;
      const endTrigger = windowHeight * 0.35;

      if (rect.top > startTrigger) {
        setActiveWordsCount(0);
      } else if (rect.top < endTrigger) {
        setActiveWordsCount(words.length);
      } else {
        const progress = Math.min(
          Math.max((startTrigger - rect.top) / (startTrigger - endTrigger), 0),
          1,
        );
        const count = Math.round(progress * words.length);
        setActiveWordsCount(count);
      }
    };

    let animationFrameId: number;
    const onScrollThrottled = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener("scroll", onScrollThrottled, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", onScrollThrottled);
      cancelAnimationFrame(animationFrameId);
    };
  }, [words.length]);

  return (
    <section className="relative flex w-full justify-center overflow-hidden bg-zinc-950 px-4 py-24 text-white sm:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,69,0,0.08),transparent_70%)]" />
      <div
        ref={containerRef}
        className="z-10 mx-auto flex w-full max-w-[680px] flex-col items-center text-center"
      >
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-zinc-400">
          The validation philosophy
        </div>
        <p className="text-3xl leading-tight font-bold tracking-tight text-balance sm:text-4xl md:text-5xl">
          {words.map((word, index) => {
            const isActive = index < activeWordsCount;
            return (
              <span
                key={`${word}-${index}`}
                className="mr-[0.28em] inline-block transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                style={{
                  color: isActive ? "#FFFFFF" : "rgba(255, 255, 255, 0.28)",
                  transform: isActive ? "translateY(0)" : "translateY(2px)",
                }}
              >
                {word}
              </span>
            );
          })}
        </p>
        <div className="mt-8 text-sm font-medium text-zinc-400">
          Listen to what buyers ask for before building your next product
        </div>
      </div>
    </section>
  );
}
