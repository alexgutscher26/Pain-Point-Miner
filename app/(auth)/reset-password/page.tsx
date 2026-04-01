"use client";

import Link from "next/link";
import { ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";

import { AuthHero } from "@/components/auth/AuthHero";
import { AuthFormHeader } from "@/components/auth/AuthFormHeader";
import { AuthInput } from "@/components/auth/AuthInput";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!token) {
      setError("Missing or invalid token. Please request a new reset link.");
      return;
    }

    setLoading(true);

    const { error: authError } = await authClient.resetPassword({
      newPassword: password,
      token,
    });

    if (authError) {
      setError(authError.message ?? "Failed to reset password.");
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      // Wait 3 seconds then redirect
      setTimeout(() => {
        router.push("/sign-in");
      }, 3000);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-[#ff4500]/10 text-[#ff4500]">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <AuthFormHeader
          title="Password updated"
          subtitle="Your password has been successfully reset. Redirecting you to sign in..."
        />
        <Link
          className="group mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#ff4500] py-3 font-extrabold text-white shadow-[0_4px_20px_rgba(255,69,0,0.3)] transition-all hover:bg-[#e03d00]"
          href="/sign-in"
        >
          Go to sign in now
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    );
  }

  return (
    <>
      <AuthFormHeader
        title="Set new password"
        subtitle="Choose a strong password you haven't used before."
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          label="New Password"
          id="password"
          placeholder="••••••••"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />

        <AuthInput
          label="Confirm Password"
          id="confirmPassword"
          placeholder="••••••••"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={loading}
        />

        {error && (
          <p className="text-sm font-medium text-red-400">{error}</p>
        )}

        {!token && (
          <p className="text-sm font-medium text-yellow-400">
            No reset token found. Please use the link from your email.
          </p>
        )}

        <button
          className="group mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#ff4500] py-3 font-extrabold text-white shadow-[0_4px_20px_rgba(255,69,0,0.3)] transition-all hover:bg-[#e03d00] disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={loading || !token}
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Updating password...
            </>
          ) : (
            <>
              Update password
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-black font-sans text-white antialiased">
      <AuthHero
        badge="SECURITY REFRESH"
        title={
          <>
            Back in the <span className="text-[#ff4500]">game.</span>
          </>
        }
        subtitle="Your hard-earned insights are waiting. Reset your password and get back to finding those golden opportunities."
        insightProps={{
          badge: "Security Tip",
          subreddit: "r/cybersecurity",
          time: "Just now",
          quote:
            "Always use a unique password for every service. Your ThreddIQ data is valuable — keep it safe with a strong, fresh password.",
          avatar:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuCpLlYYAZn40R7Lm84eVCNy4IOE8qFlZ6xYn6Ew7Y9zcJVBc4OHrmrWkSrxBcJDcGP1b65_1ZFDi98eLUtBve0QU-W3HGsByrCoTnOh5IezVZiJIHw3nBVLsSGUpi5W-8K6kAGUhd_kdp4dDYXXrO2Y8y972qYdKflGuVEElMlqJwmP7209vTWaOhpPg0wc3P2Q7GmDUv2-ZZgKCkuVTLWgAxpT2FcUMgMS4vDg8uLXxBsN5nDdFLUAWbh2-y1dAsfDX22vX_pp0g",
          username: "u/SecureMiner",
          upvotes: 120,
          comments: 12,
          intent: "Safety",
        }}
      />

      <div className="flex w-full items-center justify-center bg-black p-8 sm:p-12 lg:w-1/2 lg:p-24">
        <div className="flex w-full max-w-[400px] flex-col">
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="mb-4 h-8 w-8 animate-spin text-[#ff4500]" />
              <p className="text-zinc-500">Loading reset form...</p>
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
