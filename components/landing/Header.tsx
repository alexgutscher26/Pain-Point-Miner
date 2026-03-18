"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="fixed top-0 w-full z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-linear-to-tr from-[#ff4500] to-[#ff6b33] flex items-center justify-center relative overflow-hidden">
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 text-white fill-current"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
            </svg>
          </div>
          <span className="font-bold text-base sm:text-lg text-white tracking-tight">
            Threddiq
          </span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/sign-in"
            className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
          >
            Sign in
          </Link>
          <Button
            asChild
            className="bg-[#ff4500] hover:bg-[#e03d00] text-white rounded-md px-3 h-9 text-xs sm:text-sm sm:px-4 font-medium shadow-none transition-all hidden md:flex"
          >
            <Link href="/sign-up">Start 3-day free trial</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
