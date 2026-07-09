"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RatingScale } from "@/components/RatingScale";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import {
  fetchProfessorById,
  fetchProfessorReviews,
  addCourseToProfessor,
  submitProfessorRating,
} from "@/lib/api/professors";
import type { Professor, Review } from "@/lib/types";

const TAGS = [
  "Tough Grader",
  "Get Ready To Read",
  "Participation Matters",
  "Extra Credit",
  "Group Projects",
  "Amazing Lectures",
  "Clear Grading Criteria",
  "Gives Good Feedback",
  "Inspirational",
  "Lots Of Homework",
  "Hilarious",
  "Beware Of Pop Quizzes",
  "So Many Papers",
  "Caring",
  "Respected",
  "Lecture Heavy",
  "Test Heavy",
  "Graded By Few Things",
  "Accessible Outside Class",
  "Online Savvy",
];

function YesNo({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: "yes" | "no" | null;
  onChange: (v: "yes" | "no") => void;
  required?: boolean;
}) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold">
        {label} {required && <span className="text-red-500">*</span>}
      </h3>
      <div className="flex gap-2">
        {(["yes", "no"] as const).map((opt) => {
          const on = value === opt;
          const active =
            opt === "yes"
              ? "border-green-600 bg-green-50 text-green-700"
              : "border-red-600 bg-red-50 text-red-700";
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`flex-1 rounded-lg border py-2 text-sm font-medium capitalize transition ${
                on ? active : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function ProfessorRatingDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const [selectedProf, setSelectedProf] = useState<Professor | null>(null);
  const [fetchedReviews, setFetchedReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const professorTags = useMemo(() => {
    if (!selectedProf) return [] as string[];

    const tagCounts: Record<string, number> = {};
    fetchedReviews
      .filter((review) => review.professorId === selectedProf.id)
      .forEach((review) => {
        review.tags?.forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });

    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([tag]) => tag);
  }, [selectedProf, fetchedReviews]);

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [rating, setRating] = useState(0);
  const [difficulty, setDifficulty] = useState(0);
  const [retake, setRetake] = useState<"yes" | "no" | null>(null);
  const [courseCode, setCourseCode] = useState("");
  const [textbook, setTextbook] = useState<"yes" | "no" | null>(null);
  const [creditHr, setCreditHr] = useState(0);
  const [grade, setGrade] = useState("");
  const [review, setReview] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const professor = await fetchProfessorById(resolvedParams.id);
        if (!active) return;
        setSelectedProf(professor);

        const profReviews = await fetchProfessorReviews(professor.id);
        if (!active) return;
        setFetchedReviews(profReviews);
      } catch (err) {
        if (!active) return;
        setLoadError(
          err instanceof Error
            ? err.message
            : "Unable to load professor details right now."
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

  useEffect(() => {
    const editing = searchParams.get("edit");
    if (!editing) return;

    const readNumber = (key: string) => {
      const value = searchParams.get(key);
      return value ? Number(value) || 0 : 0;
    };

    const readChoice = <T extends string>(
      key: string,
      choices: T[]
    ): T | null => {
      const value = searchParams.get(key);
      return value && choices.includes(value as T) ? (value as T) : null;
    };

    setRating(readNumber("rating"));
    setDifficulty(readNumber("difficulty"));
    setRetake(readChoice("retake", ["yes", "no"]));
    setCourseCode(searchParams.get("course") || "");
    setTextbook(readChoice("textbook", ["yes", "no"]));
    setCreditHr(readNumber("creditHr"));
    setGrade(searchParams.get("grade") || "");
    setReview(searchParams.get("review") || "");

    const tagsParam = searchParams.get("tags");
    if (tagsParam) {
      const parsed = tagsParam.split(",").filter(Boolean).slice(0, 3);
      setSelectedTags(parsed);
    }
  }, [searchParams]);

  const courseSuggestions = useMemo(() => {
    const availableCourses = selectedProf?.courses ?? [];
    if (!courseCode) return availableCourses.slice(0, 5);
    return availableCourses
      .filter((c) => c.toLowerCase().includes(courseCode.toLowerCase()))
      .slice(0, 5);
  }, [courseCode, selectedProf]);

  const handleSubmit = async () => {
    const courseValue = courseCode.trim();

    const missing: string[] = [];
    if (rating < 1) missing.push("rating");
    if (difficulty < 1) missing.push("difficulty");
    if (!retake) missing.push("retake");
    if (!courseValue) missing.push("course");
    if (!textbook) missing.push("textbook");
    if (creditHr < 1) missing.push("credit hours");
    if (!grade) missing.push("grade");

    if (missing.length > 0) {
      setError(
        "Please fill all required fields before submitting. Tags are optional."
      );
      return;
    }

    if (!selectedProf) {
      setError("Professor not found.");
      return;
    }

    setError(null);
    setSubmitMessage(null);
    setSubmitting(true);

    const shouldAddCourse = !(selectedProf.courses ?? []).some(
      (c) => c.toLowerCase() === courseValue.toLowerCase()
    );
    let courseAdded = false;

    try {
      await submitProfessorRating(selectedProf.id, {
        rating,
        difficulty,
        wouldTakeAgain: retake === "yes",
        course: courseValue,
        creditHr,
        textbook,
        grade,
        comment: review.trim() ? review : undefined,
        tags: selectedTags,
      });

      if (shouldAddCourse) {
        try {
          await addCourseToProfessor(selectedProf.id, courseValue);
          courseAdded = true;
        } catch (courseErr) {
          console.error("Failed to add course to lecturer", courseErr);
        }
      }

      setSelectedProf((prev) => {
        if (!prev) return prev;
        const existing = prev.courses ?? [];
        const exists = existing.some(
          (c) => c.toLowerCase() === courseValue.toLowerCase()
        );
        if (exists) return prev;
        if (courseAdded) {
          return { ...prev, courses: [...existing, courseValue] };
        }
        return prev;
      });

      toast({
        title: "Rating submitted",
        description: "Redirecting to professor page...",
      });

      router.push(`/professor/${selectedProf.id}`);

      setSubmitMessage(
        courseAdded || !shouldAddCourse
          ? "Thanks for your rating! It has been submitted."
          : "Rating submitted. Adding the course failed—please try again later."
      );
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

  if (loading) {
    return <div className="p-4">Loading professor...</div>;
  }

  if (!selectedProf) {
    return <div className="p-4">Professor not found</div>;
  }

  const selectedSchoolName = selectedProf.schoolName || "University";

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else if (selectedTags.length < 3) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <p className="text-sm font-medium uppercase tracking-wide text-gray-900">
            Add Rating
          </p>
          <h1 className="text-3xl font-bold">{selectedProf.name}</h1>
          <p className="mt-1 text-sm">
            <span className="font-semibold">{selectedProf.department}</span> •
            {selectedProf.schoolId ? (
              <Link
                href={`/school/${selectedProf.schoolId}`}
                className="ml-1 text-blue-600 hover:underline"
              >
                {selectedSchoolName}
              </Link>
            ) : (
              <span className="ml-1 text-blue-600">{selectedSchoolName}</span>
            )}
          </p>

          {loadError ? (
            <p className="mt-2 text-sm text-destructive">{loadError}</p>
          ) : null}

          {professorTags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              {professorTags.map((tag) => (
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

        {/* Select up to 3 tags */}
        <div className="mb-6 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold">
            Select up to 3 tags{" "}
            <span className="font-normal text-gray-400">
              ({selectedTags.length}/3)
            </span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  selectedTags.includes(tag)
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                } ${
                  selectedTags.length >= 3 && !selectedTags.includes(tag)
                    ? "cursor-not-allowed opacity-40"
                    : ""
                }`}
                disabled={
                  selectedTags.length >= 3 && !selectedTags.includes(tag)
                }
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Course + grade */}
        <div className="mb-6 grid gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:grid-cols-2">
          <div>
            <h2 className="mb-2 text-sm font-semibold">
              Course name / code <span className="text-red-500">*</span>
            </h2>
            <input
              type="text"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              placeholder="e.g. CS 101"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
            {courseSuggestions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {courseSuggestions.map((course) => (
                  <button
                    key={course}
                    onClick={() => setCourseCode(course)}
                    className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-200"
                  >
                    {course}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <h2 className="mb-2 text-sm font-semibold">
              Grade received <span className="text-red-500">*</span>
            </h2>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            >
              <option value="">Select grade</option>
              {["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F", "N/A"].map(
                (g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        {/* Ratings — compact grid */}
        <div className="mb-6 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            <RatingScale
              label="Overall rating"
              required
              value={rating}
              onChange={setRating}
              lowLabel="Awful"
              highLabel="Awesome"
            />
            <RatingScale
              label="Difficulty"
              required
              value={difficulty}
              onChange={setDifficulty}
              lowLabel="Easy"
              highLabel="Hard"
            />
            <RatingScale
              label="Credit hours"
              required
              value={creditHr}
              onChange={setCreditHr}
              lowLabel="Low"
              highLabel="High"
            />
          </div>
        </div>

        {/* Yes / No questions */}
        <div className="mb-6 grid gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:grid-cols-2">
          <YesNo
            label="Would take again?"
            required
            value={retake}
            onChange={setRetake}
          />
          <YesNo label="Used textbooks?" value={textbook} onChange={setTextbook} />
        </div>

        {/* Write a Review */}
        <div className="mb-6 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold">
            Write a Review <span className="text-red-500">*</span>
          </h2>
          <p className="mb-3 text-sm text-gray-500">
            Cover teaching style and how clearly they convey material.
          </p>
          <textarea
            placeholder="What do you want other students to know about this professor?"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            maxLength={350}
            rows={5}
            required
            className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
          <div className="mt-1 text-right text-xs text-gray-400">
            {review.length}/350
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="mb-4 text-center text-xs text-gray-500">
          <p>
            By clicking "Submit", I acknowledge that I have read and agreed to
            the Rate My Professors{" "}
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
        <div className="mb-8 flex justify-center">
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
