import { Lexend } from "next/font/google";
import { Search } from "lucide-react";

const lexend = Lexend({ subsets: ["latin"], weight: ["900"] });

export default function HeroSection() {
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

        <div className="relative mx-auto max-w-2xl">
          <div className="mb-6 flex justify-center">
            <div className="inline-flex rounded-full border border-black/10 bg-emerald-50 p-1">
              <button className="rounded-full bg-black px-6 py-2 text-sm font-bold text-white">
                Professors
              </button>
              <button className="px-6 py-2 text-sm font-bold text-neutral-500 hover:text-black">
                Universities
              </button>
            </div>
          </div>

          <div className="group flex items-center rounded-full border-2 border-black bg-white p-1 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Search
              className="ml-4 h-5 w-5 text-neutral-400"
              aria-hidden="true"
            />
            <input
              className="w-full border-none px-4 py-4 text-lg placeholder:text-neutral-300 focus:outline-none"
              placeholder="Search for a Professor or University"
              type="text"
            />
            <button className="ml-2 mr-1 rounded-full bg-black px-8 py-4 font-bold text-white transition-colors hover:bg-neutral-800">
              Search
            </button>
          </div>

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
