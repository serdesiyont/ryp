import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CtaSection({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <section className="relative overflow-hidden bg-black px-6 py-24 text-white">
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <h2 className="mb-6 text-4xl font-black italic underline decoration-white/30 decoration-4 underline-offset-8 md:text-5xl">
          Make your voice heard.
        </h2>
        <p className="mb-10 text-xl text-neutral-400">
          Help fellow students by rating your professors and university today.
        </p>
        <Link href={isLoggedIn ? "/rate" : "/signup"}>
          <Button className="rounded-sm bg-white px-12 py-5 text-lg font-black text-black hover:scale-105 hover:bg-white">
            {isLoggedIn ? "WRITE A REVIEW" : "GET STARTED"}
          </Button>
        </Link>
      </div>
    </section>
  );
}
