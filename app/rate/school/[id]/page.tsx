"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import {
  fetchSchoolById,
  fetchSchoolReviews,
  submitSchoolRating,
} from "@/lib/api/schools";
import type { Review, School } from "@/lib/types";

const ratingColor = (value: number) => {
  if (value <= 1) return "#dc2626";
  if (value <= 2) return "#f2994a";
  if (value <= 3) return "#facc15";
  if (value <= 4) return "#8ecf6f";
  return "#16a34a";
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
        <div className="mb-8">
          <p className="text-sm text-gray-600 mb-2">
            {selectedSchoolData.location}
          </p>
          <h1 className="text-4xl font-bold mb-1">{selectedSchoolData.name}</h1>
          <p className="text-lg text-gray-600">Add Rating</p>

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

        {/* Reputation */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="font-semibold mb-4">
            Reputation <span className="text-red-500">*</span>
          </h2>
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                onClick={() => handleRatingChange("reputation", level)}
                style={{
                  backgroundColor:
                    level <= ratings.reputation && ratings.reputation > 0
                      ? ratingColor(ratings.reputation)
                      : "#e5e7eb",
                }}
                className="w-12 h-12 rounded-lg transition"
              />
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>1 - Awful</span>
            <span>5 - Awesome</span>
          </div>
        </div>

        {/* Safety */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="font-semibold mb-4">
            Safety <span className="text-red-500">*</span>
          </h2>
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                onClick={() => handleRatingChange("safety", level)}
                style={{
                  backgroundColor:
                    level <= ratings.safety && ratings.safety > 0
                      ? ratingColor(ratings.safety)
                      : "#e5e7eb",
                }}
                className="w-12 h-12 rounded-lg transition"
              />
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>1 - Awful</span>
            <span>5 - Awesome</span>
          </div>
        </div>

        {/* Happiness */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="font-semibold mb-4">
            Happiness <span className="text-red-500">*</span>
          </h2>
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                onClick={() => handleRatingChange("happiness", level)}
                style={{
                  backgroundColor:
                    level <= ratings.happiness && ratings.happiness > 0
                      ? ratingColor(ratings.happiness)
                      : "#e5e7eb",
                }}
                className="w-12 h-12 rounded-lg transition"
              />
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>1 - Awful</span>
            <span>5 - Awesome</span>
          </div>
        </div>

        {/* Clubs */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="font-semibold mb-4">
            Clubs <span className="text-red-500">*</span>
          </h2>
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                onClick={() => handleRatingChange("clubs", level)}
                style={{
                  backgroundColor:
                    level <= ratings.clubs && ratings.clubs > 0
                      ? ratingColor(ratings.clubs)
                      : "#e5e7eb",
                }}
                className="w-12 h-12 rounded-lg transition"
              />
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>1 - Awful</span>
            <span>5 - Awesome</span>
          </div>
        </div>

        {/* Social */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="font-semibold mb-4">
            Social <span className="text-red-500">*</span>
          </h2>
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                onClick={() => handleRatingChange("social", level)}
                style={{
                  backgroundColor:
                    level <= ratings.social && ratings.social > 0
                      ? ratingColor(ratings.social)
                      : "#e5e7eb",
                }}
                className="w-12 h-12 rounded-lg transition"
              />
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>1 - Awful</span>
            <span>5 - Awesome</span>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="font-semibold mb-4">
            Location <span className="text-red-500">*</span>
          </h2>
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                onClick={() => handleRatingChange("location", level)}
                style={{
                  backgroundColor:
                    level <= ratings.location && ratings.location > 0
                      ? ratingColor(ratings.location)
                      : "#e5e7eb",
                }}
                className="w-12 h-12 rounded-lg transition"
              />
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>1 - Awful</span>
            <span>5 - Awesome</span>
          </div>
        </div>

        {/* Opportunities */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="font-semibold mb-4">
            Opportunities <span className="text-red-500">*</span>
          </h2>
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                onClick={() => handleRatingChange("opportunities", level)}
                style={{
                  backgroundColor:
                    level <= ratings.opportunities && ratings.opportunities > 0
                      ? ratingColor(ratings.opportunities)
                      : "#e5e7eb",
                }}
                className="w-12 h-12 rounded-lg transition"
              />
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>1 - Awful</span>
            <span>5 - Awesome</span>
          </div>
        </div>

        {/* Facilities and common areas */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="font-semibold mb-4">
            Facilities and common areas <span className="text-red-500">*</span>
          </h2>
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                onClick={() => handleRatingChange("facilities", level)}
                style={{
                  backgroundColor:
                    level <= ratings.facilities && ratings.facilities > 0
                      ? ratingColor(ratings.facilities)
                      : "#e5e7eb",
                }}
                className="w-12 h-12 rounded-lg transition"
              />
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>1 - Awful</span>
            <span>5 - Awesome</span>
          </div>
        </div>

        {/* Internet */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="font-semibold mb-4">
            Internet <span className="text-red-500">*</span>
          </h2>
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                onClick={() => handleRatingChange("internet", level)}
                style={{
                  backgroundColor:
                    level <= ratings.internet && ratings.internet > 0
                      ? ratingColor(ratings.internet)
                      : "#e5e7eb",
                }}
                className="w-12 h-12 rounded-lg transition"
              />
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>1 - Awful</span>
            <span>5 - Awesome</span>
          </div>
        </div>

        {/* Food */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="font-semibold mb-4">
            Food <span className="text-red-500">*</span>
          </h2>
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                onClick={() => handleRatingChange("food", level)}
                style={{
                  backgroundColor:
                    level <= ratings.food && ratings.food > 0
                      ? ratingColor(ratings.food)
                      : "#e5e7eb",
                }}
                className="w-12 h-12 rounded-lg transition"
              />
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>1 - Awful</span>
            <span>5 - Awesome</span>
          </div>
        </div>

        {/* Write a Review */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="font-semibold mb-3">Write a Review</h2>
          <p className="text-sm text-gray-600 mb-4">
            Discuss your personal experience on this school. What's great about
            it? What could use improvement?
          </p>

          {/* Guidelines */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <span className="text-lg font-bold">ℹ</span>
              <div>
                <button className="font-semibold text-sm mb-2 hover:underline">
                  Guidelines
                </button>
                <ul className="hidden space-y-1 text-sm text-gray-700">
                  <li>
                    • Your rating could be removed if you use profanity or
                    derogatory terms.
                  </li>
                  <li>
                    • Refer to the rating categories to help you better
                    elaborate your comments.
                  </li>
                  <li>• Don't forget to proof read!</li>
                </ul>
                <button className="text-sm text-blue-600 hover:underline">
                  View all guidelines
                </button>
              </div>
            </div>
          </div>

          <textarea
            placeholder="What do you want other students to know about this school?"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            maxLength={350}
            rows={8}
            className="w-full resize-none rounded border border-blue-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <div className="mt-1 text-right text-sm text-gray-600">
            {review.length}/350
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="bg-white rounded-lg p-6 mb-6 text-center text-sm">
          <p className="mb-3">
            By clicking the "Submit" button, I acknowledge that I have read and
            agreed to the Rate My Professors{" "}
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
            . Submitted data becomes the property of Rate My Professors.
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center mb-8">
          <Button
            onClick={handleSubmit}
            className="rounded-full bg-gray-500 px-12 py-3 text-white hover:bg-gray-600"
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
