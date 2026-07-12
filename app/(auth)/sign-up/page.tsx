"use client";

import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";

import { AuthLogo } from "@/components/auth/AuthLogo";
import { AuthInput } from "@/components/auth/AuthInput";
import { InsightCard } from "@/components/auth/InsightCard";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
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

  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-8">
      <div className="glass-card w-full max-w-5xl rounded-2xl">
        <div className="flex flex-col lg:flex-row">
          {/* Form panel */}
          <div className="flex w-full flex-col p-8 sm:p-10 lg:w-1/2">
            <AuthLogo />

            <div className="mt-10 mb-8">
              <h2 className="text-[28px] font-extrabold tracking-tight text-zinc-900">
                Create your account
              </h2>
              <p className="mt-2 font-medium text-zinc-500">
                Start mining pain points in minutes.
              </p>
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
                disabled={loading}
              />

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
                placeholder="Min. 8 characters"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />

              <AuthInput
                label="Confirm Password"
                id="confirm-password"
                placeholder="••••••••"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
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
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-zinc-500">
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
          <div className="hidden border-t border-black/[0.04] p-8 sm:p-10 lg:block lg:w-1/2 lg:border-l lg:border-t-0">
            <div className="flex h-full flex-col justify-center">
              <p className="mb-6 text-[11px] font-bold tracking-[0.2em] text-[#ff4500] uppercase">
                Pain Point Detected
              </p>
              <InsightCard
                badge="Pain Point Detected"
                subreddit="r/SaaS"
                time="4h ago"
                quote="I've been manually scanning Reddit for 3 hours to validate my idea. There has to be a better way to do this at scale."
                avatar={<span className="text-xs font-bold text-zinc-300">VP</span>}
                username="u/ValidatePro"
                upvotes={187}
                comments={63}
                intent="High Demand"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
