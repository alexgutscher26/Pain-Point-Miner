"use client";

import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";

import { AuthLogo } from "@/components/auth/AuthLogo";
import { AuthInput } from "@/components/auth/AuthInput";
import { InsightCard } from "@/components/auth/InsightCard";

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="currentColor"
      {...props}
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
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

  async function handleGithubSignIn() {
    try {
      setError("");
      setGithubLoading(true);
      const res = await signIn.social({
        provider: "github",
        callbackURL: "/dashboard",
      });
      if (res?.error) {
        setError(res.error.message ?? "Failed to sign in with GitHub.");
        setGithubLoading(false);
      }
    } catch {
      setError("An unexpected error occurred with GitHub authentication.");
      setGithubLoading(false);
    }
  }

  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-8">
      <div className="glass-card w-full max-w-5xl rounded-2xl">
        <div className="flex flex-col lg:flex-row">
          {/* Form panel */}
          <div className="flex w-full flex-col p-8 sm:p-10 lg:w-1/2">
            <AuthLogo />

            <div className="mt-8 mb-6">
              <h2 className="text-[28px] font-extrabold tracking-tight text-zinc-900">
                Welcome back
              </h2>
              <p className="mt-2 font-medium text-zinc-500">
                Sign in to continue mining insights.
              </p>
            </div>

            {/* GitHub OAuth Button */}
            <button
              type="button"
              onClick={handleGithubSignIn}
              disabled={loading || githubLoading}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-zinc-200 bg-white py-3 text-sm font-bold text-zinc-800 shadow-xs transition-all hover:border-zinc-300 hover:bg-zinc-50 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {githubLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-zinc-600" />
                  <span>Connecting to GitHub...</span>
                </>
              ) : (
                <>
                  <GithubIcon className="text-zinc-900" />
                  <span>Continue with GitHub</span>
                </>
              )}
            </button>

            <div className="relative my-6 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200" />
              </div>
              <span className="relative bg-white px-3 text-xs font-semibold tracking-wider text-zinc-600 uppercase">
                Or continue with email
              </span>
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
                  disabled={loading || githubLoading}
                />

                <AuthInput
                  label="Password"
                  id="password"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading || githubLoading}
                  forgotPassword
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-lg bg-red-500/10 p-3 text-[13px] font-medium text-red-600 ring-1 ring-red-500/20">
                  <span className="mt-0.5 text-red-500 select-none">⚠</span>
                  {error}
                </div>
              )}

              <button
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-[#ff4500] py-3.5 font-extrabold text-white shadow-[0_4px_25px_rgba(255,69,0,0.3)] transition-all hover:bg-[#e03d00] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                disabled={loading || githubLoading}
              >
                <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-white/0 via-white/10 to-white/0 transition-transform duration-1000 ease-in-out group-hover:translate-x-full"></div>
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

            <p className="mt-8 text-center text-[13px] font-medium text-zinc-500">
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
          <div className="hidden border-t border-black/[0.04] p-8 sm:p-10 lg:block lg:w-1/2 lg:border-t-0 lg:border-l">
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
