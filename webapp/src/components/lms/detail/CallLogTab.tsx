import { useState } from "react";
import { Phone, PhoneCall, Clock, CalendarClock } from "lucide-react";
import { api } from "@/lib/api";
import {
  formatDateTime, CALL_OUTCOME_LABELS,
  type ApplicationDetail, type CallOutcome,
} from "@/lib/lms";
import { EmptyState } from "@/components/lms/primitives";
import { CallOutcomeChip } from "./chips";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { useDetailMutation } from "./useDetailMutation";

const OUTCOMES = Object.keys(CALL_OUTCOME_LABELS) as CallOutcome[];

function LogCallDialog({ appId, open, onOpenChange }: { appId: string; open: boolean; onOpenChange: (v: boolean) => void }) {
  const [outcome, setOutcome] = useState<CallOutcome>("CONNECTED");
  const [duration, setDuration] = useState("2");
  const [notes, setNotes] = useState("");
  const [followUp, setFollowUp] = useState("");

  const mut = useDetailMutation(
    appId,
    (body: { applicationId: string; outcome: CallOutcome; durationMins: number; notes?: string; followUpAt?: string }) =>
      api.post("/api/v1/calls", body),
    {
      successMessage: "Call logged.",
      onDone: () => { onOpenChange(false); setNotes(""); setFollowUp(""); setDuration("2"); setOutcome("CONNECTED"); },
    },
  );

  function submit() {
    const durationMins = Number(duration);
    mut.mutate({
      applicationId: appId,
      outcome,
      durationMins: Number.isFinite(durationMins) && durationMins > 0 ? durationMins : 0,
      notes: notes.trim() || undefined,
      followUpAt: followUp ? new Date(followUp).toISOString() : undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log a call</DialogTitle>
          <DialogDescription>Record the outcome of your call to the applicant.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Outcome</Label>
            <Select value={outcome} onValueChange={(v) => setOutcome(v as CallOutcome)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {OUTCOMES.map((o) => <SelectItem key={o} value={o}>{CALL_OUTCOME_LABELS[o]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Duration (minutes)</Label>
            <Input type="number" min={0} value={duration} onChange={(e) => setDuration(e.target.value)} className="font-mono-num" />
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="What was discussed?" />
          </div>
          <div className="space-y-1.5">
            <Label>Follow-up (optional)</Label>
            <Input type="datetime-local" value={followUp} onChange={(e) => setFollowUp(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={mut.isPending}>{mut.isPending ? "Saving…" : "Save call"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CallLogTab({ app }: { app: ApplicationDetail }) {
  const [open, setOpen] = useState(false);
  const calls = [...(app.callLogs ?? [])].sort((a, b) => new Date(b.calledAt).getTime() - new Date(a.calledAt).getTime());

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))]">
            <PhoneCall className="h-5 w-5" />
          </div>
          <div>
            <div className="font-mono-num text-2xl font-bold leading-none text-foreground">{calls.length}</div>
            <div className="text-xs text-muted-foreground">total call attempts</div>
          </div>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Phone className="mr-1.5 h-4 w-4" /> Log New Call
        </Button>
      </div>

      {calls.length === 0 ? (
        <EmptyState icon={<Phone className="h-8 w-8" />} title="No calls logged yet" hint="Use “Log New Call” after reaching out to the applicant." />
      ) : (
        <ol className="relative space-y-3 border-l border-border pl-5">
          {calls.map((c) => (
            <li key={c.id} className="relative">
              <span className="absolute -left-[1.45rem] top-1.5 h-2.5 w-2.5 rounded-full bg-[hsl(var(--primary))] ring-4 ring-background" />
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CallOutcomeChip outcome={c.outcome} />
                  <span className="text-xs text-muted-foreground">{formatDateTime(c.calledAt)}</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{c.worker?.name ?? "—"}</span>
                  <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {c.durationMins} min</span>
                  {c.followUpAt ? (
                    <span className="inline-flex items-center gap-1 text-[hsl(28_90%_34%)]">
                      <CalendarClock className="h-3 w-3" /> Follow-up {formatDateTime(c.followUpAt)}
                    </span>
                  ) : null}
                </div>
                {c.notes ? <p className="mt-2 text-sm text-foreground">{c.notes}</p> : null}
              </div>
            </li>
          ))}
        </ol>
      )}

      <LogCallDialog appId={app.id} open={open} onOpenChange={setOpen} />
    </div>
  );
}
