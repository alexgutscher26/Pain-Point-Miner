"use client";

import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp, signIn } from "@/lib/auth-client";

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

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    const { error: authError } = await signUp.email({
      email,
      password,
      name,
    });

    if (authError) {
      setError(
        authError.message ?? "Failed to create account. Please try again.",
      );
      setLoading(false);
    } else {
      router.push("/dashboard/search");
    }
  }

  async function handleGithubSignUp() {
    try {
      setError("");
      setGithubLoading(true);
      const res = await signIn.social({
        provider: "github",
        callbackURL: "/dashboard/search",
      });
      if (res?.error) {
        setError(res.error.message ?? "Failed to sign up with GitHub.");
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
                Create your account
              </h2>
              <p className="mt-2 font-medium text-zinc-500">
                Start mining pain points in minutes.
              </p>
            </div>

            {/* GitHub OAuth Button */}
            <button
              type="button"
              onClick={handleGithubSignUp}
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
                  <span>Sign up with GitHub</span>
                </>
              )}
            </button>

            <div className="relative my-6 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200" />
              </div>
              <span className="relative bg-white px-3 text-xs font-semibold tracking-wider text-zinc-600 uppercase">
                Or sign up with email
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AuthInput
                label="Full Name"
                id="name"
                placeholder="John Smith"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading || githubLoading}
              />

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
                placeholder="Min. 8 characters"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading || githubLoading}
              />

              <AuthInput
                label="Confirm Password"
                id="confirm-password"
                placeholder="••••••••"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading || githubLoading}
              />

              {error && (
                <p className="text-sm font-medium text-red-600">{error}</p>
              )}

              <p className="pt-1 text-xs leading-relaxed text-zinc-500">
                By creating an account you agree to our{" "}
                <Link
                  href="/terms"
                  className="font-semibold text-[#ff4500] hover:underline"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="font-semibold text-[#ff4500] hover:underline"
                >
                  Privacy Policy
                </Link>
                .
              </p>

              <button
                className="group flex w-full items-center justify-center gap-2 rounded-lg bg-[#ff4500] py-3 font-extrabold text-white shadow-[0_4px_20px_rgba(255,69,0,0.3)] transition-all hover:bg-[#e03d00] disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                disabled={loading || githubLoading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-[13px] font-medium text-zinc-500">
              Already have an account?{" "}
              <Link
                className="font-bold text-[#ff4500] hover:underline"
                href="/sign-in"
              >
                Sign in
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
                badge="High Intent"
                subreddit="r/SaaS"
                time="4h ago"
                quote="I spend 6 hours every week manually reviewing competitor reviews and Reddit threads to see what features we should build next. I'd easily pay $100/mo for a tool that just tells me the top 3 requested features every Monday."
                avatar="https://lh3.googleusercontent.com/aida-public/AB6AXuCpLlYYAZn40R7Lm84eVCNy4IOE8qFlZ6xYn6Ew7Y9zcJVBc4OHrmrWkSrxBcJDcGP1b65_1ZFDi98eLUtBve0QU-W3HGsByrCoTnOh5IezVZiJIHw3nBVLsSGUpi5W-8K6kAGUhd_kdp4dDYXXrO2Y8y972qYdKflGuVEElMlqJwmP7209vTWaOhpPg0wc3P2Q7GmDUv2-ZZgKCkuVTLWgAxpT2FcUMgMS4vDg8uLXxBsN5nDdFLUAWbh2-y1dAsfDX22vX_pp0g"
                username="u/FounderDaily"
                upvotes={389}
                comments={112}
                intent="High Intent"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
