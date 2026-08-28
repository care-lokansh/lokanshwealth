import { cn } from "@/lib/utils";
import {
  STATUS_PILL, STATUS_LABELS, DOC_STATUS_PILL, DOC_STATUS_LABELS,
  type AppStatus, type DocStatus,
} from "@/lib/lms";

export function StatusBadge({ status, className }: { status: AppStatus; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap", STATUS_PILL[status], className)}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function DocStatusBadge({ status, className }: { status: DocStatus; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap", DOC_STATUS_PILL[status], className)}>
      {DOC_STATUS_LABELS[status]}
    </span>
  );
}

/** Section heading with optional Hindi sub-label for authentic Indian-market micro-copy. */
export function FieldLabel({ en, hi, className }: { en: string; hi?: string; className?: string }) {
  return (
    <div className={cn("text-[11px] font-medium uppercase tracking-wide text-muted-foreground", className)}>
      {en}
      {hi ? <span className="ml-1 normal-case tracking-normal text-muted-foreground/70">· {hi}</span> : null}
    </div>
  );
}

export function Field({ en, hi, value, mono }: { en: string; hi?: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="space-y-1">
      <FieldLabel en={en} hi={hi} />
      <div className={cn("text-sm text-foreground", mono && "font-mono-num")}>{value ?? "—"}</div>
    </div>
  );
}

export function SectionCard({ title, action, children, className }: {
  title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-border bg-card shadow-sm", className)}>
      {title || action ? (
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          {title ? <h3 className="text-sm font-semibold text-foreground">{title}</h3> : <span />}
          {action}
        </div>
      ) : null}
      <div className="p-4">{children}</div>
    </div>
  );
}

export function EmptyState({ icon, title, hint }: { icon?: React.ReactNode; title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      {icon ? <div className="text-muted-foreground/50">{icon}</div> : null}
      <p className="text-sm font-medium text-foreground">{title}</p>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
