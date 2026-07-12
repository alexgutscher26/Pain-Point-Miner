"use client";

import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";

import { AuthLogo } from "@/components/auth/AuthLogo";
import { AuthInput } from "@/components/auth/AuthInput";
import { InsightCard } from "@/components/auth/InsightCard";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await signIn.email({
      email,
      password,
      callbackURL: "/dashboard",
    });

    if (authError) {
      setError(authError.message ?? "Invalid email or password.");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-8">
      <div className="glass-card w-full max-w-5xl rounded-2xl">
        <div className="flex flex-col lg:flex-row">
          {/* Form panel */}
          <div className="flex w-full flex-col p-8 sm:p-10 lg:w-1/2">
            <AuthLogo />

            <div className="mt-10 mb-8">
              <h2 className="text-[28px] font-extrabold tracking-tight text-zinc-900">
                Welcome back
              </h2>
              <p className="mt-2 font-medium text-zinc-500">
                Sign in to continue mining insights.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4">
                <AuthInput
                  label="Email Address"
                  id="email"
                  placeholder="name@company.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />

                <AuthInput
                  label="Password"
                  id="password"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  forgotPassword
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-lg bg-red-500/10 p-3 text-[13px] font-medium text-red-600 ring-1 ring-red-500/20">
                  <span className="mt-0.5 select-none text-red-500">⚠</span>
                  {error}
                </div>
              )}

              <button
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-[#ff4500] py-3.5 font-extrabold text-white shadow-[0_4px_25px_rgba(255,69,0,0.3)] transition-all hover:bg-[#e03d00] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                disabled={loading}
              >
                <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-10 text-center text-[13px] font-medium text-zinc-500">
              Don&apos;t have an account?{" "}
              <Link
                className="font-bold text-[#ff4500] hover:underline"
                href="/sign-up"
              >
                Create an account
              </Link>
            </p>
          </div>

          {/* Insight panel */}
          <div className="hidden border-t border-black/[0.04] p-8 sm:p-10 lg:block lg:w-1/2 lg:border-l lg:border-t-0">
            <div className="flex h-full flex-col justify-center">
              <p className="mb-6 text-[11px] font-bold tracking-[0.2em] text-[#ff4500] uppercase">
                Trending Insight
              </p>
              <InsightCard
                badge="Trending Insight"
                subreddit="r/sales"
                time="2h ago"
                quote="Cold email deliverability is at an all-time low. I've tried every tool but 80% of my outreach lands in spam. Is anyone actually winning right now?"
                avatar="https://lh3.googleusercontent.com/aida-public/AB6AXuCpLlYYAZn40R7Lm84eVCNy4IOE8qFlZ6xYn6Ew7Y9zcJVBc4OHrmrWkSrxBcJDcGP1b65_1ZFDi98eLUtBve0QU-W3HGsByrCoTnOh5IezVZiJIHw3nBVLsSGUpi5W-8K6kAGUhd_kdp4dDYXXrO2Y8y972qYdKflGuVEElMlqJwmP7209vTWaOhpPg0wc3P2Q7GmDUv2-ZZgKCkuVTLWgAxpT2FcUMgMS4vDg8uLXxBsN5nDdFLUAWbh2-y1dAsfDX22vX_pp0g"
                username="u/OutreachPro"
                upvotes={242}
                comments={84}
                intent="High Intent"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
