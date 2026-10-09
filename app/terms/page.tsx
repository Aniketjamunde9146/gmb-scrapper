import type { Metadata } from "next";
import { LegalPage, contactLine } from "../../components/legal/legal-page";
import { site } from "../../lib/site";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: `The rules for using ${site.name}.`,
  alternates: { canonical: "/terms" },
};

export default function Terms() {
  return (
    <LegalPage title="Terms of Use" intro={`By creating an account or using ${site.name} you agree to these terms. If you do not agree, please do not use the service.`}>
      <section>
        <h2>The service</h2>
        <p>{site.name} lets you search publicly listed businesses by type and city, save them, and export them to CSV. Data comes from third-party map sources and is provided as listed, without a guarantee that it is complete, current or accurate.</p>
      </section>
      <section>
        <h2>Acceptable use</h2>
        <ul>
          <li>Use leads only for lawful business outreach.</li>
          <li>Follow the laws that apply to you, such as telemarketing, Do-Not-Disturb, anti-spam and data-protection rules (for example TRAI rules and the DPDP Act in India).</li>
          <li>Do not harass, mislead or spam anyone, and honour any request to stop contacting them.</li>
          <li>Do not resell the service, bulk-copy it to build a competing database, or use bots to overload it.</li>
          <li>Do not attempt to break, probe or bypass the security or rate limits of the service.</li>
        </ul>
      </section>
      <section>
        <h2>Your account</h2>
        <p>Keep your password private. You are responsible for activity under your account. You can stop using the service and ask us to delete your account at any time.</p>
      </section>
      <section>
        <h2>Third-party data</h2>
        <p>Results are subject to the terms of their sources, including the Google Maps Platform Terms of Service and the Open Database License for OpenStreetMap, which requires attribution (&copy; OpenStreetMap contributors).</p>
      </section>
      <section>
        <h2>Availability and changes</h2>
        <p>We work to keep the service running but do not promise it will always be available or error-free. We may change or stop features, and we may suspend accounts that break these terms.</p>
      </section>
      <section>
        <h2>Liability</h2>
        <p>To the extent the law allows, {site.name} is provided &ldquo;as is&rdquo; and we are not liable for indirect or consequential loss, including lost sales or the result of contacting a lead. Nothing in these terms limits liability that cannot be limited by law.</p>
      </section>
      <section>
        <h2>Governing law and contact</h2>
        <p>These terms are governed by the laws of India. Questions? Contact {contactLine}.</p>
      </section>
    </LegalPage>
  );
}
