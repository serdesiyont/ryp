"use client";

import { useEffect, useRef, useState } from "react";
import { Lexend } from "next/font/google";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useSearch } from "@/hooks/use-search";

const lexend = Lexend({ subsets: ["latin"], weight: ["900"] });

export default function HeroSection() {
  const router = useRouter();
  const [searchType, setSearchType] = useState<"professors" | "schools">(
    "professors"
  );
  const [profQuery, setProfQuery] = useState("");
  const [schoolQuery, setSchoolQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { results, count, loading, error, search } = useSearch();

  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeQuery = searchType === "professors" ? profQuery : schoolQuery;

  const handleSearchTypeChange = (value: "professors" | "schools") => {
    setSearchType(value);
    const nextQuery = value === "professors" ? profQuery : schoolQuery;
    search({ mode: value, query: nextQuery });
  };

  const handleQueryChange = (value: string) => {
    if (searchType === "professors") {
      setProfQuery(value);
    } else {
      setSchoolQuery(value);
    }

    search({ mode: searchType, query: value });
    setShowSuggestions(true);
  };

  const handleResultClick = (id: string, type: "professors" | "schools") => {
    setShowSuggestions(false);
    router.push(`/${type === "professors" ? "professor" : "school"}/${id}`);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShowSuggestions(true);
  };

  const renderSuggestions = () => {
    if (error) {
      return <div className="px-3 py-2 text-sm text-red-700">{error}</div>;
    }

    if (loading) {
      return (
        <div className="px-3 py-2 text-sm text-gray-700">Searching...</div>
      );
    }

    if (activeQuery.trim().length < 3) {
      return null;
    }

    if (results.length === 0) {
      return (
        <div className="px-3 py-2 text-sm text-gray-700">No matches yet</div>
      );
    }

    return results.map((item) => (
      <button
        key={`${item.type}-${item.id}`}
        type="button"
        className="block w-full px-3 py-2 text-left text-sm hover:bg-neutral-100"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => handleResultClick(item.id, item.type)}
      >
        <div className="font-semibold text-black">{item.name}</div>
        {item.subtitle ? (
          <div className="text-xs text-neutral-600">{item.subtitle}</div>
        ) : null}
      </button>
    ));
  };

  return (
    <section className="relative overflow-hidden px-6 py-24">
      <div className="mx-auto max-w-4xl text-center">
        <h1
          className={`${lexend.className} mb-8 text-5xl font-black leading-[0.99] tracking-tight md:text-7xl`}
        >
          Find your future.
          <span className="relative -mt-2 block w-fit bg-black px-4 py-2.5 text-white md:-mt-2.5 mx-auto">
            Rate your experience.
          </span>
        </h1>
        <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-neutral-600">
          Access transparent reviews for universities and professors across
          Ethiopia. Join thousands of students making informed academic choices.
        </p>

        <div className="relative mx-auto max-w-2xl" ref={searchRef}>
          <div className="mb-6 flex justify-center">
            <div className="relative inline-grid grid-cols-2 rounded-full border border-black/10 bg-emerald-50 p-1">
              <span
                aria-hidden="true"
                className={`absolute bottom-1 left-1 top-1 w-[calc(50%-0.25rem)] rounded-full bg-black transition-transform duration-300 ease-out ${
                  searchType === "schools"
                    ? "translate-x-full"
                    : "translate-x-0"
                }`}
              />
              <button
                type="button"
                onClick={() => handleSearchTypeChange("professors")}
                className={`relative z-10 rounded-full px-6 py-2 text-sm font-bold transition-colors duration-200 ${
                  searchType === "professors"
                    ? "text-white"
                    : "text-neutral-500 hover:text-black"
                }`}
              >
                Professors
              </button>
              <button
                type="button"
                onClick={() => handleSearchTypeChange("schools")}
                className={`relative z-10 rounded-full px-6 py-2 text-sm font-bold transition-colors duration-200 ${
                  searchType === "schools"
                    ? "text-white"
                    : "text-neutral-500 hover:text-black"
                }`}
              >
                Universities
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="group flex items-center rounded-full border-2 border-black bg-white p-1 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Search
                className="ml-4 h-5 w-5 text-neutral-400"
                aria-hidden="true"
              />
              <input
                className={`w-full border-none px-4 py-4 text-lg placeholder:text-neutral-300 focus:outline-none ${
                  activeQuery.trim().length > 0 && activeQuery.trim().length < 3
                    ? "text-red-600"
                    : "text-black"
                }`}
                placeholder={
                  searchType === "professors"
                    ? "Search for a Professor"
                    : "Search for a University"
                }
                type="text"
                value={activeQuery}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => handleQueryChange(e.target.value)}
              />
              <button
                type="submit"
                className="ml-2 mr-1 rounded-full bg-black px-8 py-4 font-bold text-white transition-colors hover:bg-neutral-800"
              >
                Search
              </button>
            </div>
          </form>

          {showSuggestions &&
          (loading || !!error || activeQuery.trim().length >= 3) ? (
            <div className="absolute left-0 right-0 z-20 mt-2 max-h-72 overflow-auto rounded-2xl border border-black/10 bg-white/95 text-left shadow-lg backdrop-blur-sm">
              {renderSuggestions()}
              {results.length > 0 &&
              !loading &&
              activeQuery.trim().length >= 3 ? (
                <div className="border-t border-neutral-200 px-3 py-2 text-xs text-neutral-500">
                  {typeof count === "number"
                    ? `${count} result(s)`
                    : `${results.length} result(s)`}
                </div>
              ) : null}
            </div>
          ) : null}

          {/* <div className="mt-6 flex flex-wrap justify-center gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
              Trending:
            </span>
            <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold">
              #AAU
            </span>
            <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold">
              #JimmaUniversity
            </span>
            <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold">
              #Medicine
            </span>
            <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold">
              #Engineering
            </span>
          </div> */}
        </div>
      </div>
    </section>
  );
}
