"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";
import { authClient } from "@/lib/auth-client";
import { useSearch } from "@/hooks/use-search";

interface NavigationProps {
  isHomepage?: boolean;
}

export default function Navigation({ isHomepage = false }: NavigationProps) {
  const router = useRouter();
  const showSearch = !isHomepage;
  const { session } = useAuth();
  const fullName = session?.user?.name || "";
  const userName = fullName.split(" ")[0] || "User";
  const isLoggedIn = !!session;

  const [showDropdown, setShowDropdown] = useState(false);
  const [searchType, setSearchType] = useState<"professors" | "schools">(
    "professors"
  );
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showMobileSuggestions, setShowMobileSuggestions] = useState(false);
  const [profQuery, setProfQuery] = useState("");
  const [schoolQuery, setSchoolQuery] = useState("");

  const { results, count, loading, search } = useSearch();

  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const refs = [
      { ref: dropdownRef, close: () => setShowDropdown(false) },
      { ref: mobileMenuRef, close: () => setShowMobileMenu(false) },
      { ref: suggestionsRef, close: () => setShowSuggestions(false) },
      {
        ref: mobileSearchRef,
        close: () => {
          setShowMobileSearch(false);
          setShowMobileSuggestions(false);
        },
      },
    ];

    function handleClickOutside(event: MouseEvent) {
      refs.forEach(({ ref, close }) => {
        if (ref.current && !ref.current.contains(event.target as Node)) {
          close();
        }
      });
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchTypeChange = (value: "professors" | "schools") => {
    setSearchType(value);
    search({
      mode: value,
      query: value === "professors" ? profQuery : schoolQuery,
    });
  };

  const handleQueryChange = (value: string, isMobile = false) => {
    if (searchType === "professors") setProfQuery(value);
    else setSchoolQuery(value);

    search({ mode: searchType, query: value });

    if (isMobile) setShowMobileSuggestions(true);
    else setShowSuggestions(true);
  };

  const handleResultClick = (id: string, type: "professors" | "schools") => {
    setShowSuggestions(false);
    setShowMobileSuggestions(false);
    setShowMobileSearch(false);
    router.push(`/${type === "professors" ? "professor" : "school"}/${id}`);
  };

  const handleLogout = async () => {
    await authClient.signOut();
    setShowDropdown(false);
    setShowMobileMenu(false);
    router.push("/");
    router.refresh();
  };

  // Reusable inner content for suggestions (Mobile & Desktop)
  const renderSuggestionsContent = (queryText: string, prefixKey: string) => {
    if (loading)
      return (
        <div className="px-3 py-2 text-sm text-gray-700">Searching...</div>
      );
    if (results.length === 0) {
      const msg =
        queryText.trim().length < 3
          ? "Type at least 3 characters"
          : count === 0
          ? "No matches yet"
          : "Searching...";
      return <div className="px-3 py-2 text-sm text-gray-700">{msg}</div>;
    }
    return results.map((item) => (
      <button
        key={`${prefixKey}-${item.type}-${item.id}`}
        type="button"
        className="block w-full px-3 py-2 text-left text-sm hover:bg-white/60"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => handleResultClick(item.id, item.type)}
      >
        <div className="font-semibold">{item.name}</div>
        {item.subtitle && (
          <div className="text-xs text-gray-600">{item.subtitle}</div>
        )}
      </button>
    ));
  };

  // Shared User Dropdown for Desktop
  const renderUserDropdown = () => (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="text-sm font-semibold hover:text-gray-300 flex items-center gap-2"
      >
        Hey, {userName}
        <span className="text-xs">▼</span>
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-lg shadow-lg py-2">
          <Link
            href="/profile"
            className="block px-4 py-2 hover:bg-gray-100 text-sm font-medium"
            onClick={() => setShowDropdown(false)}
          >
            Profile
          </Link>
          <Link
            href="/my-ratings"
            className="block px-4 py-2 hover:bg-gray-100 text-sm font-medium"
            onClick={() => setShowDropdown(false)}
          >
            Your Ratings
          </Link>
          <div className="border-t border-gray-200 my-1" />
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm font-medium"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );

  const activeQuery = searchType === "professors" ? profQuery : schoolQuery;

  return (
    <header className="sticky top-0 z-100 bg-black text-white flex items-center justify-between px-4 lg:px-6 xl:px-12 py-3">
      {/* --- Mobile Layout --- */}
      <div className="lg:hidden flex items-center justify-between w-full">
        <Link
          href="/"
          className="text-xl font-bold bg-white text-black px-3 py-1 rounded"
        >
          RYP
        </Link>

        <div className="flex items-center gap-1">
          {showSearch && (
            <div className="relative" ref={mobileSearchRef}>
              <button
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                className="p-2"
                aria-label="Open search"
              >
                <Search className="h-6 w-6" aria-hidden="true" />
              </button>

              {showMobileSearch && (
                <div className="fixed left-0 right-0 top-16 z-120 w-screen border border-gray-600 bg-black p-4 shadow-lg">
                  <div className="flex flex-col gap-3">
                    <div className="relative">
                      <select
                        value={searchType}
                        onChange={(e) =>
                          handleSearchTypeChange(
                            e.target.value as "professors" | "schools"
                          )
                        }
                        className="w-full appearance-none rounded border border-gray-600 bg-transparent px-3 py-2 pr-8 text-sm font-medium"
                      >
                        <option value="professors" className="bg-black">
                          Professors
                        </option>
                        <option value="schools" className="bg-black">
                          Schools
                        </option>
                      </select>
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs">
                        ▼
                      </span>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        value={activeQuery}
                        onFocus={() => setShowMobileSuggestions(true)}
                        onChange={(e) =>
                          handleQueryChange(e.target.value, true)
                        }
                        placeholder={
                          searchType === "professors"
                            ? "Professor name"
                            : "School name"
                        }
                        className="w-full rounded-full border border-gray-500 bg-transparent px-4 py-2 text-sm placeholder-gray-400 focus:outline-none focus:border-white"
                      />
                    </div>

                    {showMobileSuggestions && (
                      <div className="max-h-56 overflow-auto rounded-lg border border-white/30 bg-white/70 text-black shadow-lg">
                        {renderSuggestionsContent(activeQuery, "mobile")}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="relative" ref={mobileMenuRef}>
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>

            {showMobileMenu && (
              <div className="absolute right-0 top-full z-120 mt-2 w-56 rounded-lg bg-white py-2 text-black shadow-lg">
                <Link
                  href="/browse"
                  className="block w-full text-left px-4 py-2 text-sm font-medium hover:bg-gray-100"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Browse
                </Link>
                {!isLoggedIn ? (
                  <>
                    <Link
                      href="/login"
                      className="block w-full text-left px-4 py-2 text-sm font-medium hover:bg-gray-100"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Log In
                    </Link>
                    <Link
                      href="/signup"
                      className="block w-full text-left px-4 py-2 text-sm font-medium hover:bg-gray-100"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/lecturer/add"
                      className="block w-full text-left px-4 py-2 text-sm font-medium hover:bg-gray-100"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Add a Lecturer
                    </Link>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm font-medium hover:bg-gray-100"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/my-ratings"
                      className="block px-4 py-2 text-sm font-medium hover:bg-gray-100"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Your Ratings
                    </Link>
                    <div className="my-1 border-t border-gray-200" />
                    <button
                      onClick={handleLogout}
                      className="block w-full px-4 py-2 text-left text-sm font-medium hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- Desktop Layout --- */}
      <div className="hidden lg:flex items-center gap-6 w-full justify-center">
        <Link
          href="/"
          className="text-xl font-bold bg-white text-black px-3 py-1 rounded"
        >
          RYP
        </Link>

        {showSearch && (
          <div className="flex items-center gap-3 mr-40">
            <div className="relative">
              <select
                value={searchType}
                onChange={(e) =>
                  handleSearchTypeChange(
                    e.target.value as "professors" | "schools"
                  )
                }
                className="flex items-center gap-1 text-sm font-medium hover:text-gray-300 bg-transparent border-none cursor-pointer appearance-none pr-5"
              >
                <option value="professors" className="bg-black">
                  Professors
                </option>
                <option value="schools" className="bg-black">
                  Schools
                </option>
              </select>
              <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs pointer-events-none">
                ▼
              </span>
            </div>

            <div className="relative w-130" ref={suggestionsRef}>
              <input
                type="text"
                value={activeQuery}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => handleQueryChange(e.target.value, false)}
                placeholder={
                  searchType === "professors" ? "Professor name" : "School name"
                }
                className="w-130 bg-transparent border border-gray-500 rounded-full px-4 py-2 text-sm placeholder-gray-400 focus:outline-none focus:border-white"
              />
              {showSuggestions && (
                <div className="absolute top-full mt-2 max-h-64 overflow-auto rounded-lg border border-white/30 bg-white/60 text-black shadow-lg backdrop-blur-md z-50 left-1/2 -translate-x-1/2 w-130 max-w-[90vw]">
                  {renderSuggestionsContent(activeQuery, "desktop")}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right Side Nav */}
        <div
          className={`flex items-center gap-3 ${isHomepage ? "ml-180" : ""}`}
        >
          {!isLoggedIn ? (
            <>
              <Button
                asChild
                variant="ghost"
                className={
                  "text-white hover:text-black text-sm font-medium rounded-full px-6"
                }
              >
                <Link href="/browse">Browse</Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className={
                  "text-white hover:text-black text-sm font-medium rounded-full px-6"
                }
              >
                <Link href="/signup">Sign Up</Link>
              </Button>
              <Button
                asChild
                variant={"ghost"}
                className={
                  "text-white hover:text-black text-sm font-medium rounded-full px-6"
                }
              >
                <Link href="/login">Log In</Link>
              </Button>
            </>
          ) : (
            <>
              <Button
                asChild
                variant="outline"
                className={
                  isHomepage
                    ? "bg-transparent rounded-full px-8 text-white border-white hover:bg-white hover:text-black hover:scale-105 transition-all duration-300 text-sm"
                    : "bg-white text-black border-white hover:bg-black hover:text-white text-sm font-medium rounded-full px-6"
                }
              >
                <Link href="/browse">Browse</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className={
                  isHomepage
                    ? "bg-transparent rounded-full px-8 text-white border-white hover:bg-white hover:text-black hover:scale-105 transition-all duration-300 text-sm"
                    : "bg-white text-black border-white hover:bg-black hover:text-white text-sm font-medium rounded-full px-6"
                }
              >
                <Link href="/lecturer/add">Add a Lecturer</Link>
              </Button>
              {renderUserDropdown()}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
