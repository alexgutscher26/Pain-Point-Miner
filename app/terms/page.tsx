import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions | ThreddIQ",
  description: "By using ThreddIQ, you agree to these Terms and Conditions. Please review them carefully.",
};

export default function TermsPage() {
  const lastUpdated = "March 31, 2026";

  return (
    <div className="min-h-screen overflow-x-hidden landing-gradient font-sans text-zinc-800 selection:bg-[#ff4500]/10 selection:text-[#ff4500]">
      <Header />
      <main className="container mx-auto max-w-4xl px-6 pt-32 pb-24">
        <div className="mb-12">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl">
            Terms & Conditions
          </h1>
          <p className="text-sm font-medium text-zinc-500">
            Last updated: {lastUpdated}
          </p>
        </div>

        <div className="prose max-w-none space-y-8 text-[15px] leading-relaxed text-zinc-600">
          <section>
            <h2 className="text-xl font-bold text-zinc-900 uppercase tracking-tight mb-4">1. Agreement to Terms</h2>
            <p>
              By accessing or using ThreddIQ, you agree to be bound by these Terms and Conditions. 
              If you disagree with any part of these terms, you may not access the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900 uppercase tracking-tight mb-4">2. Use of Service</h2>
            <p>
              You must be at least 18 years old to use ThreddIQ. You agree to use the service only 
              for lawful purposes and in accordance with these Terms. 
              Unauthorized use of our service may result in termination of your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900 uppercase tracking-tight mb-4">3. User Accounts</h2>
            <p>
              When you create an account, you must provide accurate and complete information. 
              You are responsible for maintaining the confidentiality of your account credentials 
              and for all activities that occur under your account. 
              Please notify us immediately of any security breaches.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900 uppercase tracking-tight mb-4">4. Fees, Payments, and Billing</h2>
            <p>
              ThreddIQ offers both free and paid services. For paid subscriptions, 
              billing is handled through Stripe. Fees are non-refundable except where required by law. 
              We reserve the right to change our fees upon notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900 uppercase tracking-tight mb-4">5. Intellectual Property</h2>
            <p>
              The service and its original content, features, and functionality are and will remain 
              the exclusive property of ThreddIQ. Our trademarks and trade dress may not be used 
              without our prior written consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900 uppercase tracking-tight mb-4">6. Data and Privacy</h2>
            <p>
              Your use of ThreddIQ is also governed by our Privacy Policy. By using the service, 
              you consent to the terms of our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900 uppercase tracking-tight mb-4">7. Termination</h2>
            <p>
              We may terminate or suspend your account and access to the service immediately, 
              without prior notice, for conduct that we believe violates these Terms 
              or is harmful to other users of the service, us, or third parties, 
              or for any other reason in our sole discretion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900 uppercase tracking-tight mb-4">8. Limitation of Liability</h2>
            <p>
              In no event shall ThreddIQ, its directors, employees, or partners, be liable for 
              any indirect, incidental, special, consequential, or punitive damages, including 
              without limitation, loss of profits, data, use, goodwill, or other intangible losses.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900 uppercase tracking-tight mb-4">9. Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws of 
              the United States, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900 uppercase tracking-tight mb-4">10. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at legal@threddiq.com.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
