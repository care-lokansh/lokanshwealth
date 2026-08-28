import { ArrowUpRight } from "lucide-react";
import { LOAN_TYPES, type LoanType } from "./loans";
import { SectionHeading } from "./SectionHeading";
import { useLoanApplication } from "./application/LoanApplicationContext";
import { useProducts, formatStartRate } from "@/hooks/useProducts";

export function LoanTypes() {
  const { open } = useLoanApplication();
  const { byCode } = useProducts();
  return (
    <section id="loans" className="relative py-8 sm:py-10">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="Every loan, one roof"
          eyebrowClassName="text-xl sm:text-2xl tracking-[0.1em]"
          title={
            <>
              Pick the loan that <span className="text-gradient-gold">fulfills your dreams.</span>
            </>
          }
          subtitle="Whatever the goal — a home, a car, a business or a celebration — we have a tailored financing option with competitive rates."
        />

        <div className="mt-8 flex flex-wrap justify-center gap-5">
          {LOAN_TYPES.map((loan, i) => (
            <button
              key={loan.title}
              type="button"
              onClick={() => open(loan.code)}
              className="group relative flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 sm:w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-0.834rem)]"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <LoanIcon loan={loan} />
                </div>
                {loan.tag ? (
                  <span className="rounded-full bg-accent/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-accent-foreground/90">
                    {loan.tag}
                  </span>
                ) : null}
              </div>

              <h3 className="mt-5 font-display text-xl font-semibold text-foreground">
                {loan.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {loan.blurb}
              </p>

              <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Starting at
                  </p>
                  <p className="font-display text-lg font-semibold text-primary">
                    {formatStartRate(byCode[loan.code], loan.rate)}
                  </p>
                </div>
                <span className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-foreground transition-all group-hover:bg-accent group-hover:text-accent-foreground">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function LoanIcon({ loan }: { loan: LoanType }) {
  if (loan.iconImage) {
    return (
      <img
        src={loan.iconImage}
        alt=""
        className="h-7 w-7 object-contain transition group-hover:brightness-0 group-hover:invert"
      />
    );
  }
  const Icon = loan.icon;
  return Icon ? <Icon className="h-6 w-6" strokeWidth={1.8} /> : null;
}
