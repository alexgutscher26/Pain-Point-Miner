import { auth, getServerSession } from "@/lib/auth";
import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { OnboardingProgressBar } from "@/components/onboarding/progress-bar";
import { LogoIcon } from "@/components/Logo";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const requestHeaders = await headers();
  const session = await getServerSession(requestHeaders);

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div className="landing-gradient flex min-h-screen flex-col text-zinc-900 antialiased selection:bg-[#ff4500]/10 selection:text-[#ff4500]">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-[#ff4500]/5 blur-[150px]" />
        <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-[#ff4500]/3 blur-[120px]" />
      </div>

      <header className="fixed top-4 right-0 left-0 z-50 flex justify-center px-4">
        <div className="flex w-full max-w-4xl items-center justify-between rounded-full border border-zinc-200/60 bg-white/75 px-6 py-3 shadow-xs backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="relative flex size-8 items-center justify-center overflow-hidden rounded-full bg-linear-to-tr from-[#ff4500] to-[#ff6b33] shadow-[0_4px_12px_rgba(255,69,0,0.2)]">
              <LogoIcon className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-extrabold tracking-tight text-zinc-900 sm:text-lg">
              ThreddIQ
            </span>
          </div>
          <div className="w-1/2 max-w-[300px]">
            <OnboardingProgressBar />
          </div>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 pt-24 pb-12 sm:px-8 sm:pt-28">
        <div className="animate-in fade-in slide-in-from-bottom-4 w-full max-w-2xl duration-700">
          <Suspense
            fallback={
              <div className="h-40 w-full animate-pulse rounded-[24px] bg-zinc-200/50" />
            }
          >
            {children}
          </Suspense>
        </div>
      </main>

      <footer className="relative z-10 p-8 text-center">
        <p className="font-mono text-[10px] tracking-[0.2em] text-zinc-400 uppercase">
          Step into the loop &bull; Built for Founders
        </p>
      </footer>
    </div>
  );
}
