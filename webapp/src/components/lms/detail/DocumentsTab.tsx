import { useState } from "react";
import { FileText, ExternalLink, Check, X, FolderOpen } from "lucide-react";
import { api } from "@/lib/api";
import {
  formatDateTime,
  type ApplicationDetail, type DocumentRec,
} from "@/lib/lms";
import { DocStatusBadge, EmptyState } from "@/components/lms/primitives";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { useDetailMutation } from "./useDetailMutation";

function DocCard({ doc, appId, canReview }: { doc: DocumentRec; appId: string; canReview: boolean }) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");

  const review = useDetailMutation(
    appId,
    (body: { status: "VERIFIED" | "REJECTED" | "PENDING"; rejectionReason?: string }) =>
      api.patch(`/api/v1/documents/${doc.id}/review`, body),
    { successMessage: "Document status updated.", onDone: () => { setRejectOpen(false); setReason(""); } },
  );

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2.5">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
            <FileText className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-foreground">{doc.label}</div>
            <div className="truncate text-xs text-muted-foreground">{doc.fileName}</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground/80">Uploaded {formatDateTime(doc.uploadedAt)}</div>
          </div>
        </div>
        <DocStatusBadge status={doc.status} />
      </div>

      {doc.status === "REJECTED" && doc.rejectionReason ? (
        <div className="mt-3 rounded-md bg-[hsl(var(--status-rejected)/0.08)] px-3 py-2 text-xs text-[hsl(var(--status-rejected))]">
          <span className="font-semibold">Rejected:</span> {doc.rejectionReason}
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <a href={doc.fileUrl} target="_blank" rel="noreferrer">
          <Button variant="outline" size="sm">
            <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> View
          </Button>
        </a>
        {canReview ? (
          <>
            {doc.status !== "VERIFIED" ? (
              <Button
                size="sm"
                variant="outline"
                className="border-[hsl(var(--status-approved)/0.4)] text-[hsl(var(--status-approved))] hover:bg-[hsl(var(--status-approved)/0.08)]"
                disabled={review.isPending}
                onClick={() => review.mutate({ status: "VERIFIED" })}
              >
                <Check className="mr-1.5 h-3.5 w-3.5" /> Verify
              </Button>
            ) : null}
            {doc.status !== "REJECTED" ? (
              <Button
                size="sm"
                variant="outline"
                className="border-[hsl(var(--status-rejected)/0.4)] text-[hsl(var(--status-rejected))] hover:bg-[hsl(var(--status-rejected)/0.08)]"
                onClick={() => setRejectOpen(true)}
              >
                <X className="mr-1.5 h-3.5 w-3.5" /> Reject
              </Button>
            ) : null}
          </>
        ) : null}
      </div>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject document</DialogTitle>
            <DialogDescription>{doc.label} — a reason is required so the applicant can re-upload.</DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label>Reason for rejection</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Document is blurred / name mismatch / expired."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={!reason.trim() || review.isPending}
              onClick={() => review.mutate({ status: "REJECTED", rejectionReason: reason.trim() })}
            >
              {review.isPending ? "Rejecting…" : "Reject document"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function DocumentsTab({ app, canReview }: { app: ApplicationDetail; canReview: boolean }) {
  const docs = app.documents ?? [];
  const verified = docs.filter((d) => d.status === "VERIFIED").length;
  const pending = docs.filter((d) => d.status === "PENDING").length;
  const rejected = docs.filter((d) => d.status === "REJECTED").length;

  if (docs.length === 0) {
    return <EmptyState icon={<FolderOpen className="h-8 w-8" />} title="No documents uploaded yet" hint="Uploaded documents will appear here for review." />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full bg-[hsl(var(--status-approved)/0.12)] px-2.5 py-1 font-semibold text-[hsl(var(--status-approved))]">{verified} verified</span>
        <span className="rounded-full bg-[hsl(var(--status-process)/0.14)] px-2.5 py-1 font-semibold text-[hsl(28_90%_34%)]">{pending} pending</span>
        <span className="rounded-full bg-[hsl(var(--status-rejected)/0.12)] px-2.5 py-1 font-semibold text-[hsl(var(--status-rejected))]">{rejected} rejected</span>
        <span className="ml-auto text-muted-foreground">{docs.length} total</span>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {docs.map((d) => <DocCard key={d.id} doc={d} appId={app.id} canReview={canReview} />)}
      </div>
    </div>
  );
}
