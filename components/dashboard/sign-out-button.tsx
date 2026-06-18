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
      className="group flex w-full items-center gap-3.5 border border-transparent px-3.5 py-2.5 text-left font-mono text-[11px] tracking-wide text-zinc-500 uppercase transition-colors rounded-lg hover:bg-rose-500/5 hover:text-rose-600"
    >
      <LogOut className="h-[18px] w-[18px] text-zinc-400 transition-colors group-hover:text-rose-550" />
      Logout
    </button>
  );
}
