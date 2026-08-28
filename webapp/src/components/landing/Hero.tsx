import { ArrowRight, ShieldCheck, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLoanApplication } from "./application/LoanApplicationContext";
import { HeroCarousel } from "./HeroCarousel";

const TRUST = [
  { icon: Zap, label: "Approval in 24 hrs" },
  { icon: ShieldCheck, label: "RBI-aligned lending" },
  { icon: Star, label: "Rated 4.9 / 5" },
];

export function Hero() {
  const { open } = useLoanApplication();
  return (
    <section
      id="top"
      className="relative overflow-hidden pt-24 pb-8 sm:pt-28 sm:pb-10"
    >
      {/* atmosphere */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-24 top-40 h-80 w-80 rounded-full bg-accent/15 blur-3xl" />
        <div className="grain absolute inset-0 opacity-[0.5]" />
      </div>

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <h1
            className="mt-6 animate-fade-up font-display text-[2.7rem] font-semibold leading-[1.04] tracking-tight text-foreground sm:text-6xl"
            style={{ animationDelay: "80ms" }}
          >
            Financial solutions,
            <br />
            <span className="text-gradient-gold">endless possibilities.</span>{" "}
            <span className="ml-1 inline-flex translate-y-[-6px] items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 align-middle text-xs font-bold uppercase tracking-wide text-accent-foreground">
              <Zap className="h-3 w-3 text-accent" />
              Effortless try
            </span>
          </h1>

          <p
            className="mt-6 max-w-md animate-fade-up text-lg leading-relaxed text-muted-foreground"
            style={{ animationDelay: "160ms" }}
          >
            From personal and home loans to business and used-car financing,
            Lokansh Wealth simplifies borrowing with the best rates and expert
            guidance.
          </p>

          <div
            className="mt-8 flex animate-fade-up flex-wrap items-center gap-3"
            style={{ animationDelay: "240ms" }}
          >
            <Button
              size="lg"
              className="group rounded-full px-7 text-base"
              onClick={() => open()}
            >
              Apply Now
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-foreground/20 bg-transparent px-7 text-base hover:bg-secondary"
            >
              <a href="/calculator">Check your EMI</a>
            </Button>
          </div>

          <div
            className="mt-10 flex animate-fade-up flex-wrap gap-x-7 gap-y-3"
            style={{ animationDelay: "320ms" }}
          >
            {TRUST.map((t) => (
              <div key={t.label} className="flex items-center gap-2">
                <t.icon className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">{t.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* promotional carousel */}
        <div
          className="relative animate-fade-up"
          style={{ animationDelay: "400ms" }}
        >
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-primary/15 to-accent/15 blur-2xl" />
          <div className="relative">
            <HeroCarousel />
          </div>
        </div>
      </div>
    </section>
  );
}
