import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Review Guidelines | Rate Your Professors",
  description: "Rules for writing helpful, fair, and honest reviews on RYP.",
  alternates: { canonical: "/guidelines" },
};

export default function GuidelinesPage() {
  return (
    <LegalPage title="Review Guidelines" updated="July 10, 2026">
      <section>
        <p>
          Rate Your Professors works because students share honest, useful
          experiences. These guidelines keep reviews fair and helpful for
          everyone. Reviews that break them may be removed.
        </p>
      </section>

      <section>
        <h2>Do</h2>
        <ul>
          <li>Base your review on your own genuine experience with the class.</li>
          <li>Comment on teaching: clarity, workload, grading, and helpfulness.</li>
          <li>Be specific and constructive so other students can learn from it.</li>
          <li>Keep it respectful, even when the feedback is negative.</li>
        </ul>
      </section>

      <section>
        <h2>Don&rsquo;t</h2>
        <ul>
          <li>
            Post personal attacks, harassment, or comments about an
            instructor&rsquo;s appearance, religion, ethnicity, gender, or
            personal life.
          </li>
          <li>Share private information about an instructor or any student.</li>
          <li>
            Make false claims, or submit reviews for classes you never took.
          </li>
          <li>Post spam, advertising, or duplicate reviews.</li>
          <li>Use hate speech, threats, or profanity directed at a person.</li>
        </ul>
      </section>

      <section>
        <h2>Moderation</h2>
        <p>
          Reviews may be moderated to enforce these guidelines and our{" "}
          <a href="/terms">Terms of Service</a>. We may remove content that
          violates them and suspend repeat offenders. If you believe a review is
          unfair or inaccurate, contact us and we will review it.
        </p>
      </section>

      <section>
        <h2>Report a Review</h2>
        <p>
          To flag content that breaks these guidelines, email{" "}
          <a href="mailto:serdesiyon@gmail.com">
            serdesiyon@gmail.com
          </a>{" "}
          with a link to the review.
        </p>
      </section>
    </LegalPage>
  );
}
