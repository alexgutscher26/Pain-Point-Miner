import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | ThreddIQ",
  description: "Our Privacy Policy describes how we collect, use, and protect your personal information when you use ThreddIQ.",
};

export default function PrivacyPage() {
  const lastUpdated = "March 31, 2026";

  return (
    <div className="min-h-screen overflow-x-hidden landing-gradient font-sans text-zinc-800 selection:bg-[#ff4500]/10 selection:text-[#ff4500]">
      <Header />
      <main className="container mx-auto max-w-4xl px-6 pt-32 pb-24">
        <div className="mb-12">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="text-sm font-medium text-zinc-500">
            Last updated: {lastUpdated}
          </p>
        </div>

        <div className="prose max-w-none space-y-8 text-[15px] leading-relaxed text-zinc-600">
          <section>
            <h2 className="text-xl font-bold text-zinc-900 uppercase tracking-tight mb-4">1. Introduction</h2>
            <p>
              Welcome to ThreddIQ. We respect your privacy and are committed to protecting your personal data. 
              This Privacy Policy explains how we collect, use, and safe guard your information when you visit 
              our website and use our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900 uppercase tracking-tight mb-4">2. Information We Collect</h2>
            <p>
              We collect information that you provide directly to us when you create an account, subscribe to our service, 
              or communicate with us. This may include:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Contact information (such as name and email address)</li>
              <li>Payment and billing information (processed securely through Stripe)</li>
              <li>User profile information and preferences</li>
              <li>Log data and usage information when you interact with our services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900 uppercase tracking-tight mb-4">3. How We Use Your Information</h2>
            <p>
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send technical notices, updates, and administrative messages</li>
              <li>Respond to your comments and questions</li>
              <li>Monitor and analyze trends, usage, and activities in connection with our services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900 uppercase tracking-tight mb-4">4. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your personal information. 
              However, no method of transmission over the Internet or electronic storage is 100% secure, 
              and we cannot guarantee its absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900 uppercase tracking-tight mb-4">5. Third-Party Services</h2>
            <p>
              We use third-party services like Stripe for payment processing and Vercel for analytics. 
              These third parties have their own privacy policies governing how they use your data. 
              We do not sell your personal data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900 uppercase tracking-tight mb-4">6. Your Data Rights</h2>
            <p>
              Depending on your location, you may have rights to access, correct, or delete your personal data. 
              You can manage most of your data through your account settings or by contacting us directly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900 uppercase tracking-tight mb-4">7. Cookies</h2>
            <p>
              We use cookies to improve your experience on our site, remember your preferences, and understand how 
              you use our service. You can control cookies through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900 uppercase tracking-tight mb-4">8. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at support@threddiq.com.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
