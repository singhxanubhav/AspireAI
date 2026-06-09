import { auth } from "@/lib/auth";
import HeroSection from "@/components/home/HeroSection";
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
