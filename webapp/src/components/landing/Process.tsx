import { ClipboardList, SearchCheck, BadgeIndianRupee } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

const STEPS = [
  {
    icon: ClipboardList,
    step: "01",
    title: "Apply online",
    body: "Fill a 2-minute form with your basic details and the loan you need.",
  },
  {
    icon: SearchCheck,
    step: "02",
    title: "Get matched & approved",
    body: "We instantly match you with the best lender and run a soft eligibility check.",
  },
  {
    icon: BadgeIndianRupee,
    step: "03",
    title: "Receive funds",
    body: "Accept the offer and money is disbursed straight to your bank account.",
  },
];

export function Process() {
  return (
    <section id="process" className="relative overflow-hidden py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-6xl px-5">
        <SectionHeading
          center
          eyebrow="Simple process"
          title={
            <>
              Funded in <span className="text-gradient-gold">three easy steps</span>
            </>
          }
        />

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.step} className="relative">
              <div className="h-full rounded-2xl border border-border bg-card p-7">
                <div className="flex items-center justify-between">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground">
                    <s.icon className="h-5 w-5" strokeWidth={1.8} />
                  </div>
                  <span className="font-display text-4xl font-semibold text-border">{s.step}</span>
                </div>
                <h3 className="mt-6 font-display text-xl font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
              {i < STEPS.length - 1 && (
                <div className="absolute -right-3 top-1/2 hidden h-px w-6 bg-border md:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
