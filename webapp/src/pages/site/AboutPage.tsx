import { ContentPage } from "@/components/landing/ContentPage";

export default function AboutPage() {
  return (
    <ContentPage eyebrow="Company" title="About us">
      <p>
        Lokansh Wealth was founded to make borrowing clearer and easier —
        without hiding fees or sending you to ten different counters.
      </p>
      <p>
        We bring personal, home, business, education, gold, vehicle, and other
        loans available in India onto one platform, with a relationship manager
        who stays with you from application to disbursal.
      </p>
      <p>
        We are a loan facilitation platform. Sanction and disbursement are
        always subject to lender approval.
      </p>
      <p>
        Talk to us: <a href="tel:+917053231846">+91 70532 31846</a> or{" "}
        <a href="mailto:care@lokanshwealth.in">care@lokanshwealth.in</a>.
      </p>
    </ContentPage>
  );
}
