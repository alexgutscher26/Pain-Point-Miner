import Link from "next/link";
import { TrendingUp, ArrowRight } from "lucide-react";

export default function SignUpPage() {
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
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z" fill="currentColor"></path>
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Pain-Point Miner</span>
          </Link>
        </div>

        {/* Content — sits right below logo */}
        <div className="relative z-10 max-w-lg mt-16 flex-1">
          <div className="mb-12">
            <p className="text-[12px] font-bold tracking-[0.2em] text-[#ff4500] uppercase mb-4">START FOR FREE</p>
            <h1 className="text-[40px] font-extrabold text-white leading-tight mb-6 tracking-tight">
              Stop guessing. Build what <span className="text-[#ff4500]">people need.</span>
            </h1>
            <p className="text-zinc-400 text-[17px] font-medium leading-relaxed">Join founders who validate SaaS ideas in hours — using real Reddit conversations as their research dataset.</p>
          </div>

          {/* Sample Insight Card */}
          <div className="bg-[#0f0f0f] border border-white/5 p-6 rounded-[20px] shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-[#ff4500]/10 text-[#ff4500] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-[#ff4500]/20">Pain Point Detected</span>
              <span className="text-zinc-500 text-xs font-medium">r/SaaS • 4h ago</span>
            </div>

            <blockquote className="text-white text-[17px] font-medium leading-relaxed mb-6">
              &quot;I&apos;ve been manually scanning Reddit for 3 hours to validate my idea. There has to be a better way to do this at scale.&quot;
            </blockquote>

            <div className="flex items-center justify-between border-t border-white/5 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-white/5">
                  <span className="text-zinc-300 text-xs font-bold">VP</span>
                </div>
                <div className="text-sm">
                  <p className="text-zinc-200 font-bold">u/ValidatePro</p>
                  <p className="text-zinc-500 text-xs">187 Upvotes • 63 Comments</p>
                </div>
              </div>

              <div className="flex gap-1 items-center">
                <TrendingUp className="w-4 h-4 text-[#ff4500]" />
                <span className="text-[#ff4500] text-xs font-bold italic">High Demand</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex gap-8 text-zinc-600 text-sm mt-auto">
          <span>© 2024 Pain-Point Miner</span>
          <Link className="hover:text-white transition-colors" href="#">Privacy</Link>
          <Link className="hover:text-white transition-colors" href="#">Terms</Link>
        </div>
      </div>

      {/* Right Side: Sign-Up Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-[#000] overflow-y-auto">
        <div className="w-full max-w-[400px] flex flex-col">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-12">
            <div className="size-8 bg-[#ff4500] rounded flex items-center justify-center shadow-[0_4px_15px_rgba(255,69,0,0.4)]">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z" fill="currentColor"></path>
              </svg>
            </div>
            <span className="text-lg font-bold text-white tracking-tight">Pain-Point Miner</span>
          </div>

          <div className="mb-8">
            <h2 className="text-[28px] font-extrabold text-white tracking-tight">Create your account</h2>
            <p className="text-zinc-400 mt-2 font-medium">Start your 3-day free trial. No credit card required.</p>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <button className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-[#0f0f0f] border border-white/5 rounded-lg text-sm font-semibold text-zinc-300 hover:border-white/10 hover:bg-[#181818] transition-all">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-5.38z" fill="#EA4335"></path>
              </svg>
              Continue with Google
            </button>
            <button className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-[#0f0f0f] border border-white/5 rounded-lg text-sm font-semibold text-zinc-300 hover:border-white/10 hover:bg-[#181818] transition-all">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" fillRule="evenodd"></path>
              </svg>
              Continue with GitHub
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#000] px-3 text-zinc-600 font-medium tracking-wider">Or continue with email</span>
            </div>
          </div>

          {/* Form */}
          <form action="#" className="space-y-4" method="POST">
            <div>
              <label className="block text-xs font-extrabold text-zinc-400 uppercase tracking-wider mb-1.5" htmlFor="name">Full Name</label>
              <input
                className="w-full px-4 py-2.5 bg-[#0f0f0f] text-white border border-white/5 rounded-lg text-sm focus:ring-2 focus:ring-[#ff4500]/20 focus:border-[#ff4500]/50 outline-none transition-all placeholder:text-zinc-700"
                id="name" name="name" placeholder="John Smith" type="text"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-zinc-400 uppercase tracking-wider mb-1.5" htmlFor="email">Email Address</label>
              <input
                className="w-full px-4 py-2.5 bg-[#0f0f0f] text-white border border-white/5 rounded-lg text-sm focus:ring-2 focus:ring-[#ff4500]/20 focus:border-[#ff4500]/50 outline-none transition-all placeholder:text-zinc-700"
                id="email" name="email" placeholder="name@company.com" type="email"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-zinc-400 uppercase tracking-wider mb-1.5" htmlFor="password">Password</label>
              <input
                className="w-full px-4 py-2.5 bg-[#0f0f0f] text-white border border-white/5 rounded-lg text-sm focus:ring-2 focus:ring-[#ff4500]/20 focus:border-[#ff4500]/50 outline-none transition-all placeholder:text-zinc-700"
                id="password" name="password" placeholder="Min. 8 characters" type="password"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-zinc-400 uppercase tracking-wider mb-1.5" htmlFor="confirm-password">Confirm Password</label>
              <input
                className="w-full px-4 py-2.5 bg-[#0f0f0f] text-white border border-white/5 rounded-lg text-sm focus:ring-2 focus:ring-[#ff4500]/20 focus:border-[#ff4500]/50 outline-none transition-all placeholder:text-zinc-700"
                id="confirm-password" name="confirm-password" placeholder="••••••••" type="password"
              />
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed pt-1">
              By creating an account you agree to our{" "}
              <Link href="#" className="text-[#ff4500] hover:underline font-semibold">Terms of Service</Link>{" "}
              and{" "}
              <Link href="#" className="text-[#ff4500] hover:underline font-semibold">Privacy Policy</Link>.
            </p>

            <button
              className="w-full bg-[#ff4500] text-white font-extrabold py-3 rounded-lg hover:bg-[#e03d00] shadow-[0_4px_20px_rgba(255,69,0,0.3)] transition-all flex items-center justify-center gap-2 group"
              type="submit"
            >
              Create account
              <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-zinc-500">
            Already have an account?{" "}
            <Link className="text-[#ff4500] font-bold hover:underline" href="/sign-in">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
