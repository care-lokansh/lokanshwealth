import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/common/NumberInput";

interface CalcFieldProps {
  label: string;
  /** Text shown inside the value input prefix, e.g. "₹" or "%". */
  prefix?: string;
  suffix?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  minLabel: string;
  maxLabel: string;
  /** Allow typing a value above `max` (slider stays capped, number input is free). */
  allowAboveMax?: boolean;
  /** Decimal places the typed value may have (e.g. 1 for an interest rate). */
  decimals?: number;
}

export function CalcField({
  label,
  prefix,
  suffix,
  value,
  min,
  max,
  step,
  onChange,
  minLabel,
  maxLabel,
  allowAboveMax,
  decimals = 0,
}: CalcFieldProps) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <Label className="text-sm font-semibold text-muted-foreground">{label}</Label>
        <NumberInput
          value={value}
          onChange={onChange}
          min={min}
          max={allowAboveMax ? undefined : max}
          decimals={decimals}
          grouped={prefix === "₹"}
          prefix={prefix}
          suffix={suffix}
          ariaLabel={label}
          className="w-36"
        />
      </div>
      <Slider
        className="mt-4"
        value={[Math.min(max, Math.max(min, value))]}
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
