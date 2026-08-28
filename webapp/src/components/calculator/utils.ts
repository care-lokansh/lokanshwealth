export function formatINR(n: number): string {
  if (!isFinite(n)) return "₹0";
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

/** Compact Indian format, e.g. 5185000 -> "51.85 L", 12000000 -> "1.20 Cr" */
export function formatCompactINR(n: number): string {
  if (!isFinite(n) || n <= 0) return "₹0";
  if (n >= 1_00_00_000) return "₹" + (n / 1_00_00_000).toFixed(2) + " Cr";
  if (n >= 1_00_000) return "₹" + (n / 1_00_000).toFixed(2) + " L";
  return formatINR(n);
}

/** Monthly EMI for principal p, annual rate %, term in months. */
export function calcEmi(p: number, annualRate: number, months: number): number {
  if (months <= 0) return 0;
  const r = annualRate / 12 / 100;
  if (r === 0) return p / months;
  return (p * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

/** Max principal affordable for a given monthly EMI, annual rate %, term in months. */
export function maxPrincipal(emi: number, annualRate: number, months: number): number {
  if (months <= 0 || emi <= 0) return 0;
  const r = annualRate / 12 / 100;
  if (r === 0) return emi * months;
  return (emi * (Math.pow(1 + r, months) - 1)) / (r * Math.pow(1 + r, months));
}

export interface MonthRow {
  /** Month number within its year (1–12). */
  month: number;
  principalPaid: number;
  interestPaid: number;
  balance: number;
}

export interface YearRow {
  year: number;
  principalPaid: number;
  interestPaid: number;
  balance: number;
  /** Month-by-month breakdown for this year. */
  months: MonthRow[];
}

/** Year-by-year amortization schedule, each year holding its monthly rows. */
export function amortization(
  principal: number,
  annualRate: number,
  months: number,
): YearRow[] {
  const r = annualRate / 12 / 100;
  const emi = calcEmi(principal, annualRate, months);
  let balance = principal;
  const rows: YearRow[] = [];
  let yPrincipal = 0;
  let yInterest = 0;
  let monthRows: MonthRow[] = [];

  for (let m = 1; m <= months; m++) {
    const interest = balance * r;
    const principalComp = Math.min(emi - interest, balance);
    balance = Math.max(0, balance - principalComp);
    yPrincipal += principalComp;
    yInterest += interest;
    monthRows.push({
      month: ((m - 1) % 12) + 1,
      principalPaid: principalComp,
      interestPaid: interest,
      balance,
    });

    if (m % 12 === 0 || m === months) {
      rows.push({
        year: Math.ceil(m / 12),
        principalPaid: yPrincipal,
        interestPaid: yInterest,
        balance,
        months: monthRows,
      });
      yPrincipal = 0;
      yInterest = 0;
      monthRows = [];
    }
  }
  return rows;
}
