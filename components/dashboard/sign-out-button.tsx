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
      className="flex items-center gap-3.5 px-3.5 py-2.5 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/5 transition-all w-full text-left font-medium text-sm rounded-xl group"
    >
      <LogOut className="w-[18px] h-[18px] text-zinc-500 group-hover:text-rose-500 transition-colors" />
      Logout
    </button>
  );
}
