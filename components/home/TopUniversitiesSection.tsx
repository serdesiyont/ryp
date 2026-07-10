import Link from "next/link";
import type { TopRatedCampus } from "@/lib/api/stats";

interface TopUniversitiesSectionProps {
  campuses: TopRatedCampus[];
}

export default function TopUniversitiesSection({
  campuses,
}: TopUniversitiesSectionProps) {
  return (
    <section className="bg-white px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="mb-2 text-3xl font-black">Top Rated Universities</h2>
            <p className="text-neutral-500">
              Based on student feedback and academic performance
            </p>
          </div>
          <Link
            href="/browse"
            className="border-b-2 border-black pb-1 text-sm font-bold"
          >
            View all →
          </Link>
        </div>

        {campuses.length === 0 ? (
          <p className="text-center text-neutral-400">
            No universities rated yet. Be the first to rate!
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {campuses.map((campus) => (
              <article
                key={campus._id}
                className="rounded-sm border border-black/5 p-6 transition-all hover:scale-105 hover:border-black hover:bg-neutral-100"
              >
                <div className="relative mb-6 flex aspect-square items-center justify-center overflow-hidden rounded-sm border border-black/10 bg-[#FAF3DD]">
                  <svg
                    viewBox="0 0 100 100"
                    className="h-1/2 w-1/2 text-black"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M10 32 50 12 90 32" />
                    <path d="M14 40H86" />
                    <path d="M22 40v38M38 40v38M50 40v38M62 40v38M78 40v38" />
                    <path d="M10 84h80M6 92h88" />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-bold">{campus.name}</h3>
                <div className="mb-4 flex items-center gap-2">
                  <span>★</span>
                  <span className="text-sm font-bold">
                    {campus.overallRating.toFixed(1)}
                  </span>
                  <span className="text-xs text-neutral-400">
                    ({campus.count} {campus.count === 1 ? "review" : "reviews"})
                  </span>
                </div>
                <Link
                  href={`/school/${campus._id}`}
                  className="text-xs font-black uppercase tracking-widest underline"
                >
                  View Profile
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
