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
        "animate-in fade-in slide-in-from-top-1 flex items-center justify-center gap-2 border-b-2 px-4 py-2 text-[12px] font-bold tracking-widest uppercase transition-all duration-300",
        type === "warning" &&
          "border-orange-500/50 bg-orange-500/10 text-orange-200",
        type === "error" && "border-red-500/50 bg-red-500/10 text-red-200",
        type === "info" && "border-blue-500/50 bg-blue-500/10 text-blue-200",
      )}
    >
      <AlertCircle className="h-4 w-4" />
      <span>{message}</span>
    </div>
  );
}
