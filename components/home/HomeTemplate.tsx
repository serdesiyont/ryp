import HeroSection from "@/components/home/HeroSection";
import StatsSection from "@/components/home/StatsSection";
import TopUniversitiesSection from "@/components/home/TopUniversitiesSection";
import LatestReviewsSection from "@/components/home/LatestReviewsSection";
import CtaSection from "@/components/home/CtaSection";
import HomeFooter from "@/components/home/HomeFooter";
import type { StatsData } from "@/lib/api/stats";

interface HomeTemplateProps {
  stats: StatsData | null;
}

export default function HomeTemplate({ stats }: HomeTemplateProps) {
  return (
    <>
      <HeroSection />
      <StatsSection
        campusCount={stats?.campusCount ?? 0}
        lecturerCount={stats?.lecturerCount ?? 0}
        totalReviews={stats?.totalReviews ?? 0}
      />
      <TopUniversitiesSection
        campuses={stats?.topRatedCampuses ?? []}
      />
      <LatestReviewsSection
        reviews={stats?.latestLecturerReviews?.data ?? []}
      />
      <CtaSection />
      <HomeFooter />
    </>
  );
}
