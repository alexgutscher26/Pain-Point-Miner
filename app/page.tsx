import { GoldMine } from "@/components/landing/GoldMine";
import { Steps } from "@/components/landing/Steps";
import { Toolkit } from "@/components/landing/Toolkit";
import { Opportunities } from "@/components/landing/Opportunities";
import { Testimonial } from "@/components/landing/Testimonial";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 font-sans selection:bg-[#ff4500]/30 overflow-x-hidden">
      <Header />
      <main className="flex flex-col items-center w-full">
        <Hero />
        <GoldMine />
        <Steps />
        <Toolkit />
        <Opportunities />
        <Testimonial />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
