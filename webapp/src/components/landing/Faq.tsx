import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionHeading } from "./SectionHeading";

const FAQS = [
  {
    q: "Which financial solutions does Lokansh Wealth offer?",
    a: "We cover every major financing need in India — personal, home, business, new and used car, two-wheeler, education, gold, and loan against property. Whatever your goal, we can help you fund it.",
  },
  {
    q: "What documents will I need to apply?",
    a: "For most loans you only need your PAN, Aadhaar, a recent bank statement and proof of income. Secured products like home loans may also need property papers, which your relationship manager will guide you through.",
  },
  {
    q: "How quickly can my loan be approved?",
    a: "Eligibility is checked instantly, and most unsecured loans are approved within 24 hours. Funds are typically disbursed in 1–3 working days once your documents are verified.",
  },
  {
    q: "Does an eligibility check impact my credit score?",
    a: "No. We run a soft enquiry to show your pre-approved offers, which has zero impact on your credit score. A hard enquiry only happens once you choose to proceed with a specific lender.",
  },
  {
    q: "Are there any hidden fees or charges?",
    a: "Never. We show you the interest rate, processing fee and EMI upfront — fees and all. Most of our loans also carry no prepayment or foreclosure penalty.",
  },
  {
    q: "Can I compare multiple lenders with one application?",
    a: "Yes. A single application matches you with offers from our 40+ trusted lending partners, so you can compare rates and terms side by side and pick the one that fits you best.",
  },
  {
    q: "Will I receive dedicated support throughout the process?",
    a: "Absolutely. A real relationship manager — not a chatbot — stays with you from your first question all the way to disbursal, so you always have someone in your corner.",
  },
  {
    q: "Is my personal information secure?",
    a: "Yes. Your data is encrypted in transit and at rest, shared only with the lenders you choose, and never sold. We follow strict, bank-grade security standards.",
  },
  {
    q: "Can self-employed professionals apply?",
    a: "Of course. We work with salaried employees, self-employed professionals and business owners alike — with loan options and documentation tailored to your income profile.",
  },
  {
    q: "Can the entire process be completed online?",
    a: "Yes. From eligibility check and application to document upload and approval, everything can be done online in minutes — no branch visits required.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="relative py-8 sm:py-10">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-[0.9fr_1.1fr]">
        <SectionHeading
          eyebrow="Questions answered"
          title={
            <>
              Frequently asked <span className="text-gradient-gold">questions</span>
            </>
          }
          subtitle="Everything you need to know before you borrow. Still curious? Our team is one call away."
        />

        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-border">
              <AccordionTrigger className="text-left font-display text-base font-semibold text-foreground hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
