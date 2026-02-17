import { Button } from "@/components/ui/button";
import { latestReviews } from "@/components/home/data";
import Stars from "@/components/home/Stars";

export default function LatestReviewsSection() {
  return (
    <section className="border-y border-black/10 bg-neutral-100 px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-black">Latest Reviews</h2>
          <p className="text-neutral-500">
            Real student voices, updated in real-time
          </p>
        </div>

        <div className="space-y-6">
          {latestReviews.map((review, index) => (
            <article
              key={review.title}
              className="relative rounded-sm border border-black/5 bg-white p-8 shadow-sm transition-transform duration-300 hover:scale-[1.02]"
            >
              <div
                className={`absolute left-0 top-0 h-full w-2 ${
                  index % 2 === 0 ? "bg-black" : "bg-neutral-300"
                }`}
              />
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h4 className="text-lg font-bold">{review.title}</h4>
                  <p className="text-sm italic text-neutral-500">
                    {review.subtitle}
                  </p>
                </div>
                <Stars rating={review.rating} />
              </div>
              <p className="mb-6 leading-relaxed text-neutral-700">
                "{review.content}"
              </p>
              <div className="flex items-center justify-between border-t border-black/5 pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 text-xs font-bold">
                    {review.author
                      .split(" ")
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest">
                    {review.author}
                  </span>
                </div>
                <span className="text-xs text-neutral-400">{review.time}</span>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button
            variant="outline"
            className="border-2 border-black px-8 py-3 font-bold"
          >
            Load More Reviews
          </Button>
        </div>
      </div>
    </section>
  );
}
