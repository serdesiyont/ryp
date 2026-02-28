import Link from "next/link";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SchoolRatingsGrid from "@/components/SchoolRatingsGrid";
import ReviewCard from "@/components/ReviewCard";
import {
  fetchSchoolById,
  fetchSchoolReviews,
  isNotFound as isSchoolNotFound,
} from "@/lib/api/schools";

interface SchoolPageProps {
  params: Promise<{ id: string }>;
}

export default async function SchoolPage({ params }: SchoolPageProps) {
  const { id } = await params;
  const schoolId = id;

  if (!schoolId) {
    return <div className="p-4">Invalid school id</div>;
  }

  let school: Awaited<ReturnType<typeof fetchSchoolById>>;
  try {
    school = await fetchSchoolById(schoolId);
  } catch (error) {
    if (isSchoolNotFound(error)) {
      return <div className="p-4">School not found</div>;
    }
    return (
      <div className="p-4">
        Unable to load school details right now. Please try again later.
      </div>
    );
  }

  let schoolReviews: Awaited<ReturnType<typeof fetchSchoolReviews>> = [];
  let reviewsError: string | null = null;

  try {
    schoolReviews = await fetchSchoolReviews(school.id);
  } catch (error) {
    reviewsError = "Unable to load school reviews right now.";
  }

  const tagCounts: Record<string, number> = {};
  schoolReviews.forEach((review) => {
    review.tags?.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([tag]) => tag);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* School Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{school.name}</h1>
          <p className="text-gray-600 mb-2">{school.location}</p>
          <Link href="#" className="text-blue-600 underline text-sm">
            View all Professors
          </Link>

          {topTags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              {topTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-gray-200 px-3 py-1 font-semibold text-gray-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-12">
          <Link href={`/rate/school/${school.id}`}>
            <Button className="bg-black text-white rounded-full">Rate</Button>
          </Link>
          <Button
            variant="outline"
            className="rounded-full border-black bg-transparent"
          >
            Compare
          </Button>
        </div>

        {/* Ratings Grid */}
        <div className="mb-12">
          <SchoolRatingsGrid school={school} />
        </div>

        {/* Reviews Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">
            {schoolReviews.length} Ratings
          </h2>
          {reviewsError ? (
            <div className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
              {reviewsError}
            </div>
          ) : null}
          <div className="space-y-4">
            {schoolReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                isSchoolReview={true}
              />
            ))}
          </div>
          {schoolReviews.length > 5 && (
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
