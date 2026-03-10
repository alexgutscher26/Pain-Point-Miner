import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Authentication",
    template: "%s | Pain-Point Miner",
  },
  description: "Sign in or create an account to access Pain-Point Miner.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
