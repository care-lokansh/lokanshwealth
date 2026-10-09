import { ContentPage } from "@/components/landing/ContentPage";

export default function Privacy() {
  return (
    <ContentPage eyebrow="Legal" title="Privacy policy">
      <p>Last updated: 9 October 2026</p>
      <p>
        Lokansh Wealth (“we”, “us”) is a loan facilitation platform. This policy
        explains how we collect and use personal information when you use{" "}
        <a href="https://www.lokanshwealth.com">www.lokanshwealth.com</a>.
      </p>
      <h2>Information we collect</h2>
      <p>When you apply for a loan or contact us, we may collect:</p>
      <ul>
        <li>Name, age, mobile number, email, address</li>
        <li>PAN, Aadhaar, and documents you upload</li>
        <li>Employment, income, and loan requirement details</li>
        <li>Application tracking and communication history</li>
      </ul>
      <h2>How we use it</h2>
      <p>
        We use this information to process your application, verify identity,
        match you with lending partners, communicate status, and meet legal
        obligations. We do not sell your personal data.
      </p>
      <h2>Sharing</h2>
      <p>
        We share information with lending partners and service providers only as
        needed to assess, process, or service your request, or as required by
        law.
      </p>
      <h2>Security and retention</h2>
      <p>
        We store data on secure systems and keep it only as long as needed for
        the application, partner requirements, and applicable law.
      </p>
      <h2>Your rights</h2>
      <p>
        You may ask to access, correct, or withdraw consent for information we
        hold, subject to legal and contractual limits. Contact{" "}
        <a href="mailto:care@lokanshwealth.in">care@lokanshwealth.in</a> or call{" "}
        <a href="tel:+917053231846">+91 70532 31846</a>.
      </p>
    </ContentPage>
  );
}
