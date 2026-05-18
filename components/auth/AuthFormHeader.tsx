import { LogoIcon } from "@/components/Logo";

interface AuthFormHeaderProps {
  title: string;
  subtitle: string;
}

export function AuthFormHeader({ title, subtitle }: AuthFormHeaderProps) {
  return (
    <>
      {/* Mobile Logo */}
      <div className="mb-12 flex items-center gap-2.5 lg:hidden">
        <div className="flex size-8 items-center justify-center rounded bg-[#ff4500] shadow-[0_4px_15px_rgba(255,69,0,0.4)]">
          <LogoIcon className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight text-white">
          ThreddIQ
        </span>
      </div>

      <div className="mb-8">
        <h2 className="text-[28px] font-extrabold tracking-tight text-white">
          {title}
        </h2>
        <p className="mt-2 font-medium text-zinc-400">{subtitle}</p>
      </div>
    </>
  );
}
