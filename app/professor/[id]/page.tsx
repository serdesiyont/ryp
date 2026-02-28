import Link from "next/link";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RatingChart from "@/components/RatingChart";
import ReviewCard from "@/components/ReviewCard";
import {
  fetchProfessorById,
  fetchProfessorReviews,
  isNotFound as isProfessorNotFound,
} from "@/lib/api/professors";

interface ProfessorPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProfessorPage({ params }: ProfessorPageProps) {
  const { id } = await params;
  const professorId = id;

  if (!professorId) {
    return <div className="p-4">Invalid professor id</div>;
  }

  let professor: Awaited<ReturnType<typeof fetchProfessorById>>;
  try {
    professor = await fetchProfessorById(professorId);
  } catch (error) {
    if (isProfessorNotFound(error)) {
      return <div className="p-4">Professor not found</div>;
    }
    return (
      <div className="p-4">
        Unable to load professor details right now. Please try again later.
      </div>
    );
  }

  let professorReviews: Awaited<ReturnType<typeof fetchProfessorReviews>> = [];
  let reviewsError: string | null = null;

  try {
    professorReviews = await fetchProfessorReviews(String(professor.id));
  } catch (error) {
    console.error("Error fetching professor reviews:", error);
    reviewsError =
      error instanceof Error
        ? `Unable to load reviews: ${error.message}`
        : "Unable to load professor reviews right now.";
  }

  const ratingDistribution = {
    5: professorReviews.filter((r) => r.rating === 5).length,
    4: professorReviews.filter(
      (r) => Math.floor(r.rating) === 4 || (r.rating >= 4.0 && r.rating < 4.5)
    ).length,
    3: professorReviews.filter((r) => Math.floor(r.rating) === 3).length,
    2: professorReviews.filter((r) => Math.floor(r.rating) === 2).length,
    1: professorReviews.filter((r) => Math.floor(r.rating) === 1).length,
  };

  const tagCounts: Record<string, number> = {};
  professorReviews.forEach((review) => {
    review.tags?.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag]) => tag);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Professor Header */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div>
            <div className="flex items-start gap-2 mb-4">
              <span className="text-sm">📌</span>
              <div>
                <h1 className="text-3xl font-bold">{professor.name}</h1>
                <p className="text-gray-600">{professor.department}</p>
                {professor.schoolName ? (
                  <span className="text-blue-600 text-sm">
                    {professor.schoolName}
                  </span>
                ) : null}
              </div>
            </div>

            {/* Overall Rating */}
            <div className="mb-8">
              <div className="text-6xl font-bold mb-2">
                {professor.averageRating.toFixed(1)}
              </div>
              <p className="text-sm text-gray-600">
                Overall Quality Based on {professor.totalRatings} ratings
              </p>
            </div>

            {/* Stats */}
            <div className="space-y-4 mb-8">
              <div>
                <div className="text-3xl font-bold">
                  {professor.wouldTakeAgain != null
                    ? `${professor.wouldTakeAgain.toFixed(0)}%`
                    : "N/A"}
                </div>
                <p className="text-sm text-gray-600">Would take again</p>
              </div>
              <div>
                <div className="text-3xl font-bold">
                  {professor.difficultyLevel != null
                    ? professor.difficultyLevel.toFixed(1)
                    : "N/A"}
                </div>
                <p className="text-sm text-gray-600">Level of Difficulty</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Link href={`/rate/professor/${professor.id}`}>
                <Button className="bg-black text-white rounded-full">
                  Rate
                </Button>
              </Link>
              <Button
                variant="outline"
                className="rounded-full border-black bg-transparent"
              >
                Compare
              </Button>
            </div>

            {/* I'm Professor */}
            <button className="mt-6 underline text-sm">
              I'm Professor {professor.name}
            </button>

            {/* Tags */}
            {topTags.length > 0 && (
              <div className="mt-8">
                <h3 className="font-bold mb-3">
                  Professor {professor.name}'s Top Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {topTags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gray-200 text-gray-800 text-xs font-semibold rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Rating Chart */}
          <div className="md:col-span-2">
            <RatingChart ratingDistribution={ratingDistribution} />
          </div>
        </div>

        {/* Similar Professors
        {professors.length > 1 && (
          <div className="mb-12 bg-blue-50 p-6 rounded-lg">
            <h3 className="font-bold text-lg mb-4">Similar Professors</h3>
            <div className="flex gap-4">
              {professors.slice(1, 4).map((prof) => (
                <Link
                  key={prof.id}
                  href={`/professor/${prof.id}`}
                  className="flex flex-col items-center gap-2 text-center"
                >
                  <div className="w-20 h-20 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-xl">
                    {prof.averageRating.toFixed(2)}
                  </div>
                  <p className="font-semibold text-sm">{prof.name}</p>
                </Link>
              ))}
            </div>
          </div>
        )} */}

        {/* Reviews */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Reviews</h2>
          {reviewsError ? (
            <div className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
              {reviewsError}
            </div>
          ) : null}
          <div className="space-y-4">
            {professorReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
          {professorReviews.length > 2 && (
            <div className="flex justify-center mt-8">
              <Button className="bg-black text-white rounded-full px-8">
                Load More Ratings
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
