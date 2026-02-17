"use client";

import Navigation from "@/components/Navigation";
import { useAuth } from "@/components/auth/auth-provider";
import HomeTemplate from "@/components/home/HomeTemplate";

export default function Home() {
  const { session } = useAuth();
  const isLoggedIn = !!session;

  return (
    <div className="min-h-screen bg-linear-to-b from-[#fefce9] to-[#fffefd] font-sans text-black antialiased">
      {/* Navigation */}
      <Navigation isHomepage={true} />

      <HomeTemplate isLoggedIn={isLoggedIn} />
    </div>
  );
}
