import { BadgeCheck, Banknote, FileCheck2, FileX2, Flag, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { STAGE_LABELS, formatDateTime, formatINR } from "@/lib/lms";
import type { TrackedApplication } from "@/lib/tracking";

type Tone = "neutral" | "good" | "bad";

interface ActivityEvent {
  at: string;
  title: string;
  detail?: string;
  icon: typeof Flag;
  tone: Tone;
}

const TONE_STYLE: Record<Tone, string> = {
  neutral: "bg-secondary text-muted-foreground",
  good: "bg-emerald-50 text-emerald-600",
  bad: "bg-red-50 text-red-600",
};

/**
 * Everything that has happened on the file, newest first: stage moves, each
 * document upload and review, and every disbursement tranche. Internal-only
 * material (stage change reasons, notes, call logs) never reaches this list.
 */
export function buildActivity(app: TrackedApplication): ActivityEvent[] {
  const events: ActivityEvent[] = [];

  for (const t of app.timeline) {
    events.push({
      at: t.at,
      title: STAGE_LABELS[t.stage],
      detail:
        t.stage === "APPLICATION_RECEIVED"
          ? "We received your application and created your file."
          : undefined,
      icon: t.stage === "DISBURSED" ? BadgeCheck : Flag,
      tone: t.stage === "DISBURSED" ? "good" : "neutral",
    });
  }

  for (const d of app.documents) {
    events.push({
      at: d.uploadedAt,
      title: `${d.label} uploaded`,
      icon: Upload,
      tone: "neutral",
    });
    if (d.reviewedAt) {
      const verified = d.status === "VERIFIED";
      events.push({
        at: d.reviewedAt,
        title: `${d.label} ${verified ? "verified" : "rejected"}`,
        detail: verified
          ? undefined
          : (d.rejectionReason ?? "Please re-upload a clearer copy."),
        icon: verified ? FileCheck2 : FileX2,
        tone: verified ? "good" : "bad",
      });
    }
  }

  for (const d of app.disbursements) {
    events.push({
      at: d.disbursedAt,
      title: `${formatINR(d.amount)} disbursed via ${d.mode}`,
      detail: [d.note, d.utr ? `UTR ${d.utr}` : null].filter(Boolean).join(" · ") || undefined,
      icon: Banknote,
      tone: "good",
    });
  }

  return events.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

export function ActivityFeed({ app }: { app: TrackedApplication }) {
  const events = buildActivity(app);
  if (events.length === 0) return null;

  return (
    <div className="mt-4 rounded-2xl border border-border bg-secondary/30 p-5">
      <p className="text-sm font-semibold text-foreground">Activity on your file</p>
      <ol className="mt-4 space-y-4">
        {events.map((e, i) => {
          const Icon = e.icon;
          return (
            <li key={`${e.at}-${e.title}-${i}`} className="flex gap-3">
              <span
                className={cn(
                  "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full",
                  TONE_STYLE[e.tone],
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{e.title}</p>
                {e.detail ? (
                  <p
                    className={cn(
                      "text-xs leading-relaxed",
                      e.tone === "bad" ? "text-red-600" : "text-muted-foreground",
                    )}
                  >
                    {e.detail}
                  </p>
                ) : null}
                <p className="mt-0.5 text-xs text-muted-foreground">{formatDateTime(e.at)}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
