"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogoIcon } from "@/components/Logo";

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
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Menu,
  LogOut,
  LayoutDashboard,
  Settings,
  ChevronDown,
} from "lucide-react";
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
    <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="group flex items-center gap-2">
            <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded bg-linear-to-tr from-[#ff4500] to-[#ff6b33] shadow-[0_4px_12px_rgba(255,69,0,0.3)]">
              <LogoIcon className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-bold tracking-tight text-white sm:text-lg">
              ThreddIQ
            </span>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-[13px] font-bold text-zinc-400 transition-colors hover:text-white"
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
                    className="hidden text-[13px] font-bold text-zinc-400 transition-colors hover:text-white sm:block"
                  >
                    Dashboard
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="group flex items-center gap-2 outline-hidden">
                        <Avatar
                          size="sm"
                          className="border border-white/10 transition-colors group-hover:border-[#ff4500]/50"
                        >
                          <AvatarImage
                            src={session.user.image || ""}
                            alt={session.user.name}
                          />
                          <AvatarFallback className="bg-[#ff4500]/10 text-[10px] font-black text-[#ff4500]">
                            {session.user.name?.substring(0, 2).toUpperCase() ||
                              "U"}
                          </AvatarFallback>
                        </Avatar>
                        <ChevronDown className="h-3.5 w-3.5 text-zinc-500 transition-colors group-hover:text-white" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-56 border-white/10 bg-[#0f0f0f] text-zinc-300"
                    >
                      <DropdownMenuLabel className="font-bold text-white">
                        <div className="flex flex-col gap-0.5">
                          <span>{session.user.name}</span>
                          <span className="text-[10px] font-medium text-zinc-500">
                            {session.user.email}
                          </span>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-white/5" />
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard"
                          className="flex cursor-pointer items-center gap-2"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard/settings"
                          className="flex cursor-pointer items-center gap-2"
                        >
                          <Settings className="h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/5" />
                      <DropdownMenuItem
                        onClick={() => signOut()}
                        className="flex cursor-pointer items-center gap-2 text-red-400 focus:text-red-400"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link
                    href="/sign-in"
                    className="text-sm font-bold text-zinc-400 transition-colors hover:text-white"
                  >
                    Sign in
                  </Link>
                  <Button
                    asChild
                    className="hidden h-10 rounded-xl bg-[#ff4500] px-5 text-sm font-black text-white shadow-lg shadow-[#ff4500]/10 transition-all hover:bg-[#ff5a1a] md:flex"
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-zinc-400 hover:bg-white/5 hover:text-white"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[300px] border-white/5 bg-[#0a0a0a] p-8 text-white"
              >
                <SheetHeader className="mb-12 p-0 text-left">
                  <SheetTitle className="flex items-center gap-2 text-white">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ff4500]">
                      <div className="h-2 w-2 rounded-full bg-white" />
                    </div>
                    ThreddIQ
                  </SheetTitle>
                  <SheetDescription className="sr-only">
                    Navigate through ThreddIQ features and pricing.
                  </SheetDescription>
                </SheetHeader>
                <nav className="flex flex-col gap-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="group flex items-center justify-between text-2xl font-black text-zinc-500 transition-colors hover:text-white"
                    >
                      {link.name}
                      <ArrowRight className="h-5 w-5 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                    </Link>
                  ))}
                  <div className="flex flex-col gap-4 border-t border-white/5 pt-8">
                    {session ? (
                      <Button
                        asChild
                        className="rounded-2xl bg-zinc-800 py-6 text-lg font-black text-white hover:bg-zinc-700"
                      >
                        <Link
                          href="/dashboard"
                          onClick={() => setIsOpen(false)}
                        >
                          Go to Dashboard
                        </Link>
                      </Button>
                    ) : (
                      <>
                        <Button
                          asChild
                          className="rounded-2xl bg-[#ff4500] py-6 text-lg font-black text-white hover:bg-[#ff5a1a]"
                        >
                          <Link
                            href="/sign-up"
                            onClick={() => setIsOpen(false)}
                          >
                            Start Free Trial
                          </Link>
                        </Button>
                        <Link
                          href="/sign-in"
                          onClick={() => setIsOpen(false)}
                          className="text-center font-bold text-zinc-500 transition-colors hover:text-white"
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
