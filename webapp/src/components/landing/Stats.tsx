const STATS = [
  { value: "₹4,200 Cr+", label: "Loans disbursed" },
  { value: "5 Lakh+", label: "Happy customers" },
  { value: "50+", label: "Lending partners" },
  { value: "24 hrs", label: "Avg. approval time" },
];

export function Stats() {
  return (
    <section className="relative py-6">
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-border bg-border lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="bg-card px-6 py-9 text-center">
              <p className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {s.value}
              </p>
              <p className="mt-2 text-sm font-medium text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
