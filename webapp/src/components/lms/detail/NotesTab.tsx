import { useState } from "react";
import { StickyNote, Send } from "lucide-react";
import { api } from "@/lib/api";
import {
  formatDateTime, NOTE_TAG_LABELS,
  type ApplicationDetail, type NoteTag,
} from "@/lib/lms";
import { EmptyState } from "@/components/lms/primitives";
import { NoteTagChip } from "./chips";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useDetailMutation } from "./useDetailMutation";

const TAGS: NoteTag[] = ["NONE", "URGENT", "FOLLOW_UP", "ESCALATED"];

export function NotesTab({ app }: { app: ApplicationDetail }) {
  const [body, setBody] = useState("");
  const [tag, setTag] = useState<NoteTag>("NONE");

  const mut = useDetailMutation(
    app.id,
    (b: { applicationId: string; body: string; tag: NoteTag }) => api.post("/api/v1/notes", b),
    { successMessage: "Note added.", onDone: () => { setBody(""); setTag("NONE"); } },
  );

  const notes = [...(app.notes ?? [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="Add an internal note — visible only to the operations team, never to the applicant."
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <Select value={tag} onValueChange={(v) => setTag(v as NoteTag)}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {TAGS.map((t) => <SelectItem key={t} value={t}>{t === "NONE" ? "No tag" : NOTE_TAG_LABELS[t]}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button disabled={!body.trim() || mut.isPending} onClick={() => mut.mutate({ applicationId: app.id, body: body.trim(), tag })}>
            <Send className="mr-1.5 h-4 w-4" /> {mut.isPending ? "Adding…" : "Add note"}
          </Button>
        </div>
      </div>

      {notes.length === 0 ? (
        <EmptyState icon={<StickyNote className="h-8 w-8" />} title="No internal notes yet" hint="Team-only notes appear here, newest first." />
      ) : (
        <div className="space-y-3">
          {notes.map((n) => (
            <div key={n.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{n.author?.name ?? "—"}</span>
                  {n.author?.role ? (
                    <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      {n.author.role === "SUPER_ADMIN" ? "Admin" : "Worker"}
                    </span>
                  ) : null}
                  <NoteTagChip tag={n.tag} />
                </div>
                <span className="text-xs text-muted-foreground">{formatDateTime(n.createdAt)}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{n.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
