"use client";

import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/sign-in");
        },
      },
    });
  };

  return (
    <button
      onClick={handleSignOut}
      className="group flex w-full items-center gap-3.5 rounded-lg border border-transparent px-3.5 py-2.5 text-left font-mono text-[11px] tracking-wide text-zinc-500 uppercase transition-colors hover:bg-rose-500/5 hover:text-rose-600"
    >
      <LogOut className="group-hover:text-rose-550 h-[18px] w-[18px] text-zinc-400 transition-colors" />
      Logout
    </button>
  );
}
