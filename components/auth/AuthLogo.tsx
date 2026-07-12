import { LogoIcon } from "@/components/Logo";
import Link from "next/link";

export function AuthLogo({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Link href="/" className="flex items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded bg-[#ff4500] shadow-[0_4px_15px_rgba(255,69,0,0.5)]">
          <LogoIcon className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight text-zinc-900">
          ThreddIQ
        </span>
      </Link>
    </div>
  );
}
