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
    { name: "Resources", href: "/resources" },
    { name: "FAQ", href: "/#faq" },
  ];

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex w-full justify-center px-4">
      <header className="w-full max-w-5xl rounded-full border border-zinc-200/60 bg-white/75 shadow-xs backdrop-blur-md">
        <div className="flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="group flex items-center gap-2">
            <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-linear-to-tr from-[#ff4500] to-[#ff6b33] shadow-[0_4px_12px_rgba(255,69,0,0.2)]">
              <LogoIcon className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-extrabold tracking-tight text-zinc-900 sm:text-lg">
              ThreddIQ
            </span>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-[13px] font-bold text-zinc-600 transition-colors hover:text-zinc-900"
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
                    className="hidden text-[13px] font-bold text-zinc-600 transition-colors hover:text-zinc-900 sm:block"
                  >
                    Dashboard
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="group flex items-center gap-2 outline-hidden">
                        <Avatar
                          size="sm"
                          className="border border-black/10 transition-colors group-hover:border-[#ff4500]/50"
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
                        <ChevronDown className="h-3.5 w-3.5 text-zinc-400 transition-colors group-hover:text-zinc-800" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-56 border-zinc-200 bg-white text-zinc-700 shadow-md"
                    >
                      <DropdownMenuLabel className="font-bold text-zinc-900">
                        <div className="flex flex-col gap-0.5">
                          <span>{session.user.name}</span>
                          <span className="text-[10px] font-medium text-zinc-500">
                            {session.user.email}
                          </span>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-zinc-100" />
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard"
                          className="flex cursor-pointer items-center gap-2 text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50"
                        >
                          <LayoutDashboard className="h-4 w-4 text-zinc-500" />
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard/settings"
                          className="flex cursor-pointer items-center gap-2 text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50"
                        >
                          <Settings className="h-4 w-4 text-zinc-500" />
                          <span>Settings</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-zinc-100" />
                      <DropdownMenuItem
                        onClick={() => signOut()}
                        className="flex cursor-pointer items-center gap-2 text-red-500 focus:text-red-600 focus:bg-red-50"
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
                    className="text-sm font-bold text-zinc-600 transition-colors hover:text-zinc-900"
                  >
                    Sign in
                  </Link>
                  <Button
                    asChild
                    className="hidden h-10 rounded-full bg-[#ff4500] px-5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#e03d00] md:flex"
                  >
                    <Link href="/sign-up">Get Started</Link>
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
                  className="text-zinc-500 hover:bg-black/5 hover:text-zinc-900"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[300px] border-zinc-100 bg-white p-8 text-zinc-900"
              >
                <SheetHeader className="mb-12 p-0 text-left">
                  <SheetTitle className="flex items-center gap-2 text-zinc-900">
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
                      className="group flex items-center justify-between text-xl font-bold text-zinc-500 transition-colors hover:text-zinc-900"
                    >
                      {link.name}
                      <ArrowRight className="h-5 w-5 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                    </Link>
                  ))}
                  <div className="flex flex-col gap-4 border-t border-zinc-100 pt-8">
                    {session ? (
                      <Button
                        asChild
                        className="rounded-full bg-zinc-900 py-6 text-base font-bold text-white hover:bg-zinc-800"
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
                          className="rounded-full bg-[#ff4500] py-6 text-base font-bold text-white hover:bg-[#e03d00]"
                        >
                          <Link
                            href="/sign-up"
                            onClick={() => setIsOpen(false)}
                          >
                            Get Started
                          </Link>
                        </Button>
                        <Link
                          href="/sign-in"
                          onClick={() => setIsOpen(false)}
                          className="text-center font-bold text-zinc-500 transition-colors hover:text-zinc-900"
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
  </div>
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
