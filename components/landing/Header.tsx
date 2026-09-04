"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "@/lib/auth-client";
import { LogoIcon } from "@/components/Logo";
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
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronDown,
  ArrowUpRight,
} from "lucide-react";

export function Header() {
  const { data: session, isPending } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Features", href: "/#features" },
    { name: "Pre-Mined Niches", href: "/niches" },
    { name: "Pricing", href: "/#pricing" },
    { name: "Blog", href: "/blog" },
    { name: "Resources", href: "/resources" },
    { name: "FAQ", href: "/#faq" },
  ];

  return (
    <>
      <div className="pointer-events-none fixed top-0 right-0 left-0 z-50 flex w-full justify-center px-4">
        <header className="pointer-events-auto mx-auto mt-6 w-full max-w-5xl rounded-full border border-black/10 bg-white/80 shadow-lg shadow-black/5 backdrop-blur-3xl transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] dark:bg-zinc-900/80">
          <div className="flex h-14 items-center justify-between px-5 sm:px-6">
            <div className="flex items-center gap-8">
              <Link href="/" className="group flex items-center gap-2.5">
                <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-linear-to-tr from-[#ff4500] to-[#ff6b33] shadow-[0_4px_12px_rgba(255,69,0,0.25)] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105">
                  <LogoIcon className="h-4 w-4 text-white" />
                </div>
                <span className="text-base font-bold tracking-tight text-zinc-950 dark:text-white">
                  ThreddIQ
                </span>
              </Link>

              <nav className="hidden items-center gap-6 lg:flex">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-sm font-medium text-zinc-600 transition-colors duration-200 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              {!isPending && (
                <>
                  {session ? (
                    <div className="flex items-center gap-3">
                      <Link
                        href="/dashboard"
                        className="hidden text-sm font-semibold text-zinc-700 transition-colors hover:text-zinc-950 sm:block dark:text-zinc-300 dark:hover:text-white"
                      >
                        Dashboard
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="group flex cursor-pointer items-center gap-1.5 outline-hidden">
                            <Avatar
                              size="sm"
                              className="border border-black/10 transition-colors group-hover:border-[#ff4500]/50"
                            >
                              <AvatarImage
                                src={session.user.image || ""}
                                alt={session.user.name}
                              />
                              <AvatarFallback className="bg-[#ff4500]/10 text-xs font-bold text-[#ff4500]">
                                {session.user.name
                                  ?.substring(0, 2)
                                  .toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <ChevronDown className="h-3.5 w-3.5 text-zinc-400 transition-colors group-hover:text-zinc-800" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-56 rounded-2xl border-zinc-200 bg-white p-1.5 text-zinc-700 shadow-xl"
                        >
                          <DropdownMenuLabel className="px-3 py-2 font-bold text-zinc-900">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm font-bold">
                                {session.user.name}
                              </span>
                              <span className="text-xs font-normal text-zinc-500">
                                {session.user.email}
                              </span>
                            </div>
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-zinc-100" />
                          <DropdownMenuItem asChild>
                            <Link
                              href="/dashboard"
                              className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                            >
                              <LayoutDashboard className="h-4 w-4 text-zinc-500" />
                              <span>Dashboard</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href="/dashboard/settings"
                              className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                            >
                              <Settings className="h-4 w-4 text-zinc-500" />
                              <span>Settings</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-zinc-100" />
                          <DropdownMenuItem
                            onClick={() => signOut()}
                            className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 focus:bg-red-50 focus:text-red-600"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>Sign out</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Link
                        href="/sign-in"
                        className="px-2 py-1 text-sm font-semibold text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
                      >
                        Sign in
                      </Link>
                      <Link
                        href="/sign-up"
                        className="hidden items-center justify-center rounded-full bg-[#ff4500] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#e03d00] active:scale-[0.98] md:inline-flex"
                      >
                        Start free trial
                      </Link>
                    </div>
                  )}
                </>
              )}

              {/* Hamburger Button with Morphing Animation */}
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? "Close menu" : "Open menu"}
                className="relative flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-black/5 focus:outline-hidden lg:hidden dark:hover:bg-white/10"
              >
                <div className="relative h-4 w-4">
                  <span
                    className={`absolute top-0.5 left-0 block h-0.5 w-4 bg-zinc-900 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] dark:bg-white ${
                      isOpen ? "top-2 rotate-45" : ""
                    }`}
                  />
                  <span
                    className={`absolute top-2 left-0 block h-0.5 w-4 bg-zinc-900 transition-all duration-300 dark:bg-white ${
                      isOpen ? "opacity-0" : "opacity-100"
                    }`}
                  />
                  <span
                    className={`absolute top-3.5 left-0 block h-0.5 w-4 bg-zinc-900 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] dark:bg-white ${
                      isOpen ? "top-2 -rotate-45" : ""
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </header>
      </div>

      {/* Screen Filling Modal Overlay with Staggered Mask Reveal */}
      <div
        className={`fixed inset-0 z-40 flex flex-col justify-between bg-white/95 px-6 pt-28 pb-12 backdrop-blur-3xl transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] lg:hidden dark:bg-black/95 ${
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <nav className="mx-auto flex w-full max-w-md flex-col gap-5">
          {navLinks.map((link, idx) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              style={{
                transitionDelay: isOpen ? `${idx * 60 + 100}ms` : "0ms",
              }}
              className={`flex items-center justify-between text-2xl font-bold text-zinc-800 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-[#ff4500] dark:text-zinc-100 ${
                isOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
            >
              <span>{link.name}</span>
              <ArrowUpRight className="h-5 w-5 opacity-40" />
            </Link>
          ))}
        </nav>

        <div className="mx-auto flex w-full max-w-md flex-col gap-3 border-t border-zinc-200 pt-8 dark:border-zinc-800">
          {session ? (
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center rounded-full bg-zinc-950 py-3.5 text-base font-semibold text-white transition-all duration-300 active:scale-[0.98] dark:bg-white dark:text-zinc-950"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/sign-up"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center rounded-full bg-[#ff4500] py-3.5 text-base font-semibold text-white transition-all duration-300 hover:bg-[#e03d00] active:scale-[0.98]"
              >
                Start free trial
              </Link>
              <Link
                href="/sign-in"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center py-2 text-sm font-semibold text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                Sign in to your account
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
