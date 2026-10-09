import { ContentPage } from "@/components/landing/ContentPage";

export default function Blog() {
  return (
    <ContentPage eyebrow="Company" title="Blog">
      <p>
        Guides and updates will appear here. Until then, use the{" "}
        <a href="/calculator">EMI calculator</a>, read the{" "}
        <a href="/#faq">FAQs</a>, or <a href="/apply">apply for a loan</a>.
      </p>
    </ContentPage>
  );
}
