import Link from "next/link";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  forgotPassword?: boolean;
}

export function AuthInput({
  label,
  id,
  forgotPassword,
  ...props
}: AuthInputProps) {
  return (
    <div suppressHydrationWarning>
      <div className="mb-1.5 flex justify-between">
        <label
          className="mb-1.5 block text-xs font-extrabold tracking-wider text-zinc-700 uppercase"
          htmlFor={id}
        >
          {label}
        </label>
        {forgotPassword && (
          <Link
            className="text-xs font-semibold text-[#ff4500] hover:underline"
            href="/forgot-password"
          >
            Forgot password?
          </Link>
        )}
      </div>
      <input
        className="w-full rounded-lg border border-zinc-200/60 bg-white/80 px-4 py-2.5 text-sm text-zinc-900 backdrop-blur-sm transition-all outline-none placeholder:text-zinc-400 focus:border-[#ff4500]/50 focus:ring-2 focus:ring-[#ff4500]/20 disabled:cursor-not-allowed disabled:opacity-60"
        id={id}
        {...props}
      />
    </div>
  );
}
