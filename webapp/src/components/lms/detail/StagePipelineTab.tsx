import { useState } from "react";
import { Check, ChevronRight, ChevronLeft, History, GitBranch } from "lucide-react";
import { api } from "@/lib/api";
import {
  STAGE_ORDER, STAGE_LABELS, formatDateTime,
  type ApplicationDetail, type Stage,
} from "@/lib/lms";
import { cn } from "@/lib/utils";
import { SectionCard, EmptyState } from "@/components/lms/primitives";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { useDetailMutation } from "./useDetailMutation";

function MoveDialog({
  appId, target, direction, open, onOpenChange,
}: {
  appId: string; target: Stage | null; direction: "forward" | "back";
  open: boolean; onOpenChange: (v: boolean) => void;
}) {
  const [reason, setReason] = useState("");
  const mut = useDetailMutation(
    appId,
    (body: { applicationId: string; toStage: Stage; reason: string }) => api.post("/api/v1/stages/change", body),
    { successMessage: "Stage updated.", onDone: () => { onOpenChange(false); setReason(""); } },
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Move {direction === "forward" ? "forward" : "back"}</DialogTitle>
          <DialogDescription>
            {target ? <>Move this file to <span className="font-semibold text-foreground">{STAGE_LABELS[target]}</span>. A reason is logged automatically.</> : null}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label>Reason <span className="text-[hsl(var(--status-rejected))]">*</span></Label>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Why is the file moving stage?" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            disabled={!reason.trim() || !target || mut.isPending}
            onClick={() => target && mut.mutate({ applicationId: appId, toStage: target, reason: reason.trim() })}
          >
            {mut.isPending ? "Saving…" : "Confirm move"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function StagePipelineTab({ app, canManage }: { app: ApplicationDetail; canManage: boolean }) {
  const currentIdx = STAGE_ORDER.indexOf(app.stage);
  const prevStage = currentIdx > 0 ? STAGE_ORDER[currentIdx - 1] : null;
  const nextStage = currentIdx < STAGE_ORDER.length - 1 ? STAGE_ORDER[currentIdx + 1] : null;

  const [moveOpen, setMoveOpen] = useState(false);
  const [target, setTarget] = useState<Stage | null>(null);
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  function openMove(to: Stage | null, dir: "forward" | "back") {
    if (!to) return;
    setTarget(to); setDirection(dir); setMoveOpen(true);
  }

  const history = [...(app.stageHistory ?? [])].sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime());

  return (
    <div className="space-y-4">
      {/* Pipeline */}
      <SectionCard title="Pipeline · Pragati">
        <div className="overflow-x-auto pb-2">
          <ol className="flex min-w-max items-start gap-0">
            {STAGE_ORDER.map((stage, i) => {
              const done = i < currentIdx;
              const current = i === currentIdx;
              return (
                <li key={stage} className="flex items-start">
                  <div className="flex w-28 flex-col items-center text-center">
                    <div
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ring-4 ring-background transition-colors",
                        done && "bg-[hsl(var(--status-approved))] text-white",
                        current && "bg-[hsl(var(--primary))] text-white shadow-lg shadow-[hsl(var(--primary)/0.4)]",
                        !done && !current && "bg-secondary text-muted-foreground",
                      )}
                    >
                      {done ? <Check className="h-4 w-4" /> : i + 1}
                    </div>
                    <span className={cn("mt-2 text-[11px] leading-tight", current ? "font-semibold text-foreground" : "text-muted-foreground")}>
                      {STAGE_LABELS[stage]}
                    </span>
                  </div>
                  {i < STAGE_ORDER.length - 1 ? (
                    <div className={cn("mt-4 h-0.5 w-6 shrink-0", i < currentIdx ? "bg-[hsl(var(--status-approved))]" : "bg-border")} />
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <div className="text-sm">
            <span className="text-muted-foreground">Current stage: </span>
            <span className="font-semibold text-foreground">{STAGE_LABELS[app.stage]}</span>
          </div>
          {canManage ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={!prevStage} onClick={() => openMove(prevStage, "back")}>
                <ChevronLeft className="mr-1 h-4 w-4" /> Move back
              </Button>
              <Button size="sm" disabled={!nextStage} onClick={() => openMove(nextStage, "forward")}>
                Move forward <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          ) : null}
        </div>
      </SectionCard>

      {/* History */}
      <SectionCard title="Stage History · Itihaas">
        {history.length === 0 ? (
          <EmptyState icon={<History className="h-8 w-8" />} title="No stage changes yet" hint="Every forward/back move is logged here with a reason." />
        ) : (
          <ol className="relative space-y-3 border-l border-border pl-5">
            {history.map((h) => (
              <li key={h.id} className="relative">
                <span className="absolute -left-[1.45rem] top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.12)] ring-4 ring-background">
                  <GitBranch className="h-2.5 w-2.5 text-[hsl(var(--primary))]" />
                </span>
                <div className="rounded-lg border border-border bg-card p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="font-medium text-foreground">
                      {h.fromStage ? `${STAGE_LABELS[h.fromStage]} → ` : ""}{STAGE_LABELS[h.toStage]}
                    </span>
                    <span className="text-xs text-muted-foreground">{formatDateTime(h.changedAt)}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{h.reason}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground/80">by {h.changedBy?.name ?? "—"}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </SectionCard>

      <MoveDialog appId={app.id} target={target} direction={direction} open={moveOpen} onOpenChange={setMoveOpen} />
    </div>
  );
}
