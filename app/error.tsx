"use client";

import Link from "next/link";
import { useEffect } from "react";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans flex items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#111111] p-8 shadow-xl">
        <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#ff4500]">
          Something went wrong
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-white">
          Unexpected application error
        </h1>
        <p className="mt-3 text-sm text-zinc-400">
          We hit an issue while loading this page. You can retry, or return to
          the dashboard or homepage.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-[#ff4500] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#e63e00]"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-zinc-200 transition-colors hover:bg-white/5"
          >
            Go to dashboard
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-zinc-200 transition-colors hover:bg-white/5"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
