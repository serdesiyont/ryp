"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
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

const ratingColor = (value: number) => {
  if (value <= 1) return "#dc2626";
  if (value <= 2) return "#f2994a";
  if (value <= 3) return "#facc15";
  if (value <= 4) return "#8ecf6f";
  return "#16a34a";
};

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
        <div className="mb-8">
          <h1 className="mb-1 text-4xl font-bold">{selectedProf.name}</h1>
          <p className="mb-3 text-lg text-gray-600">Add Rating</p>
          <p className="text-sm">
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
        <div className="mb-6 rounded-lg bg-white p-6">
          <h2 className="mb-4 font-semibold">Select up to 3 tags</h2>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  selectedTags.includes(tag)
                    ? "bg-gray-800 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                } ${
                  selectedTags.length >= 3 && !selectedTags.includes(tag)
                    ? "cursor-not-allowed opacity-50"
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

        {/* Select Course Code */}
        <div className="mb-6 rounded-lg bg-white p-6">
          <h2 className="mb-4 font-semibold">Course name / code</h2>
          <div className="mb-3">
            <input
              type="text"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              placeholder="Start typing course name or code"
              className="w-full rounded border border-gray-300 px-4 py-2"
            />
          </div>
          {courseSuggestions.length > 0 && (
            <div className="mb-4 rounded border border-gray-200 bg-gray-50 p-2 text-sm">
              {courseSuggestions.map((course) => (
                <button
                  key={course}
                  onClick={() => setCourseCode(course)}
                  className="block w-full rounded px-3 py-2 text-left hover:bg-white"
                >
                  {course}
                </button>
              ))}
            </div>
          )}
          <label className="flex cursor-pointer items-center gap-3">
            <span className="text-sm">Fill course name if not listed</span>
          </label>
        </div>

        {/* Rate your professor */}
        <div className="mb-6 rounded-lg bg-white p-6">
          <h2 className="mb-4 font-semibold">
            Rate your professor <span className="text-red-500">*</span>
          </h2>
          <div className="mb-4 flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                onClick={() => setRating(value)}
                style={{
                  backgroundColor:
                    value <= rating && rating > 0
                      ? ratingColor(rating)
                      : "#e5e7eb",
                }}
                className="h-12 w-12 rounded-lg transition"
              />
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>1 - Awful</span>
            <span>5 - Awesome</span>
          </div>
        </div>

        {/* How difficult */}
        <div className="mb-6 rounded-lg bg-white p-6">
          <h2 className="mb-4 font-semibold">
            How difficult was this professor?{" "}
            <span className="text-red-500">*</span>
          </h2>
          <div className="mb-4 flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                onClick={() => setDifficulty(value)}
                style={{
                  backgroundColor:
                    value <= difficulty && difficulty > 0
                      ? ratingColor(difficulty)
                      : "#e5e7eb",
                }}
                className="h-12 w-12 rounded-lg transition"
              />
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>1 - Very Easy</span>
            <span>5 - Very Difficult</span>
          </div>
        </div>

        {/* Credit hours */}
        <div className="mb-6 rounded-lg bg-white p-6">
          <h2 className="mb-4 font-semibold">
            Credit hours <span className="text-red-500">*</span>
          </h2>
          <div className="mb-4 flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                onClick={() => setCreditHr(value)}
                style={{
                  backgroundColor:
                    value <= creditHr && creditHr > 0
                      ? ratingColor(creditHr)
                      : "#e5e7eb",
                }}
                className="h-12 w-12 rounded-lg transition"
              />
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>1 - Low</span>
            <span>5 - High</span>
          </div>
        </div>

        {/* Would you take again */}
        <div className="mb-6 rounded-lg bg-white p-6">
          <h2 className="mb-4 font-semibold">
            Would you take this professor again?{" "}
            <span className="text-red-500">*</span>
          </h2>
          <div className="flex justify-center gap-6">
            <button
              onClick={() => setRetake("yes")}
              className={`h-16 w-16 rounded-full border-4 transition ${
                retake === "yes"
                  ? "border-green-600 bg-green-100"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            />
            <button
              onClick={() => setRetake("no")}
              className={`h-16 w-16 rounded-full border-4 transition ${
                retake === "no"
                  ? "border-red-600 bg-red-100"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            />
          </div>
          <div className="mt-2 flex justify-center gap-32 text-sm">
            <span>Yes</span>
            <span>No</span>
          </div>
        </div>

        {/* Did this professor use textbooks */}
        <div className="mb-6 rounded-lg bg-white p-6">
          <h2 className="mb-4 font-semibold">
            Did this professor use textbooks?
          </h2>
          <div className="flex justify-center gap-6">
            <button
              onClick={() => setTextbook("yes")}
              className={`h-16 w-16 rounded-full border-4 transition ${
                textbook === "yes"
                  ? "border-green-600 bg-green-100"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            />
            <button
              onClick={() => setTextbook("no")}
              className={`h-16 w-16 rounded-full border-4 transition ${
                textbook === "no"
                  ? "border-red-600 bg-red-100"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            />
          </div>
          <div className="mt-2 flex justify-center gap-32 text-sm">
            <span>Yes</span>
            <span>No</span>
          </div>
        </div>

        {/* Select grade received */}
        <div className="mb-6 rounded-lg bg-white p-6">
          <h2 className="mb-4 font-semibold">Select grade received</h2>
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="w-full rounded border border-gray-300 px-4 py-2"
          >
            <option value="">Select grade</option>
            <option value="A">A</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B">B</option>
            <option value="B-">B-</option>
            <option value="C+">C+</option>
            <option value="C">C</option>
            <option value="C-">C-</option>
            <option value="D">D</option>
            <option value="F">F</option>
            <option value="N/A">N/A</option>
          </select>
        </div>

        {/* Write a Review */}
        <div className="mb-6 rounded-lg bg-white p-6">
          <h2 className="mb-3 font-semibold">
            Write a Review <span className="text-red-500">*</span>
          </h2>
          <p className="mb-4 text-sm text-gray-600">
            Discuss the professor's professional abilities including teaching
            style and ability to convey the material clearly
          </p>

          {/* Guidelines */}
          <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-start gap-3">
              <span className="text-lg font-bold">ℹ</span>
              <div>
                <button className="mb-2 text-sm font-semibold hover:underline">
                  Guidelines
                </button>
                <ul className="hidden space-y-1 text-sm text-gray-700">
                  <li>
                    • Your rating could be removed if you use profanity or
                    derogatory terms.
                  </li>
                  <li>
                    • Don't claim that the professor shows bias or favoritism
                    for or against students.
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
            placeholder="What do you want other students to know about this professor?"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            maxLength={350}
            rows={8}
            required
            className="w-full resize-none rounded border border-blue-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <div className="mt-1 text-right text-sm text-gray-600">
            {review.length}/350
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="mb-6 rounded-lg bg-white p-6 text-center text-sm">
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
        <div className="mb-8 flex justify-center">
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
