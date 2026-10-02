"use client";

import Link from "next/link";
import { ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

import { AuthLogo } from "@/components/auth/AuthLogo";
import { AuthInput } from "@/components/auth/AuthInput";
import { InsightCard } from "@/components/auth/InsightCard";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await authClient.requestPasswordReset({
      email,
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (authError) {
      setError(authError.message ?? "Something went wrong. Please try again.");
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  }

  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-8">
      <div className="glass-card w-full max-w-5xl rounded-2xl">
        <div className="flex flex-col lg:flex-row">
          {/* Form panel */}
          <div className="flex w-full flex-col p-8 sm:p-10 lg:w-1/2">
            <AuthLogo />

            {success ? (
              <div className="mt-10 flex flex-col items-center text-center">
                <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-[#ff4500]/10 text-[#ff4500]">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h2 className="text-[28px] font-extrabold tracking-tight text-zinc-900">
                  Check your email
                </h2>
                <p className="mt-2 mb-6 font-medium text-zinc-500">
                  We&apos;ve sent a password reset link to {email}. If it
                  doesn&apos;t arrive soon, check your spam folder.
                </p>
                <Link
                  className="group flex w-full items-center justify-center gap-2 rounded-lg bg-[#ff4500] py-3 font-extrabold text-white shadow-[0_4px_20px_rgba(255,69,0,0.3)] transition-all hover:bg-[#e03d00]"
                  href="/sign-in"
                >
                  Back to sign in
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            ) : (
              <>
                <div className="mt-10 mb-8">
                  <h2 className="text-[28px] font-extrabold tracking-tight text-zinc-900">
                    Forgot password?
                  </h2>
                  <p className="mt-2 font-medium text-zinc-500">
                    No problem. Enter your email and we&apos;ll send you a link
                    to reset it.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
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

                  {error && (
                    <p className="text-sm font-medium text-red-600">{error}</p>
                  )}

                  <button
                    className="group mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#ff4500] py-3 font-extrabold text-white shadow-[0_4px_20px_rgba(255,69,0,0.3)] transition-all hover:bg-[#e03d00] disabled:cursor-not-allowed disabled:opacity-60"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Sending link...
                      </>
                    ) : (
                      <>
                        Send reset link
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </button>
                </form>

                <p className="mt-8 text-center text-sm text-zinc-500">
                  Remember your password?{" "}
                  <Link
                    className="font-bold text-[#ff4500] hover:underline"
                    href="/sign-in"
                  >
                    Sign in
                  </Link>
                </p>
              </>
            )}
          </div>

          {/* Insight panel */}
          <div className="hidden border-t border-black/[0.04] p-8 sm:p-10 lg:block lg:w-1/2 lg:border-t-0 lg:border-l">
            <div className="flex h-full flex-col justify-center">
              <p className="mb-6 text-[11px] font-bold tracking-[0.2em] text-[#ff4500] uppercase">
                Security Tip
              </p>
              <InsightCard
                badge="Security Tip"
                subreddit="r/cybersecurity"
                time="Just now"
                quote="Always use a unique password for every service. Your ThreddIQ data is valuable — keep it safe with a strong, fresh password."
                avatar="https://lh3.googleusercontent.com/aida-public/AB6AXuCpLlYYAZn40R7Lm84eVCNy4IOE8qFlZ6xYn6Ew7Y9zcJVBc4OHrmrWkSrxBcJDcGP1b65_1ZFDi98eLUtBve0QU-W3HGsByrCoTnOh5IezVZiJIHw3nBVLsSGUpi5W-8K6kAGUhd_kdp4dDYXXrO2Y8y972qYdKflGuVEElMlqJwmP7209vTWaOhpPg0wc3P2Q7GmDUv2-ZZgKCkuVTLWgAxpT2FcUMgMS4vDg8uLXxBsN5nDdFLUAWbh2-y1dAsfDX22vX_pp0g"
                username="u/SecureMiner"
                upvotes={120}
                comments={12}
                intent="Safety"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
