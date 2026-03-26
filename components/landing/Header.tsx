"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "@/lib/auth-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Menu, LogOut, LayoutDashboard, Settings, User, ChevronDown, ExternalLink } from "lucide-react";
import { useState } from "react";

export function Header() {
  const { data: session, isPending } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Features", href: "/#features" },
    { name: "Pricing", href: "/#pricing" },
    { name: "Resources", href: "/resources/best-subreddits-by-industry" },
    { name: "FAQ", href: "/#faq" },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-linear-to-tr from-[#ff4500] to-[#ff6b33] flex items-center justify-center relative overflow-hidden">
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4 text-white fill-current"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
              </svg>
            </div>
            <span className="font-bold text-base sm:text-lg text-white tracking-tight">
              ThreddIQ
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-[13px] font-bold text-zinc-400 hover:text-white transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {!isPending && (
            <>
              {session ? (
                <div className="flex items-center gap-4">
                  <Link
                    href="/dashboard"
                    className="hidden sm:block text-[13px] font-bold text-zinc-400 hover:text-white transition-colors"
                  >
                    Dashboard
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 outline-hidden group">
                        <Avatar size="sm" className="border border-white/10 group-hover:border-[#ff4500]/50 transition-colors">
                          <AvatarImage src={session.user.image || ""} alt={session.user.name} />
                          <AvatarFallback className="bg-[#ff4500]/10 text-[#ff4500] font-black text-[10px]">
                            {session.user.name?.substring(0, 2).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <ChevronDown className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-[#0f0f0f] border-white/10 text-zinc-300">
                      <DropdownMenuLabel className="font-bold text-white">
                        <div className="flex flex-col gap-0.5">
                          <span>{session.user.name}</span>
                          <span className="text-[10px] text-zinc-500 font-medium">{session.user.email}</span>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-white/5" />
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="cursor-pointer flex items-center gap-2">
                          <LayoutDashboard className="w-4 h-4" />
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/settings" className="cursor-pointer flex items-center gap-2">
                          <Settings className="w-4 h-4" />
                          <span>Settings</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/5" />
                      <DropdownMenuItem 
                        onClick={() => signOut()}
                        className="cursor-pointer text-red-400 focus:text-red-400 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link
                    href="/sign-in"
                    className="text-sm font-bold text-zinc-400 hover:text-white transition-colors"
                  >
                    Sign in
                  </Link>
                  <Button
                    asChild
                    className="bg-[#ff4500] hover:bg-[#ff5a1a] text-white rounded-xl px-5 h-10 text-sm font-black shadow-lg shadow-[#ff4500]/10 transition-all hidden md:flex"
                  >
                    <Link href="/sign-up">Start Free Trial</Link>
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Mobile Menu Trigger */}
          <div className="lg:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-white/5">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-[#0a0a0a] border-white/5 p-8 text-white w-[300px]">
                <SheetHeader className="mb-12 text-left p-0">
                  <SheetTitle className="text-white flex items-center gap-2">
                     <div className="w-6 h-6 rounded-full bg-[#ff4500] flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                     </div>
                     ThreddIQ
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="text-2xl font-black text-zinc-500 hover:text-white transition-colors flex items-center justify-between group"
                    >
                      {link.name}
                      <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                    </Link>
                  ))}
                  <div className="pt-8 border-t border-white/5 flex flex-col gap-4">
                     {session ? (
                        <Button asChild className="bg-zinc-800 hover:bg-zinc-700 text-white font-black py-6 rounded-2xl text-lg">
                           <Link href="/dashboard" onClick={() => setIsOpen(false)}>Go to Dashboard</Link>
                        </Button>
                     ) : (
                        <>
                           <Button asChild className="bg-[#ff4500] hover:bg-[#ff5a1a] text-white font-black py-6 rounded-2xl text-lg">
                              <Link href="/sign-up" onClick={() => setIsOpen(false)}>Start Free Trial</Link>
                           </Button>
                           <Link 
                              href="/sign-in" 
                              onClick={() => setIsOpen(false)}
                              className="text-center font-bold text-zinc-500 hover:text-white transition-colors"
                           >
                              Already have an account? Sign in
                           </Link>
                        </>
                     )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

const ArrowRight = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);
