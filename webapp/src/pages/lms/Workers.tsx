import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Loader2, UserPlus, KeyRound, Activity, Phone, Mail, Circle, Briefcase, Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { formatDateTime, type WorkerRec } from "@/lib/lms";
import { cn } from "@/lib/utils";
import { SectionCard, EmptyState } from "@/components/lms/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";

interface ActivityLog {
  openFiles: number;
  stageChanges: { id: string; toStage: string; changedAt: string; application: { arn: string; fullName: string } }[];
  calls: { id: string; outcome: string; calledAt: string; application: { arn: string; fullName: string } }[];
  notes: { id: string; createdAt: string; application: { arn: string; fullName: string } }[];
}

function CreateWorkerDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", officePhone: "" });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const mut = useMutation({
    mutationFn: () => api.post("/api/v1/workers", {
      name: form.name.trim(), email: form.email.trim(), password: form.password,
      phone: form.phone.trim() || undefined, officePhone: form.officePhone.trim() || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workers"] });
      toast.success("Staff login created.");
      setForm({ name: "", email: "", password: "", phone: "", officePhone: "" });
      onOpenChange(false);
    },
    onError: (e: unknown) => toast.error(e instanceof ApiError ? e.message : "Could not create worker."),
  });

  const valid = form.name.trim().length >= 2 && /\S+@\S+\.\S+/.test(form.email) && form.password.length >= 8;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create staff login</DialogTitle>
          <DialogDescription>They can sign in at /app/login immediately with this email and password.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5"><Label>Full name</Label><Input value={form.name} onChange={set("name")} /></div>
          <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={form.email} onChange={set("email")} /></div>
          <div className="space-y-1.5"><Label>Temporary password</Label><Input type="password" value={form.password} onChange={set("password")} placeholder="Min 8 characters" autoComplete="new-password" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Mobile</Label><Input value={form.phone} onChange={set("phone")} className="font-mono-num" /></div>
            <div className="space-y-1.5"><Label>Office phone</Label><Input value={form.officePhone} onChange={set("officePhone")} className="font-mono-num" /></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!valid || mut.isPending} onClick={() => mut.mutate()}>{mut.isPending ? "Creating…" : "Create staff"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditWorkerDialog({ worker, open, onOpenChange }: { worker: WorkerRec | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", email: "", phone: "", officePhone: "" });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    if (open && worker) {
      setForm({
        name: worker.name,
        email: worker.email,
        phone: worker.phone ?? "",
        officePhone: worker.officePhone ?? "",
      });
    }
  }, [open, worker]);

  const mut = useMutation({
    mutationFn: () => api.patch(`/api/v1/workers/${worker!.id}`, {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
      officePhone: form.officePhone.trim() || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workers"] });
      toast.success("Staff details updated.");
      onOpenChange(false);
    },
    onError: (e: unknown) => toast.error(e instanceof ApiError ? e.message : "Could not update staff."),
  });

  const valid = form.name.trim().length >= 2 && /\S+@\S+\.\S+/.test(form.email);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit staff login</DialogTitle>
          <DialogDescription>Change name, email (login ID), or phone for {worker?.name}.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5"><Label>Full name</Label><Input value={form.name} onChange={set("name")} /></div>
          <div className="space-y-1.5"><Label>Login email</Label><Input type="email" value={form.email} onChange={set("email")} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Mobile</Label><Input value={form.phone} onChange={set("phone")} className="font-mono-num" /></div>
            <div className="space-y-1.5"><Label>Office phone</Label><Input value={form.officePhone} onChange={set("officePhone")} className="font-mono-num" /></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!valid || mut.isPending} onClick={() => mut.mutate()}>{mut.isPending ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ResetPasswordDialog({ worker, open, onOpenChange }: { worker: WorkerRec | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  const [pw, setPw] = useState("");
  const mut = useMutation({
    mutationFn: () => api.post(`/api/v1/workers/${worker!.id}/reset-password`, { password: pw }),
    onSuccess: () => { toast.success("Password reset."); setPw(""); onOpenChange(false); },
    onError: (e: unknown) => toast.error(e instanceof ApiError ? e.message : "Could not reset password."),
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Reset password</DialogTitle>
          <DialogDescription>Set a new password for {worker?.name}.</DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5"><Label>New password</Label><Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Min 8 characters" autoComplete="new-password" /></div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={pw.length < 8 || mut.isPending} onClick={() => mut.mutate()}>{mut.isPending ? "Saving…" : "Reset"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ActivityDialog({ worker, open, onOpenChange }: { worker: WorkerRec | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ["worker-activity", worker?.id],
    queryFn: () => api.get<ActivityLog>(`/api/v1/workers/${worker!.id}/activity`),
    enabled: open && !!worker,
  });

  const events = data ? [
    ...data.stageChanges.map((s) => ({ id: s.id, at: s.changedAt, text: `Moved ${s.application.arn} → ${s.toStage.replace(/_/g, " ").toLowerCase()}` })),
    ...data.calls.map((c) => ({ id: c.id, at: c.calledAt, text: `Called ${c.application.fullName} (${c.outcome.replace(/_/g, " ").toLowerCase()})` })),
    ...data.notes.map((n) => ({ id: n.id, at: n.createdAt, text: `Note on ${n.application.arn}` })),
  ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 30) : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Activity · {worker?.name}</DialogTitle>
          <DialogDescription>{data ? `${data.openFiles} open files` : "Loading…"}</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex h-32 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : events.length === 0 ? (
          <EmptyState icon={<Activity className="h-8 w-8" />} title="No recent activity" />
        ) : (
          <ol className="relative space-y-2.5 border-l border-border pl-5">
            {events.map((e) => (
              <li key={e.id} className="relative">
                <span className="absolute -left-[1.4rem] top-1.5 h-2 w-2 rounded-full bg-[hsl(var(--primary))] ring-4 ring-background" />
                <p className="text-sm text-foreground">{e.text}</p>
                <p className="text-[11px] text-muted-foreground">{formatDateTime(e.at)}</p>
              </li>
            ))}
          </ol>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function Workers() {
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editWorker, setEditWorker] = useState<WorkerRec | null>(null);
  const [resetWorker, setResetWorker] = useState<WorkerRec | null>(null);
  const [activityWorker, setActivityWorker] = useState<WorkerRec | null>(null);

  const { data: workers, isLoading } = useQuery({
    queryKey: ["workers"],
    queryFn: () => api.get<WorkerRec[]>("/api/v1/workers"),
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => api.patch(`/api/v1/workers/${id}`, { active }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["workers"] });
      toast.success(vars.active ? "Access restored." : "Access revoked. They can no longer sign in.");
    },
    onError: (e: unknown) => toast.error(e instanceof ApiError ? e.message : "Update failed."),
  });

  return (
    <div className="px-4 py-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Staff logins</h1>
          <p className="text-sm text-muted-foreground">Create IDs, reset passwords, or revoke access. {workers?.length ?? 0} staff on the desk.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}><UserPlus className="mr-1.5 h-4 w-4" /> Add staff</Button>
      </div>

      <div className="mt-5">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (workers ?? []).length === 0 ? (
          <SectionCard><EmptyState icon={<Briefcase className="h-8 w-8" />} title="No staff yet" hint="Add a staff login with email and password. They can sign in at /app/login right away." /></SectionCard>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {workers!.map((w) => (
              <div key={w.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.12)] text-sm font-bold text-[hsl(var(--primary))]">
                      {w.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{w.name}</div>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Circle className={cn("h-2 w-2 fill-current", w.active ? "text-[hsl(var(--status-approved))]" : "text-muted-foreground")} />
                        {w.active ? "Active" : "Inactive"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">{w.active ? "On" : "Revoked"}</span>
                    <Switch checked={w.active} onCheckedChange={(v) => toggleActive.mutate({ id: w.id, active: v })} />
                  </div>
                </div>

                <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {w.email}</div>
                  {w.phone ? <div className="flex items-center gap-1.5 font-mono-num"><Phone className="h-3 w-3" /> {w.phone}</div> : null}
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-xs text-muted-foreground"><span className="font-mono-num font-semibold text-foreground">{w._count.assignedFiles}</span> files assigned</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-8 px-2" title="Activity" onClick={() => setActivityWorker(w)}><Activity className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="sm" className="h-8 px-2" title="Edit details" onClick={() => setEditWorker(w)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="sm" className="h-8 px-2" title="Reset password" onClick={() => setResetWorker(w)}><KeyRound className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateWorkerDialog open={createOpen} onOpenChange={setCreateOpen} />
      <EditWorkerDialog worker={editWorker} open={!!editWorker} onOpenChange={(v) => !v && setEditWorker(null)} />
      <ResetPasswordDialog worker={resetWorker} open={!!resetWorker} onOpenChange={(v) => !v && setResetWorker(null)} />
      <ActivityDialog worker={activityWorker} open={!!activityWorker} onOpenChange={(v) => !v && setActivityWorker(null)} />
    </div>
  );
}
