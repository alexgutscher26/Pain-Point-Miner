import { auth } from "@/lib/auth";
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
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a] text-zinc-100 antialiased selection:bg-[#ff4500]/30">
      {/* Background decoration */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#ff4500]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#ff4500]/5 blur-[120px] rounded-full" />
      </div>

      <header className="relative z-10 border-b border-white/10 bg-[#0d0d0d]/80 backdrop-blur-md px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">

          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center border border-[#ff8a57] bg-[#ff4500] p-1.5 text-white">
              <LogoIcon className="h-5 w-5" />
            </div>
            <h1 className="text-lg font-black tracking-tight">ThreddIQ</h1>
          </div>
          <div className="w-1/2 max-w-[300px]">
             <OnboardingProgressBar />
          </div>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Suspense fallback={<div className="h-40 w-full animate-pulse bg-white/5" />}>
            {children}
          </Suspense>
        </div>
      </main>

      <footer className="relative z-10 p-8 text-center">
        <p className="font-mono text-[10px] tracking-[0.2em] text-zinc-600 uppercase">
          Step into the loop &bull; Built for Founders
        </p>
      </footer>
    </div>
  );
}
