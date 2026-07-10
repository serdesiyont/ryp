import type { ReactNode } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

/**
 * Shared shell for legal/policy pages (Terms, Privacy, Guidelines).
 */
export default function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navigation />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <h1 className="text-3xl font-black uppercase tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-gray-400">Last updated: {updated}</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-gray-700 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-black [&_h2]:tracking-tight [&_h2]:mb-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_a]:underline [&_a]:font-medium">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
}
