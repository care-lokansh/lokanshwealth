import { Check, Circle, FileText, Phone, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DOC_STATUS_LABELS,
  STAGE_LABELS,
  STAGE_ORDER,
  STATUS_LABELS,
  formatDate,
  formatDateTime,
  formatINR,
  type AppStatus,
  type DocStatus,
  type Stage,
} from "@/lib/lms";
import type { TrackedApplication } from "@/lib/tracking";
import { ActivityFeed } from "./ActivityFeed";

// The marketing site doesn't load the LMS theme variables, so status colours
// are spelled out here instead of reusing the console's STATUS_PILL classes.
const STATUS_STYLE: Record<AppStatus, string> = {
  IN_PROCESS: "bg-amber-50 text-amber-700 ring-amber-200",
  APPROVED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  REJECTED: "bg-red-50 text-red-700 ring-red-200",
  DISBURSED: "bg-blue-50 text-blue-700 ring-blue-200",
};

const DOC_STYLE: Record<DocStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  VERIFIED: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-red-50 text-red-700",
};

/** Stages shown to applicants — the internal CLOSED stage is not useful here. */
const VISIBLE_STAGES: Stage[] = STAGE_ORDER.filter((s) => s !== "CLOSED");

export function ApplicationStatusCard({ app }: { app: TrackedApplication }) {
  const currentIndex = VISIBLE_STAGES.indexOf(app.stage);
  const rejected = app.status === "REJECTED";
  const progress = rejected
    ? 100
    : Math.round(((currentIndex + 1) / VISIBLE_STAGES.length) * 100);
  const stageDates = new Map(app.timeline.map((t) => [t.stage, t.at]));

  return (
    <article className="overflow-hidden rounded-3xl border border-border bg-card">
      {/* Header */}
      <div className="border-b border-border bg-secondary/40 px-6 py-5 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Reference number
            </p>
            <p className="mt-1 select-all font-display text-2xl font-semibold tracking-tight text-foreground">
              {app.arn}
            </p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {app.loanTypeName} · Applied {formatDate(app.submittedAt)} · {app.applicantName}
            </p>
          </div>
          <span
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 ring-inset",
              STATUS_STYLE[app.status],
            )}
          >
            {STATUS_LABELS[app.status]}
          </span>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <Figure label="Amount applied" value={formatINR(app.amount)} />
          <Figure
            label={app.sanctionedAmount ? "Sanctioned" : "Tenure"}
            value={
              app.sanctionedAmount
                ? formatINR(app.sanctionedAmount)
                : `${app.tenureMonths} months`
            }
          />
          <Figure
            label={app.emi ? "Monthly EMI" : "Interest rate"}
            value={
              app.emi
                ? formatINR(app.emi)
                : app.interestRate
                  ? `${app.interestRate}% p.a.`
                  : "To be confirmed"
            }
          />
        </div>
      </div>

      <div className="px-6 py-6 sm:px-8">
        {/* Progress */}
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-foreground">
            {rejected ? "Application closed" : STAGE_LABELS[app.stage]}
          </span>
          <span className="text-muted-foreground">
            Updated {formatDateTime(app.updatedAt)}
          </span>
        </div>
        <div className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-secondary">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              rejected ? "bg-red-500" : "bg-primary",
            )}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Stage timeline */}
        <ol className="mt-6 space-y-0.5">
          {VISIBLE_STAGES.map((stage, i) => {
            const done = !rejected && i < currentIndex;
            const current = !rejected && i === currentIndex;
            const at = stageDates.get(stage);
            // Once a file is well past a stage the older steps are just noise.
            if (!done && !current && i > currentIndex + 2) return null;
            return (
              <li key={stage} className="flex items-start gap-3">
                <div className="flex flex-col items-center self-stretch">
                  <span
                    className={cn(
                      "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full",
                      done && "bg-primary text-primary-foreground",
                      current && "bg-accent text-accent-foreground ring-4 ring-accent/20",
                      !done && !current && "bg-secondary text-muted-foreground",
                    )}
                  >
                    {done ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Circle className={cn("h-2 w-2", current && "fill-current")} />
                    )}
                  </span>
                  <span className="w-px flex-1 bg-border" />
                </div>
                <div className="pb-4">
                  <p
                    className={cn(
                      "text-sm",
                      current ? "font-semibold text-foreground" : "text-muted-foreground",
                      done && "text-foreground",
                    )}
                  >
                    {STAGE_LABELS[stage]}
                  </p>
                  {at ? (
                    <p className="text-xs text-muted-foreground">{formatDateTime(at)}</p>
                  ) : null}
                </div>
              </li>
            );
          })}
          {rejected ? (
            <li className="flex items-start gap-3">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-red-100 text-red-600">
                <XCircle className="h-4 w-4" />
              </span>
              <p className="text-sm font-semibold text-foreground">
                Not approved this time — call us to explore other lenders.
              </p>
            </li>
          ) : null}
        </ol>

        {/* Documents */}
        {app.documents.length > 0 ? (
          <div className="mt-2 rounded-2xl border border-border bg-secondary/30 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <FileText className="h-4 w-4 text-primary" /> Your documents
            </p>
            <ul className="mt-3 space-y-2">
              {app.documents.map((d, i) => (
                <li key={`${d.label}-${i}`} className="text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">{d.label}</span>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        DOC_STYLE[d.status],
                      )}
                    >
                      {DOC_STATUS_LABELS[d.status]}
                    </span>
                  </div>
                  {d.rejectionReason ? (
                    <p className="mt-0.5 text-xs text-red-600">{d.rejectionReason}</p>
                  ) : null}
                  {d.reviewedAt ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Reviewed {formatDateTime(d.reviewedAt)}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Full event history */}
        <ActivityFeed app={app} />

        {/* Relationship manager */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-primary px-5 py-4 text-primary-foreground">
          <div>
            <p className="text-xs uppercase tracking-wide text-primary-foreground/60">
              {app.manager ? "Your relationship manager" : "Need help with this application?"}
            </p>
            <p className="mt-0.5 font-semibold">{app.manager?.name ?? "Lokansh Wealth support"}</p>
          </div>
          <a
            href={`tel:${(app.manager?.phone ?? "+917053231846").replace(/\s/g, "")}`}
            className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
          >
            <Phone className="h-4 w-4" />
            {app.manager?.phone ?? "+91 70532 31846"}
          </a>
        </div>
      </div>
    </article>
  );
}

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-card px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-display text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}
