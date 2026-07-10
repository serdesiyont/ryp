import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy | Rate Your Professors",
  description: "How Rate Your Professors collects, uses, and protects your data.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="July 10, 2026">
      <section>
        <p>
          This Privacy Policy explains what information Rate Your Professors
          (&ldquo;RYP&rdquo;) collects, how we use it, and the choices you have.
          By using the platform you agree to the practices described here.
        </p>
      </section>

      <section>
        <h2>1. Information We Collect</h2>
        <ul>
          <li>
            <strong>Account information</strong> &mdash; your email address and
            any profile details you provide when signing up.
          </li>
          <li>
            <strong>Content you submit</strong> &mdash; ratings, reviews, and
            related data.
          </li>
          <li>
            <strong>Usage data</strong> &mdash; basic analytics such as pages
            visited and device/browser information, collected to improve the
            service.
          </li>
        </ul>
      </section>

      <section>
        <h2>2. How We Use Your Information</h2>
        <ul>
          <li>To operate, maintain, and improve the platform.</li>
          <li>To display your reviews and ratings to other users.</li>
          <li>To authenticate you and secure your account.</li>
          <li>To communicate with you about your account or the service.</li>
        </ul>
      </section>

      <section>
        <h2>3. Public Content</h2>
        <p>
          Reviews and ratings you post are public by design. We do not display
          your email address alongside your reviews, but the content of a review
          may itself identify you if you choose to include identifying details.
        </p>
      </section>

      <section>
        <h2>4. Sharing</h2>
        <p>
          We do not sell your personal information. We may share data with
          service providers who help us operate the platform (for example,
          hosting and analytics), and where required by law.
        </p>
      </section>

      <section>
        <h2>5. Data Retention &amp; Security</h2>
        <p>
          We retain your data for as long as your account is active or as needed
          to provide the service. We use reasonable technical measures to
          protect your information, though no method of transmission or storage
          is completely secure.
        </p>
      </section>

      <section>
        <h2>6. Your Rights</h2>
        <p>
          You may access, update, or delete your account and associated content
          at any time from your account settings, or by contacting us. Deleting
          your account removes your reviews from public view.
        </p>
      </section>

      <section>
        <h2>7. Contact</h2>
        <p>
          For privacy questions or requests, email{" "}
          <a href="mailto:serdesiyon@gmail.com">
            serdesiyon@gmail.com
          </a>
          .
        </p>
      </section>
    </LegalPage>
  );
}
