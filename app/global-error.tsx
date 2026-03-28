"use client";

import Link from "next/link";
import { useEffect } from "react";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-[#0a0a0a] p-6 font-sans text-zinc-100">
        <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#111111] p-8 shadow-xl">
          <p className="text-xs font-semibold tracking-[0.18em] text-[#ff4500] uppercase">
            Critical error
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-white">
            The app failed to render
          </h1>
          <p className="mt-3 text-sm text-zinc-400">
            A critical error occurred while loading the application shell.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={reset}
              className="rounded-lg bg-[#ff4500] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#e63e00]"
            >
              Retry
            </button>
            <Link
              href="/"
              className="rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-zinc-200 transition-colors hover:bg-white/5"
            >
              Go home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
