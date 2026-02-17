import HeroSection from "@/components/home/HeroSection";
import StatsSection from "@/components/home/StatsSection";
import TopUniversitiesSection from "@/components/home/TopUniversitiesSection";
import LatestReviewsSection from "@/components/home/LatestReviewsSection";
import CtaSection from "@/components/home/CtaSection";
import HomeFooter from "@/components/home/HomeFooter";

export default function HomeTemplate({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <TopUniversitiesSection />
      <LatestReviewsSection />
      <CtaSection isLoggedIn={isLoggedIn} />
      <HomeFooter />
    </>
  );
}
