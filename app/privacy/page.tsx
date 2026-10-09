import type { Metadata } from "next";
import { LegalPage, contactLine } from "../../components/legal/legal-page";
import { site } from "../../lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${site.name} collects, uses and protects your data.`,
  alternates: { canonical: "/privacy" },
};

export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy" intro={`This policy explains what ${site.name} collects, why, who it is shared with, and the choices you have. We keep it short and plain on purpose.`}>
      <section>
        <h2>What we collect</h2>
        <ul>
          <li>Account details: your name, email address and password. Passwords are stored only as a secure hash by our authentication provider; we cannot read them.</li>
          <li>Your activity: the business types and cities you search, and the leads you save with their status.</li>
          <li>Your consent record: the time you accepted our Terms and Privacy Policy.</li>
          <li>Basic technical data such as IP address and browser type, which our hosting provider processes to deliver the site and prevent abuse.</li>
        </ul>
      </section>
      <section>
        <h2>How we use it</h2>
        <ul>
          <li>To run your account, show your dashboard and keep your saved leads.</li>
          <li>To protect the service from abuse, such as automated overuse of map services.</li>
          <li>To contact you about your account when needed.</li>
        </ul>
        <p>We do not sell your personal data and we do not show advertising.</p>
      </section>
      <section>
        <h2>Who processes your data</h2>
        <ul>
          <li>Supabase: authentication and database storage.</li>
          <li>Our hosting provider: serves the website and API.</li>
          <li>Google Maps Platform and OpenStreetMap services (Nominatim, Overpass): receive the business type and city of your search to return results. They do not receive your name or email from us.</li>
        </ul>
      </section>
      <section>
        <h2>Cookies and local storage</h2>
        <ul>
          <li>Essential: a login session cookie, your light or dark theme, and your cookie choice. The site cannot work without these.</li>
          <li>Optional: none are used today. If we add analytics later, they will stay off until you choose &ldquo;Accept all&rdquo;.</li>
        </ul>
      </section>
      <section>
        <h2>Business information in search results</h2>
        <p>Leads are business listings published on public maps. They can include a business phone number or email, which may belong to a sole trader. Use them only for lawful business outreach, as set out in our Terms.</p>
      </section>
      <section>
        <h2>How long we keep data</h2>
        <p>We keep your account and activity until you delete your account. You can remove any saved lead at any time from your dashboard.</p>
      </section>
      <section>
        <h2>Your rights</h2>
        <p>You can ask to access, correct or delete your personal data, or withdraw consent, at any time. Contact us at {contactLine} and we will respond within a reasonable time, and within any period required by the law that applies to you, including India&apos;s Digital Personal Data Protection Act, 2023.</p>
      </section>
      <section>
        <h2>Children</h2>
        <p>{site.name} is for businesses and adults. It is not directed at children under 18.</p>
      </section>
      <section>
        <h2>Changes</h2>
        <p>If we change this policy in a meaningful way we will update the date above and, where required, ask for your consent again.</p>
      </section>
    </LegalPage>
  );
}
