import { ContentPage } from "@/components/landing/ContentPage";

export default function Grievance() {
  return (
    <ContentPage eyebrow="Legal" title="Grievance redressal">
      <p>
        If you have a complaint about our website, an application, or how our
        team handled your case, please contact us. We take every grievance
        seriously.
      </p>
      <h2>How to reach us</h2>
      <ul>
        <li>
          Email: <a href="mailto:care@lokanshwealth.in">care@lokanshwealth.in</a>
        </li>
        <li>
          Phone: <a href="tel:+917053231846">+91 70532 31846</a>
        </li>
        <li>Address: Delhi</li>
      </ul>
      <h2>What to include</h2>
      <p>
        Your full name, mobile number, application reference (ARN) if you have
        one, and a short description of the issue.
      </p>
      <h2>What happens next</h2>
      <p>
        We aim to acknowledge your complaint within 3 working days and share an
        update within 15 working days. Issues that sit with a lender will be
        taken up with that partner.
      </p>
    </ContentPage>
  );
}
