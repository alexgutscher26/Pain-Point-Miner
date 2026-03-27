import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SystemBannerProps {
  message: string;
  type?: "warning" | "error" | "info";
  isVisible?: boolean;
}

export function SystemBanner({
  message,
  type = "warning",
  isVisible = false,
}: SystemBannerProps) {
  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 px-4 py-2 text-[12px] font-bold uppercase tracking-widest border-b-2 transition-all duration-300 animate-in fade-in slide-in-from-top-1",
        type === "warning" && "bg-orange-500/10 border-orange-500/50 text-orange-200",
        type === "error" && "bg-red-500/10 border-red-500/50 text-red-200",
        type === "info" && "bg-blue-500/10 border-blue-500/50 text-blue-200"
      )}
    >
      <AlertCircle className="w-4 h-4" />
      <span>{message}</span>
    </div>
  );
}
