import Link from "next/link";
import { topUniversities } from "@/components/home/data";

export default function TopUniversitiesSection() {
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

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {topUniversities.map((university) => (
            <article
              key={university.name}
              className="rounded-sm border border-black/5 p-6 transition-all hover:scale-105 hover:border-black hover:bg-neutral-100"
            >
              <div className="mb-6 flex aspect-square items-center justify-center bg-neutral-200 text-5xl">
                🎓
              </div>
              <h3 className="mb-2 text-xl font-bold">{university.name}</h3>
              <div className="mb-4 flex items-center gap-2">
                <span>★</span>
                <span className="text-sm font-bold">{university.rating}</span>
                <span className="text-xs text-neutral-400">
                  ({university.reviews})
                </span>
              </div>
              <Link
                href="/browse"
                className="text-xs font-black uppercase tracking-widest underline"
              >
                View Profile
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
