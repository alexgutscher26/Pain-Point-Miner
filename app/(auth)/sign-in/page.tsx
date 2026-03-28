"use client";

import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";

import { AuthHero } from "@/components/auth/AuthHero";
import { AuthFormHeader } from "@/components/auth/AuthFormHeader";
import { AuthInput } from "@/components/auth/AuthInput";

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
    <div className="flex min-h-screen w-full overflow-hidden bg-black font-sans text-white antialiased">
      <AuthHero
        badge="WHY FOUNDERS LOVE IT"
        title={
          <>
            Build products{" "}
            <span className="text-[#ff4500]">people actually want.</span>
          </>
        }
        subtitle="We scan thousands of subreddits to find the exact problems your future customers are complaining about right now."
        insightProps={{
          badge: "Trending Insight",
          subreddit: "r/sales",
          time: "2h ago",
          quote:
            "Cold email deliverability is at an all-time low. I've tried every tool but 80% of my outreach lands in spam. Is anyone actually winning right now?",
          avatar:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuCpLlYYAZn40R7Lm84eVCNy4IOE8qFlZ6xYn6Ew7Y9zcJVBc4OHrmrWkSrxBcJDcGP1b65_1ZFDi98eLUtBve0QU-W3HGsByrCoTnOh5IezVZiJIHw3nBVLsSGUpi5W-8K6kAGUhd_kdp4dDYXXrO2Y8y972qYdKflGuVEElMlqJwmP7209vTWaOhpPg0wc3P2Q7GmDUv2-ZZgKCkuVTLWgAxpT2FcUMgMS4vDg8uLXxBsN5nDdFLUAWbh2-y1dAsfDX22vX_pp0g",
          username: "u/OutreachPro",
          upvotes: 242,
          comments: 84,
          intent: "High Intent",
        }}
      />

      {/* Right Side: Sign-In Form */}
      <div className="flex w-full items-center justify-center bg-black p-8 sm:p-12 lg:w-1/2 lg:p-24">
        <div className="flex w-full max-w-[400px] flex-col">
          <AuthFormHeader
            title="Welcome back"
            subtitle="Sign in to continue mining insights."
          />

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

            {error && (
              <p className="text-sm font-medium text-red-400">{error}</p>
            )}

            <button
              className="group mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#ff4500] py-3 font-extrabold text-white shadow-[0_4px_20px_rgba(255,69,0,0.3)] transition-all hover:bg-[#e03d00] disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={loading}
            >
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

          <p className="mt-8 text-center text-sm text-zinc-500">
            Don&apos;t have an account?{" "}
            <Link
              className="font-bold text-[#ff4500] hover:underline"
              href="/sign-up"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
