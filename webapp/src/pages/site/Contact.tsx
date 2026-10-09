import { ContentPage } from "@/components/landing/ContentPage";

export default function Contact() {
  return (
    <ContentPage eyebrow="Company" title="Contact">
      <p>We are based in Delhi and available by phone and email.</p>
      <ul>
        <li>
          Phone: <a href="tel:+917053231846">+91 70532 31846</a>
        </li>
        <li>
          Email: <a href="mailto:care@lokanshwealth.in">care@lokanshwealth.in</a>
        </li>
        <li>Office: Delhi</li>
      </ul>
      <p>
        For an existing application, use{" "}
        <a href="/track">Track your application</a> with your mobile number or
        ARN.
      </p>
    </ContentPage>
  );
}
