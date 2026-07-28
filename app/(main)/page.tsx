import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import HeroSection from "@/components/home/HeroSection";

export const metadata: Metadata = {
  title: "AvenzaAI — Learn Coding & AI",
  description: "Step-by-step tutorials, hands-on practice, and an AI tutor available 24/7. Perfect for beginners.",
};
import FeaturesSection from "@/components/home/FeaturesSection";
import CoursesPreview from "@/components/home/CoursesPreview";
import AiBanner from "@/components/home/AiBanner";

export default async function Home() {
  const session = await auth();

  return (
    <>
      <HeroSection user={session?.user} />
      <FeaturesSection />
      <CoursesPreview />
      <AiBanner />
    </>
  );
}
