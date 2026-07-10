"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  GraduationCap,
  Building2,
  Star,
  Users,
  ThumbsUp,
  MapPin,
  BookOpen,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { fetchProfessors } from "@/lib/api/professors";
import { fetchSchools } from "@/lib/api/schools";

type BrowseTab = "professors" | "schools";
type SortKey = "rating" | "ratings" | "name";

const ratingColor = (value: number) => {
  if (value < 1) return "bg-red-600 text-white";
  if (value < 2) return "bg-orange-500 text-white";
  if (value < 3) return "bg-yellow-300 text-gray-900";
  if (value < 4) return "bg-lime-300 text-gray-900";
  return "bg-green-600 text-white";
};

// Reveal-on-scroll: fades/slides children in as they enter the viewport.
function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-500 ease-out ${
        shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      {children}
    </div>
  );
}

function StatPill({
  icon: Icon,
  children,
}: {
  icon: typeof Users;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-gray-600">
      <Icon className="h-3.5 w-3.5 text-gray-400" />
      {children}
    </span>
  );
}

function BrowseContent() {
  const searchParams = useSearchParams();
  const initialTab: BrowseTab =
    searchParams.get("tab") === "schools" ? "schools" : "professors";

  const [activeTab, setActiveTab] = useState<BrowseTab>(initialTab);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("rating");

  const [professors, setProfessors] = useState<
    Awaited<ReturnType<typeof fetchProfessors>>
  >([]);
  const [schools, setSchools] = useState<
    Awaited<ReturnType<typeof fetchSchools>>
  >([]);
  const [error, setError] = useState<string | null>(null);
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
        setError(err instanceof Error ? err.message : "Unable to load data.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  // Switch tab without navigating (prevents the scroll jump), keep URL in sync.
  const switchTab = (tab: BrowseTab) => {
    setActiveTab(tab);
    setQuery("");
    window.history.replaceState(null, "", `/browse?tab=${tab}`);
  };

  const filteredProfessors = useMemo(() => {
    const q = query.trim().toLowerCase();
    return professors
      .filter(
        (p) =>
          !q ||
          p.name.toLowerCase().includes(q) ||
          p.department?.toLowerCase().includes(q) ||
          p.schoolName?.toLowerCase().includes(q)
      )
      .sort((a, b) => {
        if (sort === "name") return a.name.localeCompare(b.name);
        if (sort === "ratings") return b.totalRatings - a.totalRatings;
        return b.averageRating - a.averageRating;
      });
  }, [professors, query, sort]);

  const filteredSchools = useMemo(() => {
    const q = query.trim().toLowerCase();
    return schools
      .filter(
        (s) =>
          !q ||
          s.name.toLowerCase().includes(q) ||
          s.location?.toLowerCase().includes(q)
      )
      .sort((a, b) => {
        if (sort === "name") return a.name.localeCompare(b.name);
        if (sort === "ratings") return b.totalRatings - a.totalRatings;
        return b.averageRating - a.averageRating;
      });
  }, [schools, query, sort]);

  const isProf = activeTab === "professors";
  const shownCount = isProf
    ? filteredProfessors.length
    : filteredSchools.length;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navigation isHomepage />

      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <span className="rounded-xl bg-gray-900 p-2 text-white">
              <Search className="h-6 w-6" />
            </span>
            Browse
          </h1>
          <p className="mt-2 text-gray-600">
            Explore {professors.length} professors and {schools.length} universities
            — find your next class with confidence.
          </p>
        </div>

        {/* Tab toggle (state-based, no navigation → no page jump) */}
        <div className="mb-6 inline-flex rounded-full bg-gray-100 p-1">
          <button
            onClick={() => switchTab("professors")}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition ${
              isProf
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            Professors
            <span className="rounded-full bg-gray-200 px-2 text-xs text-gray-700">
              {professors.length}
            </span>
          </button>
          <button
            onClick={() => switchTab("schools")}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition ${
              !isProf
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Building2 className="h-4 w-4" />
            Universities
            <span className="rounded-full bg-gray-200 px-2 text-xs text-gray-700">
              {schools.length}
            </span>
          </button>
        </div>

        {/* Search + sort */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                isProf
                  ? "Search professors, departments…"
                  : "Search universities or locations…"
              }
              className="w-full rounded-full border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>
          <div className="relative">
            <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="appearance-none rounded-full border border-gray-200 bg-white py-2.5 pl-10 pr-8 text-sm shadow-sm focus:border-gray-500 focus:outline-none"
            >
              <option value="rating">Top rated</option>
              <option value="ratings">Most rated</option>
              <option value="name">A → Z</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {error}
          </div>
        )}

        {/* min-height reserves space so the footer doesn't jump between tabs */}
        <div className="min-h-[60vh]">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-36 animate-pulse rounded-2xl border border-gray-100 bg-white"
                />
              ))}
            </div>
          ) : shownCount === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500">
              <Search className="mb-3 h-10 w-10 text-gray-300" />
              <p className="font-medium">No matches found</p>
              <p className="text-sm">Try a different search term.</p>
            </div>
          ) : isProf ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredProfessors.map((prof, i) => (
                <Reveal key={prof.id} delay={(i % 3) * 60}>
                  <Link
                    href={`/professor/${prof.id}`}
                    className="group flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-gray-300 hover:shadow-lg"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate font-bold text-lg group-hover:text-gray-900">
                          {prof.name}
                        </h3>
                        <p className="flex items-center gap-1 truncate text-sm text-gray-500">
                          <BookOpen className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                          {prof.department}
                        </p>
                      </div>
                      <span
                        className={`inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1 text-sm font-bold ${ratingColor(
                          prof.averageRating
                        )}`}
                      >
                        <Star className="h-3.5 w-3.5 fill-current" />
                        {prof.averageRating.toFixed(1)}
                      </span>
                    </div>

                    <p className="mb-4 flex items-center gap-1 truncate text-sm text-gray-500">
                      <Building2 className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                      {prof.schoolName}
                    </p>

                    <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3">
                      <StatPill icon={Users}>
                        {prof.totalRatings} ratings
                      </StatPill>
                      {prof.wouldTakeAgain != null && (
                        <StatPill icon={ThumbsUp}>
                          {prof.wouldTakeAgain.toFixed(0)}% again
                        </StatPill>
                      )}
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredSchools.map((school, i) => (
                <Reveal key={school.id} delay={(i % 3) * 60}>
                  <Link
                    href={`/school/${school.id}`}
                    className="group flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-gray-300 hover:shadow-lg"
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate font-bold text-lg group-hover:text-gray-900">
                          {school.name}
                        </h3>
                        <p className="flex items-center gap-1 truncate text-sm text-gray-500">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                          {school.location}
                        </p>
                      </div>
                      <span
                        className={`inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1 text-sm font-bold ${ratingColor(
                          school.averageRating
                        )}`}
                      >
                        <Star className="h-3.5 w-3.5 fill-current" />
                        {school.averageRating.toFixed(1)}
                      </span>
                    </div>

                    <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3">
                      <StatPill icon={Users}>
                        {school.totalRatings} ratings
                      </StatPill>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-900 opacity-0 transition group-hover:opacity-100">
                        View campus →
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense>
      <BrowseContent />
    </Suspense>
  );
}
