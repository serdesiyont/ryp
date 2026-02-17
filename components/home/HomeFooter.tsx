import Link from "next/link";

export default function HomeFooter() {
  return (
    <footer className="border-t-8 border-black bg-white px-6 pb-8 pt-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-sm bg-black px-2 py-1 text-white">🎓</div>
              <span className="text-lg font-black uppercase tracking-tight">
                Rate Your Professors
              </span>
            </div>
            <p className="max-w-sm leading-relaxed text-neutral-500">
              The definitive platform for academic transparency in Ethiopia.
              Empowering students through shared experiences and data-driven
              insights.
            </p>
          </div>

          <div>
            <h5 className="mb-6 text-xs font-black uppercase tracking-widest">
              Explore
            </h5>
            <ul className="space-y-4 text-sm font-bold">
              <li>
                <Link href="/browse" className="hover:underline">
                  All Universities
                </Link>
              </li>
              <li>
                <Link href="/browse" className="hover:underline">
                  Top Rated Professors
                </Link>
              </li>
              <li>
                <Link href="/browse" className="hover:underline">
                  Department Rankings
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="mb-6 text-xs font-black uppercase tracking-widest">
              Community
            </h5>
            <ul className="space-y-4 text-sm font-bold">
              <li>
                <Link href="#" className="hover:underline">
                  Review Guidelines
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-black/10 pt-8 md:flex-row">
          <p className="text-xs font-bold text-neutral-400">
            © 2026 RYP. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-6 text-xl">
            <span className="cursor-pointer hover:text-neutral-400">↗</span>
            <span className="cursor-pointer hover:text-neutral-400">✉</span>
            <span className="cursor-pointer hover:text-neutral-400">🌐</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
