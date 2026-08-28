import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "./SectionHeading";
import { useLoanApplication } from "./application/LoanApplicationContext";
import { NumberInput } from "@/components/common/NumberInput";
import { MIN_LOAN_AMOUNT } from "@/lib/lms";

function formatINR(n: number) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

export function EmiCalculator() {
  const { open } = useLoanApplication();
  const [amount, setAmount] = useState(1000000);
  const [rate, setRate] = useState(9.5);
  const [years, setYears] = useState(15);

  const { emi, total, interest } = useMemo(() => {
    const p = amount;
    const r = rate / 12 / 100;
    const n = years * 12;
    const emiVal = r === 0 ? p / n : (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalVal = emiVal * n;
    return { emi: emiVal, total: totalVal, interest: totalVal - p };
  }, [amount, rate, years]);

  const principalPct = (amount / total) * 100;

  return (
    <section id="calculator" className="relative py-8 sm:py-10">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          center
          eyebrow="Your Goals, Backed by Expert Guidance."
          title={
            <>
              Personalize Your <span className="text-gradient-gold">EMI Plan</span>
            </>
          }
          subtitle="Get a clear picture of your monthly obligations with an effortless, no-registration EMI calculation experience."
        />

        <div className="mt-6 flex justify-center">
          <a
            href="/calculator"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            Open full calculator + eligibility check
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="mt-14 grid items-stretch gap-6 rounded-3xl border border-border bg-card p-6 sm:p-9 lg:grid-cols-[1.2fr_0.8fr]">
          {/* controls */}
          <div className="flex flex-col justify-center gap-9">
            <Control
              label="Loan amount"
              prefix="₹"
              min={MIN_LOAN_AMOUNT}
              max={20000000}
              step={1000}
              current={amount}
              onChange={setAmount}
              minLabel="₹1K"
              maxLabel="₹2Cr"
            />
            <Control
              label="Interest rate"
              suffix="% p.a."
              decimals={1}
              min={6}
              max={24}
              step={0.1}
              current={rate}
              onChange={setRate}
              minLabel="6%"
              maxLabel="24%"
            />
            <Control
              label="Tenure"
              suffix={years === 1 ? "year" : "years"}
              min={1}
              max={30}
              step={1}
              current={years}
              onChange={setYears}
              minLabel="1 yr"
              maxLabel="30 yrs"
            />
          </div>

          {/* result */}
          <div className="flex flex-col justify-between rounded-2xl bg-primary p-7 text-primary-foreground">
            <div>
              <p className="text-sm font-semibold text-primary-foreground/70">Your monthly EMI</p>
              <p className="mt-1 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                {formatINR(emi)}
              </p>

              <div className="mt-7 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-primary-foreground/70">Principal</span>
                  <span className="font-semibold">{formatINR(amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-primary-foreground/70">Total interest</span>
                  <span className="font-semibold text-accent">{formatINR(interest)}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-primary-foreground/15">
                  <div
                    className="h-full rounded-full bg-accent transition-all duration-300"
                    style={{ width: `${principalPct}%` }}
                  />
                </div>
                <div className="flex justify-between border-t border-primary-foreground/15 pt-3 text-sm">
                  <span className="text-primary-foreground/70">Total payable</span>
                  <span className="font-display text-lg font-semibold">{formatINR(total)}</span>
                </div>
              </div>
            </div>

            <Button
              className="mt-7 rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={() => open()}
            >
              Apply for this loan
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

interface ControlProps {
  label: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  min: number;
  max: number;
  step: number;
  current: number;
  onChange: (v: number) => void;
  minLabel: string;
  maxLabel: string;
}

function Control({
  label, prefix, suffix, decimals, min, max, step, current, onChange, minLabel, maxLabel,
}: ControlProps) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-muted-foreground">{label}</span>
        <NumberInput
          value={current}
          onChange={onChange}
          min={min}
          max={max}
          decimals={decimals}
          grouped={prefix === "₹"}
          prefix={prefix}
          suffix={suffix}
          ariaLabel={label}
          className="w-40"
          inputClassName="text-lg"
        />
      </div>
      <Slider
        className="mt-4"
        value={[current]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0])}
      />
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}
