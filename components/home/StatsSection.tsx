interface StatsSectionProps {
  campusCount: number;
  lecturerCount: number;
  totalReviews: number;
}

/**
 * Ceil a number to the nearest "nice" integer.
 * e.g. 7 → 10, 13 → 15, 47 → 50, 123 → 125, 980 → 1000
 */
function ceilToNice(n: number): number {
  if (n <= 0) return 0;
  if (n <= 10) return Math.ceil(n / 5) * 5;           // step 5   → 5, 10
  if (n <= 100) return Math.ceil(n / 5) * 5;          // step 5   → 15, 20…
  if (n <= 1000) return Math.ceil(n / 10) * 10;       // step 10  → 130, 990…
  if (n <= 10000) return Math.ceil(n / 100) * 100;    // step 100 → 1200…
  return Math.ceil(n / 1000) * 1000;                  // step 1k
}

function formatStat(n: number): string {
  const ceiled = ceilToNice(n);
  if (ceiled >= 1000) return `${(ceiled / 1000).toFixed(ceiled % 1000 === 0 ? 0 : 1)}k+`;
  return `${ceiled}+`;
}

export default function StatsSection({
  campusCount,
  lecturerCount,
  totalReviews,
}: StatsSectionProps) {
  return (
    <section className="border-y border-black/5 bg-neutral-100">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-12 md:grid-cols-4">
        {[
          [formatStat(campusCount), "Universities"],
          [formatStat(lecturerCount), "Professors"],
          [formatStat(totalReviews), "Reviews"],
          ["100%", "Authentic"],
        ].map(([value, label]) => (
          <div key={label} className="text-center">
            <div className="text-3xl font-black">{value}</div>
            <div className="mt-1 text-xs font-bold uppercase text-neutral-500">
              {label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
