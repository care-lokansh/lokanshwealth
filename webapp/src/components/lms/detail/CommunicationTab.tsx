import { useState } from "react";
import { MessageSquare, Mail, MessageCircle, Send } from "lucide-react";
import { api } from "@/lib/api";
import {
  formatDateTime, formatINR,
  type ApplicationDetail, type CommChannel,
} from "@/lib/lms";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/lms/primitives";
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

interface Template {
  key: string; label: string; channel: CommChannel; subject?: string;
  build: (app: ApplicationDetail) => string;
}

const TEMPLATES: Template[] = [
  {
    key: "APPLICATION_RECEIVED", label: "Application Received", channel: "SMS",
    build: (a) => `Dear ${a.fullName}, your loan application ${a.arn} has been received by Lokansh Wealth. Our team will reach out shortly. - Team Lokansh`,
  },
  {
    key: "DOCUMENT_PENDING", label: "Document Pending Reminder", channel: "WHATSAPP",
    build: (a) => `Namaste ${a.fullName}, some documents for application ${a.arn} are still pending. Please upload them to avoid delays in processing. - Lokansh Wealth`,
  },
  {
    key: "SANCTION_LETTER", label: "Sanction Letter Issued", channel: "EMAIL", subject: "Your loan has been sanctioned",
    build: (a) => `Dear ${a.fullName},\n\nWe are pleased to inform you that your loan application ${a.arn} has been sanctioned${a.sanctionedAmount ? ` for ${formatINR(a.sanctionedAmount)}` : ""}. The sanction letter is attached.\n\nRegards,\nLokansh Wealth`,
  },
  {
    key: "DISBURSEMENT_DONE", label: "Disbursement Done", channel: "SMS",
    build: (a) => `Dear ${a.fullName}, the loan amount for application ${a.arn} has been disbursed to your registered bank account. Thank you for choosing Lokansh Wealth.`,
  },
];

const CHANNEL_ICON: Record<CommChannel, React.ReactNode> = {
  SMS: <MessageSquare className="h-4 w-4" />,
  EMAIL: <Mail className="h-4 w-4" />,
  WHATSAPP: <MessageCircle className="h-4 w-4" />,
};

const STATUS_PILL: Record<string, string> = {
  SENT: "bg-[hsl(var(--status-disbursed)/0.12)] text-[hsl(var(--status-disbursed))]",
  DELIVERED: "bg-[hsl(var(--status-approved)/0.12)] text-[hsl(var(--status-approved))]",
  QUEUED: "bg-secondary text-muted-foreground",
  FAILED: "bg-[hsl(var(--status-rejected)/0.12)] text-[hsl(var(--status-rejected))]",
};

function ComposeDialog({ app, template, open, onOpenChange }: { app: ApplicationDetail; template: Template | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  const [channel, setChannel] = useState<CommChannel>(template?.channel ?? "SMS");
  const [subject, setSubject] = useState(template?.subject ?? "");
  const [body, setBody] = useState(template ? template.build(app) : "");

  // Re-sync when template changes
  const [lastKey, setLastKey] = useState(template?.key);
  if (template && template.key !== lastKey) {
    setLastKey(template.key);
    setChannel(template.channel);
    setSubject(template.subject ?? "");
    setBody(template.build(app));
  }

  const mut = useDetailMutation(
    app.id,
    (b: Record<string, unknown>) => api.post("/api/v1/communications", b),
    { successMessage: "Message sent (simulated).", onDone: () => onOpenChange(false) },
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{template?.label ?? "Send message"}</DialogTitle>
          <DialogDescription>Sending to {app.fullName} · {app.mobile}. Delivery is simulated.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Channel</Label>
            <Select value={channel} onValueChange={(v) => setChannel(v as CommChannel)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="SMS">SMS</SelectItem>
                <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                <SelectItem value="EMAIL">Email</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {channel === "EMAIL" ? (
            <div className="space-y-1.5">
              <Label>Subject</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
          ) : null}
          <div className="space-y-1.5">
            <Label>Message</Label>
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            disabled={!body.trim() || mut.isPending}
            onClick={() => mut.mutate({
              applicationId: app.id, channel, template: template?.key ?? "CUSTOM",
              subject: channel === "EMAIL" ? subject.trim() || undefined : undefined,
              body: body.trim(),
            })}
          >
            <Send className="mr-1.5 h-4 w-4" /> {mut.isPending ? "Sending…" : "Send"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CommunicationTab({ app, canManage }: { app: ApplicationDetail; canManage: boolean }) {
  const [open, setOpen] = useState(false);
  const [template, setTemplate] = useState<Template | null>(null);

  function trigger(t: Template) { setTemplate(t); setOpen(true); }

  const log = [...(app.communications ?? [])].sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());

  return (
    <div className="space-y-4">
      {canManage ? (
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-3 text-sm font-semibold text-foreground">Quick templates · Sandesh</div>
          <div className="flex flex-wrap gap-2">
            {TEMPLATES.map((t) => (
              <Button key={t.key} variant="outline" size="sm" onClick={() => trigger(t)}>
                {CHANNEL_ICON[t.channel]} <span className="ml-1.5">{t.label}</span>
              </Button>
            ))}
          </div>
        </div>
      ) : null}

      {log.length === 0 ? (
        <EmptyState icon={<MessageSquare className="h-8 w-8" />} title="No messages sent yet" hint="Sent SMS, WhatsApp and email messages are logged here." />
      ) : (
        <div className="space-y-3">
          {log.map((m) => (
            <div key={m.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-muted-foreground">{CHANNEL_ICON[m.channel]}</span>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{m.subject ?? m.channel}</div>
                    <div className="text-[11px] text-muted-foreground">{m.channel} · by {m.sentBy?.name ?? "—"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", STATUS_PILL[m.status] ?? STATUS_PILL.QUEUED)}>{m.status}</span>
                  <span className="text-xs text-muted-foreground">{formatDateTime(m.sentAt)}</span>
                </div>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{m.body}</p>
            </div>
          ))}
        </div>
      )}

      <ComposeDialog app={app} template={template} open={open} onOpenChange={setOpen} />
    </div>
  );
}
