import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/common/NumberInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalcField } from "./CalcField";
import { formatCompactINR, formatINR, maxPrincipal } from "./utils";
import { useLoanApplication } from "@/components/landing/application/LoanApplicationContext";

const OBLIGATION_TYPES = [
  "Personal Loan",
  "Credit Card",
  "Home Loan",
  "Car / Auto / Bike Loan",
  "Gold Loan",
  "Education Loan",
  "Other",
];

interface Obligation {
  id: number;
  type: string;
  emi: number;
}

export function EligibilityTool() {
  const { open } = useLoanApplication();
  const [income, setIncome] = useState(75000);
  const [rate, setRate] = useState(9.5);
  const [years, setYears] = useState(15);
  const [foir, setFoir] = useState(50); // % of income lenders allow towards all EMIs
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [nextId, setNextId] = useState(1);

  function addObligation() {
    setObligations((o) => [...o, { id: nextId, type: OBLIGATION_TYPES[0], emi: 0 }]);
    setNextId((n) => n + 1);
  }
  function updateObligation(id: number, patch: Partial<Obligation>) {
    setObligations((o) => o.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }
  function removeObligation(id: number) {
    setObligations((o) => o.filter((x) => x.id !== id));
  }

  const { totalExisting, maxEmi, availableEmi, eligible } = useMemo(() => {
    const existing = obligations.reduce((s, o) => s + (o.emi || 0), 0);
    const maxAllowed = (income * foir) / 100;
    const available = Math.max(0, maxAllowed - existing);
    return {
      totalExisting: existing,
      maxEmi: maxAllowed,
      availableEmi: available,
      eligible: maxPrincipal(available, rate, years * 12),
    };
  }, [obligations, income, foir, rate, years]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      {/* Inputs */}
      <div className="space-y-6 rounded-3xl border border-border bg-card p-6 sm:p-8">
        <CalcField
          label="Net monthly salary"
          prefix="₹"
          value={income}
          min={15000}
          max={1000000}
          step={5000}
          onChange={setIncome}
          minLabel="₹15K"
          maxLabel="₹10L"
        />
        <CalcField
          label="Interest rate"
          suffix="%"
          value={rate}
          min={5}
          max={24}
          step={0.1}
          decimals={1}
          onChange={setRate}
          minLabel="5%"
          maxLabel="24%"
        />
        <CalcField
          label="Loan tenure"
          suffix="yr"
          value={years}
          min={1}
          max={30}
          step={1}
          onChange={setYears}
          minLabel="1 yr"
          maxLabel="30 yrs"
        />
        <CalcField
          label="EMI affordability (FOIR)"
          suffix="%"
          value={foir}
          min={30}
          max={65}
          step={1}
          onChange={setFoir}
          minLabel="30%"
          maxLabel="65%"
        />

        {/* Existing obligations */}
        <div className="rounded-2xl border border-border bg-secondary/30 p-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold text-foreground">
              Existing EMI obligations
            </Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 rounded-full px-3"
              onClick={addObligation}
            >
              <Plus className="mr-1 h-3.5 w-3.5" /> Add
            </Button>
          </div>

          {obligations.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              No existing loans added. Add any running EMIs for an accurate estimate.
            </p>
          ) : (
            <div className="mt-3 space-y-2.5">
              {obligations.map((o) => (
                <div key={o.id} className="flex items-center gap-2">
                  <Select
                    value={o.type}
                    onValueChange={(v) => updateObligation(o.id, { type: v })}
                  >
                    <SelectTrigger className="h-9 flex-1 bg-card">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OBLIGATION_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <NumberInput
                    value={o.emi}
                    onChange={(v) => updateObligation(o.id, { emi: v })}
                    min={0}
                    grouped
                    prefix="₹"
                    ariaLabel={`${o.type} monthly EMI`}
                    className="w-32 shrink-0 border-input bg-card"
                    inputClassName="h-8 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeObligation(o.id)}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Result */}
      <div className="flex flex-col justify-between rounded-3xl bg-primary p-6 text-primary-foreground sm:p-8">
        <div>
          <p className="text-sm font-semibold text-primary-foreground/70">
            You are eligible for up to
          </p>
          <p className="mt-1 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            {formatCompactINR(eligible)}
          </p>
          <p className="mt-1 text-sm text-primary-foreground/70">
            {formatINR(eligible)}
          </p>

          <div className="mt-7 space-y-3 rounded-2xl bg-primary-foreground/10 p-5">
            <Row label="Max EMI you can pay" value={formatINR(maxEmi)} />
            <Row label="Total existing EMIs" value={formatINR(totalExisting)} />
            <div className="flex justify-between border-t border-primary-foreground/15 pt-3">
              <span className="text-sm text-primary-foreground/70">
                Available EMI capacity
              </span>
              <span className="font-display text-lg font-semibold text-accent">
                {formatINR(availableEmi)}
              </span>
            </div>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-primary-foreground/60">
            Estimate based on a FOIR of {foir}%. Final eligibility depends on credit
            score, employer and lender policy.
          </p>
        </div>

        <Button
          className="mt-7 rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
          onClick={() => open()}
        >
          Apply for this loan
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-primary-foreground/70">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
