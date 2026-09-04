/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { cn } from "@/lib/utils";
import { defaultMetadata } from "@/lib/seo";
import { UserJotWidget } from "@/components/userjot-widget";
import { getServerSession } from "@/lib/auth";

import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";
import { CookieConsentBanner } from "@/components/ui/cookie-consent-banner";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = defaultMetadata;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const requestHeaders = await headers();
  const session = await getServerSession(requestHeaders);

  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UserJotWidget user={session?.user ?? null} />
        <Toaster />
        <Analytics />
        <CookieConsentBanner />
        {children}
      </body>
    </html>
  );
}
