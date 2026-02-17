"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/components/auth/auth-provider";

export default function Home() {
  const { session } = useAuth();
  const showWelcome = true;

  const isLoggedIn = !!session;

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navigation isHomepage={true} />

      {/* Hero Section */}
      <div
        className="relative h-96 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&h=400&fit=crop)",
        }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <h1 className="text-5xl font-bold mb-4 px-6 py-2 text-center">
            RATE MY PROFESSORS
          </h1>
          <p className="text-2xl text-center px-4">
            Find and rate professors and schools
          </p>
        </div>
      </div>

      {/* Welcome Back Section */}
      {showWelcome && (
        <div className="bg-gradient-to-b from-yellow-50 to-white py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-16">Welcome!</h2>

            <div className="grid md:grid-cols-3 gap-8 mb-8">
              {/* Illustration 1 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-40 h-40 mb-6 bg-gradient-to-br from-yellow-200 to-blue-200 rounded-full flex items-center justify-center">
                  <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none">
                    <circle cx="50" cy="30" r="15" fill="#FFD700" />
                    <path
                      d="M35 50 Q50 70 65 50"
                      stroke="#1E40AF"
                      strokeWidth="3"
                      fill="none"
                    />
                    <rect x="40" y="55" width="20" height="25" fill="#1E40AF" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">
                  Manage and edit your ratings
                </h3>
              </div>

              {/* Illustration 2 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-40 h-40 mb-6 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full flex items-center justify-center">
                  <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none">
                    <circle cx="50" cy="30" r="15" fill="#FFB6E1" />
                    <circle cx="40" cy="60" r="8" fill="#1E40AF" />
                    <circle cx="60" cy="60" r="8" fill="#1E40AF" />
                    <path
                      d="M40 70 Q50 80 60 70"
                      stroke="#1E40AF"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">
                  Your ratings are always anonymous
                </h3>
              </div>

              {/* Illustration 3 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-40 h-40 mb-6 bg-gradient-to-br from-cyan-200 to-yellow-200 rounded-full flex items-center justify-center">
                  <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none">
                    <path
                      d="M50 20 L60 50 L90 50 L65 70 L75 100 L50 80 L25 100 L35 70 L10 50 L40 50 Z"
                      fill="#FFD700"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">
                  Like or dislike ratings
                </h3>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              {isLoggedIn ? (
                <div className="flex items-center gap-4">
                  <Link href="/my-ratings">
                    <Button className="bg-black text-white rounded-full px-8 py-3 hover:bg-blue-600 ">
                      My Ratings
                    </Button>
                  </Link>
                  <Link href="/rate">
                    <Button className="bg-blue-600 text-white rounded-full px-8 py-3 ">
                      Rate a Professor
                    </Button>
                  </Link>
                </div>
              ) : (
                <Link href="/signup">
                  <Button className="bg-black text-white rounded-full px-8 py-3 hover:bg-blue-600">
                    Sign Up Now
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-100 py-6 px-4 border-t">
        <div className="max-w-6xl mx-auto flex justify-center gap-4 text-xs text-gray-600">
          <a href="#" className="hover:underline">
            Help
          </a>
          <a href="#" className="hover:underline">
            Site Guidelines
          </a>
          <a href="#" className="hover:underline">
            Terms & Conditions
          </a>
          <a href="#" className="hover:underline">
            Privacy Policy
          </a>

          <a href="#" className="hover:underline">
            CA Notice at Collection
          </a>
          <a href="#" className="hover:underline">
            Do Not Sell My Personal Information
          </a>
        </div>
      </footer>
    </div>
  );
}
