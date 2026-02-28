import Navigation from "@/components/Navigation";
import HomeTemplate from "@/components/home/HomeTemplate";
import { fetchStats } from "@/lib/api/stats";

export default async function Home() {
  let stats = null;
  try {
    stats = await fetchStats();
  } catch {
    // If the API is unreachable, render with fallback zeros
    stats = null;
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-[#fefce9] to-[#fffefd] font-sans text-black antialiased">
      {/* Navigation */}
      <Navigation isHomepage={true} />

      <HomeTemplate stats={stats} />
    </div>
  );
}
