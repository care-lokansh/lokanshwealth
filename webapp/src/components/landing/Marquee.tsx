import { LOAN_TYPES, type LoanType } from "./loans";

export function Marquee() {
  const row = [...LOAN_TYPES, ...LOAN_TYPES];
  return (
    <div className="overflow-hidden border-y border-border bg-primary py-4">
      <div className="flex w-max animate-marquee items-center gap-10">
        {row.map((loan, i) => (
          <div key={i} className="flex items-center gap-10">
            <span className="flex items-center gap-3">
              <Icon loan={loan} />
              <span className="font-display text-base font-medium text-primary-foreground/90 whitespace-nowrap">
                {loan.title}
              </span>
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          </div>
        ))}
      </div>
    </div>
  );
}

function Icon({ loan }: { loan: LoanType }) {
  if (loan.iconImage) {
    // Black silhouettes inverted to white so they read on the blue strip.
    return (
      <img
        src={loan.iconImage}
        alt=""
        className="h-6 w-6 shrink-0 object-contain brightness-0 invert"
      />
    );
  }
  const Lucide = loan.icon;
  return Lucide ? <Lucide className="h-6 w-6 shrink-0 text-primary-foreground/90" strokeWidth={1.8} /> : null;
}
