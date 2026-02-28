import { Button } from "@/components/ui/button";
import Stars from "@/components/home/Stars";
import type { LatestLecturerReview } from "@/lib/api/stats";
import Link from "next/link";

interface LatestReviewsSectionProps {
  reviews: LatestLecturerReview[];
}

/** Pretty-print how long ago a date was */
function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ${hrs === 1 ? "hour" : "hours"} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} ${days === 1 ? "day" : "days"} ago`;
  const months = Math.floor(days / 30);
  return `${months} ${months === 1 ? "month" : "months"} ago`;
}

export default function LatestReviewsSection({
  reviews,
}: LatestReviewsSectionProps) {
  return (
    <section className="border-y border-black/10 bg-neutral-100 px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-black">Latest Reviews</h2>
          <p className="text-neutral-500">
            Real student voices, updated in real-time
          </p>
        </div>

        {reviews.length === 0 ? (
          <p className="text-center text-neutral-400">
            No reviews yet. Be the first to leave a review!
          </p>
        ) : (
          <div className="space-y-6">
            {reviews.map((review, index) => (
              <article
                key={review._id}
                className="relative rounded-sm border border-black/5 bg-white p-8 shadow-sm transition-transform duration-300 hover:scale-[1.02]"
              >
                <div
                  className={`absolute left-0 top-0 h-full w-2 ${
                    index % 2 === 0 ? "bg-black" : "bg-neutral-300"
                  }`}
                />
                <div className="mb-6 flex items-start justify-between">
                  <div>
                    <h4 className="text-lg font-bold">
                      {review.lecturerId.name}
                    </h4>
                    <p className="text-sm italic text-neutral-500">
                      {review.course} — {review.lecturerId.department},{" "}
                      {review.lecturerId.university}
                    </p>
                  </div>
                  <Stars rating={review.quality} />
                </div>
                {review.comment && (
                  <p className="mb-6 leading-relaxed text-neutral-700">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                )}
                <div className="flex items-center justify-between border-t border-black/5 pt-6">
                  <div className="flex flex-wrap items-center gap-2">
                    {review.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-neutral-400">
                    {timeAgo(review.createdAt)}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link href="/browse">
            <Button
              variant="outline"
              className="border-2 border-black px-8 py-3 font-bold"
            >
              Browse All Reviews
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
