import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - ThreddIQ",
  description: "Sign in to your ThreddIQ account.",
};

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
