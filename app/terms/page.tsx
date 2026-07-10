import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service | Rate Your Professors",
  description: "The terms governing your use of Rate Your Professors.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="July 10, 2026">
      <section>
        <p>
          Welcome to Rate Your Professors (&ldquo;RYP&rdquo;, &ldquo;we&rdquo;,
          &ldquo;us&rdquo;). By accessing or using our website you agree to
          these Terms of Service. If you do not agree, please do not use the
          platform.
        </p>
      </section>

      <section>
        <h2>1. Eligibility</h2>
        <p>
          You must be a current or former student, or otherwise have a
          legitimate connection to the institutions and instructors discussed
          on RYP. You are responsible for keeping your account credentials
          secure and for all activity under your account.
        </p>
      </section>

      <section>
        <h2>2. Your Content</h2>
        <p>
          You retain ownership of the ratings and reviews you submit, but you
          grant RYP a non-exclusive, royalty-free license to display,
          distribute, and moderate that content on the platform. You are solely
          responsible for what you post and confirm it is truthful and based on
          your genuine experience.
        </p>
      </section>

      <section>
        <h2>3. Acceptable Use</h2>
        <p>
          All reviews must follow our{" "}
          <a href="/guidelines">Review Guidelines</a>. You agree not to post
          content that is defamatory, harassing, discriminatory, false, or that
          reveals private information about any individual. We may remove
          content and suspend accounts that violate these terms.
        </p>
      </section>

      <section>
        <h2>4. Moderation &amp; Removal</h2>
        <p>
          We reserve the right, but are not obligated, to review, edit, or
          remove any content at our discretion. Instructors and institutions may
          request review of content they believe violates these terms or the
          law.
        </p>
      </section>

      <section>
        <h2>5. Disclaimer</h2>
        <p>
          Reviews reflect the personal opinions of individual users and not
          those of RYP. The platform is provided &ldquo;as is&rdquo; without
          warranties of any kind. We do not guarantee the accuracy of
          user-submitted content.
        </p>
      </section>

      <section>
        <h2>6. Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by law, RYP is not liable for any
          indirect or consequential damages arising from your use of the
          platform or reliance on any content posted here.
        </p>
      </section>

      <section>
        <h2>7. Changes</h2>
        <p>
          We may update these terms from time to time. Continued use of the
          platform after changes take effect constitutes acceptance of the
          revised terms.
        </p>
      </section>

      <section>
        <h2>8. Contact</h2>
        <p>
          Questions about these terms? Email us at{" "}
          <a href="mailto:serdesiyon@gmail.com">
            serdesiyon@gmail.com
          </a>
          .
        </p>
      </section>
    </LegalPage>
  );
}
