"use client";

import Link from "next/link";
import { TrendingUp, ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";

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
    <div className="flex min-h-screen w-full bg-black text-white antialiased font-sans">
      {/* Left Side: Dark Hero Panel */}
      <div className="hidden lg:flex flex-col w-1/2 bg-[#0a0a0a] p-12 relative overflow-hidden border-r border-white/5">
        {/* Glow effects */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-[#ff4500]/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-[#ff4500]/5 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="size-8 bg-[#ff4500] rounded flex items-center justify-center shadow-[0_4px_15px_rgba(255,69,0,0.5)]">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Pain-Point Miner
            </span>
          </Link>
        </div>

        {/* Content — sits right below logo */}
        <div className="relative z-10 max-w-lg mt-16 flex-1">
          <div className="mb-12">
            <p className="text-[12px] font-bold tracking-[0.2em] text-[#ff4500] uppercase mb-4">
              START FOR FREE
            </p>
            <h1 className="text-[40px] font-extrabold text-white leading-tight mb-6 tracking-tight">
              Stop guessing. Build what{" "}
              <span className="text-[#ff4500]">people need.</span>
            </h1>
            <p className="text-zinc-400 text-[17px] font-medium leading-relaxed">
              Join founders who validate SaaS ideas in hours — using real Reddit
              conversations as their research dataset.
            </p>
          </div>

          {/* Sample Insight Card */}
          <div className="bg-[#0f0f0f] border border-white/5 p-6 rounded-[20px] shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-[#ff4500]/10 text-[#ff4500] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-[#ff4500]/20">
                Pain Point Detected
              </span>
              <span className="text-zinc-500 text-xs font-medium">
                r/SaaS • 4h ago
              </span>
            </div>

            <blockquote className="text-white text-[17px] font-medium leading-relaxed mb-6">
              &quot;I&apos;ve been manually scanning Reddit for 3 hours to
              validate my idea. There has to be a better way to do this at
              scale.&quot;
            </blockquote>

            <div className="flex items-center justify-between border-t border-white/5 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-white/5">
                  <span className="text-zinc-300 text-xs font-bold">VP</span>
                </div>
                <div className="text-sm">
                  <p className="text-zinc-200 font-bold">u/ValidatePro</p>
                  <p className="text-zinc-500 text-xs">
                    187 Upvotes • 63 Comments
                  </p>
                </div>
              </div>

              <div className="flex gap-1 items-center">
                <TrendingUp className="w-4 h-4 text-[#ff4500]" />
                <span className="text-[#ff4500] text-xs font-bold italic">
                  High Demand
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex gap-8 text-zinc-600 text-sm mt-auto">
          <span>© 2024 Pain-Point Miner</span>
          <Link className="hover:text-white transition-colors" href="#">
            Privacy
          </Link>
          <Link className="hover:text-white transition-colors" href="#">
            Terms
          </Link>
        </div>
      </div>

      {/* Right Side: Sign-Up Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-[#000] overflow-y-auto">
        <div className="w-full max-w-[400px] flex flex-col">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-12">
            <div className="size-8 bg-[#ff4500] rounded flex items-center justify-center shadow-[0_4px_15px_rgba(255,69,0,0.4)]">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              Pain-Point Miner
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-[28px] font-extrabold text-white tracking-tight">
              Create your account
            </h2>
            <p className="text-zinc-400 mt-2 font-medium">
              Start your 3-day free trial. No credit card required.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-xs font-extrabold text-zinc-400 uppercase tracking-wider mb-1.5"
                htmlFor="name"
              >
                Full Name
              </label>
              <input
                className="w-full px-4 py-2.5 bg-[#0f0f0f] text-white border border-white/5 rounded-lg text-sm focus:ring-2 focus:ring-[#ff4500]/20 focus:border-[#ff4500]/50 outline-none transition-all placeholder:text-zinc-700"
                id="name"
                name="name"
                placeholder="John Smith"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label
                className="block text-xs font-extrabold text-zinc-400 uppercase tracking-wider mb-1.5"
                htmlFor="email"
              >
                Email Address
              </label>
              <input
                className="w-full px-4 py-2.5 bg-[#0f0f0f] text-white border border-white/5 rounded-lg text-sm focus:ring-2 focus:ring-[#ff4500]/20 focus:border-[#ff4500]/50 outline-none transition-all placeholder:text-zinc-700"
                id="email"
                name="email"
                placeholder="name@company.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label
                className="block text-xs font-extrabold text-zinc-400 uppercase tracking-wider mb-1.5"
                htmlFor="password"
              >
                Password
              </label>
              <input
                className="w-full px-4 py-2.5 bg-[#0f0f0f] text-white border border-white/5 rounded-lg text-sm focus:ring-2 focus:ring-[#ff4500]/20 focus:border-[#ff4500]/50 outline-none transition-all placeholder:text-zinc-700"
                id="password"
                name="password"
                placeholder="Min. 8 characters"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label
                className="block text-xs font-extrabold text-zinc-400 uppercase tracking-wider mb-1.5"
                htmlFor="confirm-password"
              >
                Confirm Password
              </label>
              <input
                className="w-full px-4 py-2.5 bg-[#0f0f0f] text-white border border-white/5 rounded-lg text-sm focus:ring-2 focus:ring-[#ff4500]/20 focus:border-[#ff4500]/50 outline-none transition-all placeholder:text-zinc-700"
                id="confirm-password"
                name="confirm-password"
                placeholder="••••••••"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm font-medium">{error}</p>
            )}

            <p className="text-xs text-zinc-600 leading-relaxed pt-1">
              By creating an account you agree to our{" "}
              <Link
                href="#"
                className="text-[#ff4500] hover:underline font-semibold"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="#"
                className="text-[#ff4500] hover:underline font-semibold"
              >
                Privacy Policy
              </Link>
              .
            </p>

            <button
              className="w-full bg-[#ff4500] text-white font-extrabold py-3 rounded-lg hover:bg-[#e03d00] shadow-[0_4px_20px_rgba(255,69,0,0.3)] transition-all flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-zinc-500">
            Already have an account?{" "}
            <Link
              className="text-[#ff4500] font-bold hover:underline"
              href="/sign-in"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
