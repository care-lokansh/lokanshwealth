import { ContentPage } from "@/components/landing/ContentPage";

export default function FairPractice() {
  return (
    <ContentPage eyebrow="Legal" title="Fair practice code">
      <p>
        We follow fair, transparent dealing with every applicant. This code
        guides how our team and partners should treat you.
      </p>
      <h2>Transparency</h2>
      <p>
        Indicative rates, fees, and typical processing times are shown before
        you apply. Sanctioned terms, if any, come from the lender in writing.
      </p>
      <h2>Non-discrimination</h2>
      <p>
        Applications are assessed on eligibility and credit norms. We do not
        discriminate on religion, caste, gender, or similar grounds.
      </p>
      <h2>Privacy and dignity</h2>
      <p>
        Personal and financial information is used only for the stated purpose.
        Recovery, if ever involved, is handled by the lender under applicable
        rules — not by harassment.
      </p>
      <h2>Complaints</h2>
      <p>
        If something feels unfair, write to us through the{" "}
        <a href="/grievance">grievance</a> page. We aim to acknowledge promptly
        and resolve in a reasonable time.
      </p>
    </ContentPage>
  );
}
