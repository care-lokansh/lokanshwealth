import { useState } from "react";
import { cn } from "@/lib/utils";

interface NumberInputProps {
  value: number;
  onChange: (v: number) => void;
  /** Clamped on blur only, so typing is never interrupted mid-keystroke. */
  min?: number;
  max?: number;
  /** Decimal places allowed. 0 (default) means whole numbers only. */
  decimals?: number;
  /** Group digits Indian-style (1,00,000) when the field isn't focused. */
  grouped?: boolean;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  inputClassName?: string;
}

function format(value: number, decimals: number, grouped: boolean): string {
  if (!Number.isFinite(value)) return "";
  if (!grouped) {
    return decimals > 0 ? String(Number(value.toFixed(decimals))) : String(Math.round(value));
  }
  return value.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

/**
 * A plain text field that behaves like a number field without the browser's
 * spinner arrows or scroll-wheel hijacking. The typed value is only clamped on
 * blur — clamping on every keystroke made it impossible to type, e.g. a "5"
 * in a field with a minimum of 50,000 jumped straight to 50,000.
 */
export function NumberInput({
  value,
  onChange,
  min,
  max,
  decimals = 0,
  grouped = false,
  prefix,
  suffix,
  placeholder,
  ariaLabel,
  className,
  inputClassName,
}: NumberInputProps) {
  // While focused the field shows exactly what was typed (`draft`); when blurred
  // it shows the formatted value coming from the parent.
  const [draft, setDraft] = useState<string | null>(null);

  function sanitize(input: string): string {
    let cleaned = input.replace(decimals > 0 ? /[^0-9.]/g : /[^0-9]/g, "");
    if (decimals > 0) {
      const first = cleaned.indexOf(".");
      if (first !== -1) {
        cleaned =
          cleaned.slice(0, first + 1) + cleaned.slice(first + 1).replace(/\./g, "");
        const [whole, frac = ""] = cleaned.split(".");
        cleaned = `${whole}.${frac.slice(0, decimals)}`;
      }
    }
    return cleaned;
  }

  function commit() {
    const parsed = Number(draft);
    let next = draft === null || draft === "" || Number.isNaN(parsed) ? value : parsed;
    if (min != null) next = Math.max(min, next);
    if (max != null) next = Math.min(max, next);
    setDraft(null);
    if (next !== value) onChange(next);
  }

  return (
    <div
      className={cn(
        "flex items-center rounded-lg border border-border bg-secondary/40 px-2 transition-colors focus-within:border-primary",
        className,
      )}
    >
      {prefix ? (
        <span className="shrink-0 text-sm font-semibold text-muted-foreground">{prefix}</span>
      ) : null}
      <input
        type="text"
        inputMode={decimals > 0 ? "decimal" : "numeric"}
        autoComplete="off"
        aria-label={ariaLabel}
        placeholder={placeholder}
        value={draft ?? format(value, decimals, grouped)}
        onFocus={(e) => {
          setDraft(format(value, decimals, false));
          // Select everything so a new value replaces the old one in one go.
          requestAnimationFrame(() => e.target.select());
        }}
        onChange={(e) => {
          const cleaned = sanitize(e.target.value);
          setDraft(cleaned);
          if (cleaned === "" || cleaned === ".") return;
          const parsed = Number(cleaned);
          if (!Number.isNaN(parsed)) onChange(parsed);
        }}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.blur();
          }
        }}
        className={cn(
          "h-9 w-full min-w-0 bg-transparent px-1.5 text-right font-display text-base font-semibold text-foreground outline-none placeholder:font-sans placeholder:font-normal placeholder:text-muted-foreground",
          inputClassName,
        )}
      />
      {suffix ? (
        <span className="shrink-0 text-sm font-semibold text-muted-foreground">{suffix}</span>
      ) : null}
    </div>
  );
}
