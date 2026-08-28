import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLoanApplication } from "./application/LoanApplicationContext";

const PERKS = [
  "Free eligibility check",
  "No impact on credit score",
  "Approval in as little as 24 hours",
  "Dedicated relationship manager",
];

export function ApplyForm() {
  const { open } = useLoanApplication();

  return (
    <section id="apply" className="relative py-8 sm:py-10">
      <div className="mx-auto max-w-6xl px-5">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-primary px-8 py-10 text-primary-foreground sm:px-14">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-accent/15 blur-3xl" />

          <div className="relative grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">
                Get started
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                One Application. Multiple Trusted Offers.
              </h2>
              <p className="mt-4 max-w-md leading-relaxed text-primary-foreground/75">
                Share a few details, upload your PAN and Aadhaar, and we&apos;ll match you with
                the best offer — usually within minutes.
              </p>

              <Button
                size="lg"
                className="mt-8 rounded-full bg-accent px-8 text-base text-accent-foreground hover:bg-accent/90"
                onClick={() => open()}
              >
                Start your application
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2">
              {PERKS.map((p) => (
                <li
                  key={p}
                  className="flex items-start gap-3 rounded-2xl bg-primary-foreground/10 p-4 text-sm font-medium"
                >
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-accent" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
