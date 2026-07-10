"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RatingScale } from "@/components/RatingScale";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import {
  fetchSchoolById,
  fetchSchoolReviews,
  submitSchoolRating,
} from "@/lib/api/schools";
import type { Review, School } from "@/lib/types";

const CATEGORIES: { key: keyof SchoolRatingsState; label: string }[] = [
  { key: "reputation", label: "Reputation" },
  { key: "safety", label: "Safety" },
  { key: "happiness", label: "Happiness" },
  { key: "clubs", label: "Clubs" },
  { key: "social", label: "Social" },
  { key: "location", label: "Location" },
  { key: "opportunities", label: "Opportunities" },
  { key: "facilities", label: "Facilities" },
  { key: "internet", label: "Internet" },
  { key: "food", label: "Food" },
];

type SchoolRatingsState = {
  reputation: number;
  location: number;
  opportunities: number;
  facilities: number;
  internet: number;
  safety: number;
  food: number;
  clubs: number;
  happiness: number;
  social: number;
};

export default function SchoolRatingDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const [selectedSchoolData, setSelectedSchoolData] = useState<School | null>(
    null
  );
  const [fetchedReviews, setFetchedReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const topTags = useMemo(() => {
    if (!selectedSchoolData) return [] as string[];

    const tagCounts: Record<string, number> = {};
    fetchedReviews
      .filter((review) => review.schoolId === selectedSchoolData.id)
      .forEach((review) => {
        review.tags?.forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });

    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([tag]) => tag);
  }, [selectedSchoolData, fetchedReviews]);

  const [ratings, setRatings] = useState({
    reputation: 0,
    location: 0,
    opportunities: 0,
    facilities: 0,
    internet: 0,
    safety: 0,
    food: 0,
    clubs: 0,
    happiness: 0,
    social: 0,
  });
  const [review, setReview] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const editing = searchParams.get("edit");
    if (!editing) return;

    const readNumber = (key: keyof typeof ratings) => {
      const value = searchParams.get(key);
      return value ? Number(value) || 0 : 0;
    };

    setRatings((prev) => ({
      ...prev,
      reputation: readNumber("reputation"),
      location: readNumber("location"),
      opportunities: readNumber("opportunities"),
      facilities: readNumber("facilities"),
      internet: readNumber("internet"),
      safety: readNumber("safety"),
      food: readNumber("food"),
      clubs: readNumber("clubs"),
      happiness: readNumber("happiness"),
      social: readNumber("social"),
    }));

    const reviewParam = searchParams.get("review");
    if (reviewParam) setReview(reviewParam);
  }, [searchParams]);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const school = await fetchSchoolById(resolvedParams.id);
        if (!active) return;
        setSelectedSchoolData(school);

        const schoolReviews = await fetchSchoolReviews(school.id);
        if (!active) return;
        setFetchedReviews(schoolReviews);
      } catch (err) {
        if (!active) return;
        setLoadError(
          err instanceof Error
            ? err.message
            : "Unable to load school details right now."
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [resolvedParams.id]);

  if (loading) {
    return <div className="p-4">Loading school...</div>;
  }

  if (!selectedSchoolData) {
    return <div className="p-4">School not found</div>;
  }

  const handleRatingChange = (
    category: keyof typeof ratings,
    value: number
  ) => {
    setRatings((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  const handleSubmit = async () => {
    const schoolId = selectedSchoolData?.id ?? resolvedParams.id;

    const missingCategories = Object.entries(ratings)
      .filter(([, value]) => value < 1)
      .map(([key]) => key);

    const missing: string[] = [];
    if (missingCategories.length) missing.push("All rating categories");
    if (!review.trim()) missing.push("Review");

    if (missing.length > 0) {
      setError("Please fill all required fields before submitting.");
      return;
    }

    if (!schoolId) {
      setError("School not found.");
      return;
    }

    setError(null);
    setSubmitMessage(null);
    setSubmitting(true);

    try {
      await submitSchoolRating(String(schoolId), {
        ratings,
        review,
        tags: topTags,
      });
      toast({
        title: "Rating submitted",
        description: "Redirecting to school page...",
      });
      router.push(`/school/${schoolId}`);
      setSubmitMessage("Thanks for your rating! It has been submitted.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit rating. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <p className="text-sm font-medium uppercase tracking-wide text-gray-900">
            Add Rating
          </p>
          <h1 className="text-3xl font-bold">{selectedSchoolData.name}</h1>
          <p className="text-sm text-gray-500">{selectedSchoolData.location}</p>

          {loadError ? (
            <p className="mt-2 text-sm text-destructive">{loadError}</p>
          ) : null}

          {topTags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
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

        {/* Rating categories — compact grid */}
        <div className="mb-6 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Rate this school</h2>
            <span className="text-xs text-gray-400">1 Awful – 5 Awesome</span>
          </div>
          <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {CATEGORIES.map((cat) => (
              <RatingScale
                key={cat.key}
                label={cat.label}
                required
                value={ratings[cat.key]}
                onChange={(v) => handleRatingChange(cat.key, v)}
              />
            ))}
          </div>
        </div>

        {/* Write a Review */}
        <div className="mb-6 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="font-semibold">Write a Review</h2>
          <p className="mb-3 text-sm text-gray-500">
            What's great about this school? What could use improvement?
          </p>
          <textarea
            placeholder="What do you want other students to know about this school?"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            maxLength={350}
            rows={5}
            className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
          <div className="mt-1 text-right text-xs text-gray-400">
            {review.length}/350
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="mb-4 text-center text-xs text-gray-500">
          <p>
            By clicking the "Submit" button, I acknowledge that I have read and
            agreed to the Rate Your Professors{" "}
            <Link href="#" className="text-blue-600 hover:underline">
              Site Guidelines
            </Link>
            ,{" "}
            <Link href="#" className="text-blue-600 hover:underline">
              Terms of Use
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
            . Submitted data becomes the property of Rate Your Professors.
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center mb-8">
          <Button
            onClick={handleSubmit}
            className="rounded-full bg-gray-900 px-12 py-3 text-white hover:bg-black"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Rating"}
          </Button>
        </div>

        {error && (
          <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {submitMessage && (
          <div className="mb-4 rounded border border-green-300 bg-green-50 p-3 text-sm text-green-800">
            {submitMessage}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
