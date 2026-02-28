"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { fetchProfessors } from "@/lib/api/professors";
import { fetchSchools } from "@/lib/api/schools";

type BrowseTab = "professors" | "schools";

const ratingColor = (value: number) => {
  if (value < 1) return "bg-red-600 text-white";
  if (value < 2) return "bg-pink-500 text-white";
  if (value < 3) return "bg-yellow-300 text-gray-900";
  if (value < 4) return "bg-green-200 text-gray-900";
  return "bg-green-600 text-white";
};

export default function BrowsePage() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab: BrowseTab = tabParam === "schools" ? "schools" : "professors";

  const [professors, setProfessors] = useState<
    Awaited<ReturnType<typeof fetchProfessors>>
  >([]);
  const [schools, setSchools] = useState<
    Awaited<ReturnType<typeof fetchSchools>>
  >([]);
  const [professorsError, setProfessorsError] = useState<string | null>(null);
  const [schoolsError, setSchoolsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [profList, schoolList] = await Promise.all([
          fetchProfessors(),
          fetchSchools(),
        ]);

        if (!active) return;
        setProfessors(profList);
        setSchools(schoolList);
      } catch (err) {
        if (!active) return;
        const message =
          err instanceof Error ? err.message : "Unable to load data.";
        setProfessorsError(message);
        setSchoolsError(message);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Browse</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b">
          <Link
            href="/browse?tab=professors"
            className={`px-4 py-2 font-semibold border-b-2 ${
              activeTab === "professors"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600"
            }`}
          >
            Professors ({professors.length})
          </Link>
          <Link
            href="/browse?tab=schools"
            className={`px-4 py-2 font-semibold border-b-2 ${
              activeTab === "schools"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600"
            }`}
          >
            Schools ({schools.length})
          </Link>
        </div>

        {loading && <div className="text-sm text-gray-600">Loading data…</div>}
        {professorsError && activeTab === "professors" && (
          <div className="mb-4 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {professorsError}
          </div>
        )}
        {schoolsError && activeTab === "schools" && (
          <div className="mb-4 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {schoolsError}
          </div>
        )}

        {/* Professors Grid */}
        {activeTab === "professors" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {professors.map((prof) => (
              <Link
                key={prof.id}
                href={`/professor/${prof.id}`}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg">{prof.name}</h3>
                    <p className="text-sm text-gray-600">{prof.department}</p>
                  </div>
                  <span
                    className={`rounded px-3 py-1 text-sm font-semibold ${ratingColor(
                      prof.averageRating
                    )}`}
                  >
                    {prof.averageRating.toFixed(1)}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-3">{prof.schoolName}</p>

                <div className="flex justify-between text-xs text-gray-500">
                  <span>{prof.totalRatings} ratings</span>
                  <span>
                    {prof.wouldTakeAgain != null
                      ? `${prof.wouldTakeAgain.toFixed(0)}% would take again`
                      : "N/A would take again"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Schools Grid */}
        {activeTab === "schools" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schools.map((school) => (
              <Link
                key={school.id}
                href={`/school/${school.id}`}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg">{school.name}</h3>
                    <p className="text-sm text-gray-600">{school.location}</p>
                  </div>
                  <span
                    className={`rounded px-3 py-1 text-sm font-semibold ${ratingColor(
                      school.averageRating
                    )}`}
                  >
                    {school.averageRating.toFixed(1)}
                  </span>
                </div>

                <div className="flex justify-between text-xs text-gray-500">
                  <span>{school.totalRatings} ratings</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
