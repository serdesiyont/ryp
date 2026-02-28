import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { fetchSchools } from "@/lib/api/schools";

const ratingColor = (value: number) => {
  if (value < 1) return "bg-red-600 text-white";
  if (value < 2) return "bg-pink-500 text-white";
  if (value < 3) return "bg-yellow-300 text-gray-900";
  if (value < 4) return "bg-green-200 text-gray-900";
  return "bg-green-600 text-white";
};

export default async function SchoolRatingPage() {
  let loadError: string | null = null;
  let schools = [] as Awaited<ReturnType<typeof fetchSchools>>;

  try {
    schools = await fetchSchools();
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : "Unable to load schools right now.";
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <p className="text-sm text-gray-600">Pick a school to rate</p>
          <h1 className="text-4xl font-bold">Rate a School</h1>
        </div>

        {loadError ? (
          <p className="text-sm text-destructive">{loadError}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {schools.map((school) => (
              <Link
                key={school.id}
                href={`/rate/school/${school.id}`}
                className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{school.name}</h2>
                    <p className="text-sm text-gray-600">{school.location}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${ratingColor(
                      school.averageRating
                    )}`}
                  >
                    {school.averageRating.toFixed(1)}
                  </span>
                </div>
                <p className="mt-3 text-sm text-gray-600">
                  {school.totalRatings} ratings
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
