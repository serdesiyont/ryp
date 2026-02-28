"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type ProfessorRating = {
  id: number;
  type: "professor";
  entityId: number;
  professorName: string;
  department: string;
  school: string;
  rating: number;
  date: string;
  course: string;
  values: {
    rating: number;
    difficulty: number;
    retake: "yes" | "no";
    course: string;
    textbook: "yes" | "no";
    attendance: "mandatory" | "optional";
    credit: "yes" | "no";
    grade: string;
    review: string;
    tags?: string[];
  };
};

type SchoolRating = {
  id: number;
  type: "school";
  entityId: number;
  school: string;
  location: string;
  rating: number;
  date: string;
  values: {
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
    review: string;
  };
};

type UserRating = ProfessorRating | SchoolRating;

const ratingColor = (value: number) => {
  if (value >= 3.5) return "bg-green-300";
  if (value >= 2.5) return "bg-yellow-300";
  if (value >= 1.5) return "bg-orange-300";
  return "bg-red-300";
};

export default function MyRatingsPage() {
  const [userRatings, setUserRatings] = useState<UserRating[]>([
    {
      id: 1,
      type: "professor",
      entityId: 816421,
      professorName: "John Stilgoe",
      department: "Environmental Studies",
      school: "Harvard University",
      rating: 1.0,
      date: "Sep 15th, 2022",
      course: "GSD600",
      values: {
        rating: 1,
        difficulty: 1,
        retake: "no",
        course: "GSD600",
        textbook: "no",
        attendance: "mandatory",
        credit: "yes",
        grade: "Audit/No Grade",
        review:
          "Felt dismissive in lectures; looking to improve classroom experience.",
        tags: ["Tough Grader", "Lecture Heavy"],
      },
    },
    {
      id: 2,
      type: "professor",
      entityId: 1,
      professorName: "Jane Smith",
      department: "Computer Science",
      school: "Harvard University",
      rating: 4.2,
      date: "Mar 10th, 2023",
      course: "CS50",
      values: {
        rating: 4,
        difficulty: 2,
        retake: "yes",
        course: "CS50",
        textbook: "yes",
        attendance: "optional",
        credit: "yes",
        grade: "A",
        review: "Great pacing and clear grading; would definitely take again.",
        tags: ["Amazing Lectures", "Gives Good Feedback"],
      },
    },
    {
      id: 3,
      type: "school",
      entityId: 399,
      school: "Harvard University",
      location: "Cambridge, MA",
      rating: 3.1,
      date: "Jan 27th, 2026",
      values: {
        reputation: 3,
        location: 3,
        opportunities: 4,
        facilities: 3,
        internet: 3,
        safety: 3,
        food: 2,
        clubs: 3,
        happiness: 3,
        social: 3,
        review:
          "Strong academics, food could improve, campus feels safe overall.",
      },
    },
  ]);

  const handleDelete = (id: number) => {
    setUserRatings((prev) => prev.filter((rating) => rating.id !== id));
  };

  const buildEditHref = (rating: UserRating) => {
    if (rating.type === "professor") {
      const params = new URLSearchParams({
        edit: "1",
        rating: rating.values.rating.toString(),
        difficulty: rating.values.difficulty.toString(),
        retake: rating.values.retake,
        course: rating.values.course,
        textbook: rating.values.textbook,
        attendance: rating.values.attendance,
        credit: rating.values.credit,
        grade: rating.values.grade,
        review: rating.values.review,
      });

      if (rating.values.tags?.length) {
        params.set("tags", rating.values.tags.join(","));
      }

      return `/rate/professor/${rating.entityId}?${params.toString()}`;
    }

    const params = new URLSearchParams({
      edit: "1",
      reputation: rating.values.reputation.toString(),
      location: rating.values.location.toString(),
      opportunities: rating.values.opportunities.toString(),
      facilities: rating.values.facilities.toString(),
      internet: rating.values.internet.toString(),
      safety: rating.values.safety.toString(),
      food: rating.values.food.toString(),
      clubs: rating.values.clubs.toString(),
      happiness: rating.values.happiness.toString(),
      social: rating.values.social.toString(),
      review: rating.values.review,
    });

    return `/rate/school/${rating.entityId}?${params.toString()}`;
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Ratings</h1>

        {userRatings.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 mb-4">
              You haven't submitted any ratings yet
            </p>
            <Link href="/rate">
              <Button className="bg-blue-600 text-white">
                Rate a Professor
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {userRatings.map((rating) => {
              const isProfessor = rating.type === "professor";
              const title =
                rating.type === "professor"
                  ? rating.professorName
                  : rating.school;
              const subtitle =
                rating.type === "professor"
                  ? `${rating.department} • ${rating.school}`
                  : rating.location;
              const meta =
                rating.type === "professor"
                  ? `${rating.course} • ${rating.date}`
                  : rating.date;

              return (
                <div
                  key={rating.id}
                  className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold">{title}</h3>
                      <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold uppercase text-gray-700">
                        {isProfessor ? "Professor" : "School"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{subtitle}</p>
                    <p className="text-xs text-gray-500">{meta}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-16 w-16 items-center justify-center rounded text-2xl font-bold ${ratingColor(
                        rating.rating
                      )}`}
                    >
                      {rating.rating.toFixed(1)}
                    </div>

                    <Link href={buildEditHref(rating)}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(rating.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
