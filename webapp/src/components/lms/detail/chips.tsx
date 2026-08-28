import { cn } from "@/lib/utils";
import {
  CALL_OUTCOME_LABELS, NOTE_TAG_LABELS,
  type CallOutcome, type NoteTag,
} from "@/lib/lms";

const CALL_OUTCOME_PILL: Record<CallOutcome, string> = {
  CONNECTED: "bg-[hsl(var(--status-approved)/0.12)] text-[hsl(var(--status-approved))] ring-1 ring-inset ring-[hsl(var(--status-approved)/0.25)]",
  CALL_BACK_LATER: "bg-[hsl(var(--status-process)/0.14)] text-[hsl(28_90%_34%)] ring-1 ring-inset ring-[hsl(var(--status-process)/0.3)]",
  NUMBER_BUSY: "bg-[hsl(var(--status-process)/0.14)] text-[hsl(28_90%_34%)] ring-1 ring-inset ring-[hsl(var(--status-process)/0.3)]",
  NOT_REACHABLE: "bg-[hsl(var(--status-rejected)/0.1)] text-[hsl(var(--status-rejected))] ring-1 ring-inset ring-[hsl(var(--status-rejected)/0.2)]",
  SWITCHED_OFF: "bg-[hsl(var(--status-rejected)/0.1)] text-[hsl(var(--status-rejected))] ring-1 ring-inset ring-[hsl(var(--status-rejected)/0.2)]",
  WRONG_NUMBER: "bg-secondary text-secondary-foreground ring-1 ring-inset ring-border",
};

const NOTE_TAG_PILL: Record<NoteTag, string> = {
  NONE: "bg-secondary text-secondary-foreground ring-1 ring-inset ring-border",
  URGENT: "bg-[hsl(var(--status-rejected)/0.12)] text-[hsl(var(--status-rejected))] ring-1 ring-inset ring-[hsl(var(--status-rejected)/0.25)]",
  FOLLOW_UP: "bg-[hsl(var(--status-process)/0.14)] text-[hsl(28_90%_34%)] ring-1 ring-inset ring-[hsl(var(--status-process)/0.3)]",
  ESCALATED: "bg-[hsl(280_60%_45%/0.12)] text-[hsl(280_60%_45%)] ring-1 ring-inset ring-[hsl(280_60%_45%/0.25)]",
};

export function CallOutcomeChip({ outcome }: { outcome: CallOutcome }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap", CALL_OUTCOME_PILL[outcome])}>
      {CALL_OUTCOME_LABELS[outcome]}
    </span>
  );
}

export function NoteTagChip({ tag }: { tag: NoteTag }) {
  if (tag === "NONE") return null;
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap", NOTE_TAG_PILL[tag])}>
      {NOTE_TAG_LABELS[tag]}
    </span>
  );
}

export function StageChip({ label, className }: { label: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-md bg-[hsl(var(--primary)/0.1)] px-2 py-0.5 text-[11px] font-semibold text-[hsl(var(--primary))] ring-1 ring-inset ring-[hsl(var(--primary)/0.2)]", className)}>
      {label}
    </span>
  );
}
