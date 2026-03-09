import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans flex items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#111111] p-8 shadow-xl">
        <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#ff4500]">
          404 error
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-white">
          Page not found
        </h1>
        <p className="mt-3 text-sm text-zinc-400">
          The page you requested does not exist or may have been moved.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-lg bg-[#ff4500] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#e63e00]"
          >
            Back to home
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-zinc-200 transition-colors hover:bg-white/5"
          >
            Open dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
