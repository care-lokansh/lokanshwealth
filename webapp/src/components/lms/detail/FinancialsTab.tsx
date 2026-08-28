import { useState } from "react";
import { IndianRupee, Banknote, Plus, Trash2, Receipt } from "lucide-react";
import { api } from "@/lib/api";
import {
  formatINR, formatDate, calculateEmi,
  type ApplicationDetail, type DisbursementMode,
} from "@/lib/lms";
import { Field, SectionCard, EmptyState } from "@/components/lms/primitives";
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
import { IFSC_REGEX } from "@/lib/lms";
import { useDetailMutation } from "./useDetailMutation";

const MODES: DisbursementMode[] = ["NEFT", "RTGS", "IMPS", "CHEQUE"];

interface TermsState {
  sanctionedAmount: string; interestRate: string; processingFee: string;
  dpBankName: string; dpAccountNumber: string; dpIfsc: string; dpAccountHolder: string;
}

function TermsDialog({ app, open, onOpenChange }: { app: ApplicationDetail; open: boolean; onOpenChange: (v: boolean) => void }) {
  const [form, setForm] = useState<TermsState>({
    sanctionedAmount: app.sanctionedAmount == null ? "" : String(app.sanctionedAmount),
    interestRate: app.interestRate == null ? "" : String(app.interestRate),
    processingFee: app.processingFee == null ? "" : String(app.processingFee),
    dpBankName: app.dpBankName ?? "",
    dpAccountNumber: app.dpAccountNumber ?? "",
    dpIfsc: app.dpIfsc ?? "",
    dpAccountHolder: app.dpAccountHolder ?? "",
  });
  const [ifscError, setIfscError] = useState("");

  const mut = useDetailMutation(
    app.id,
    (body: Record<string, unknown>) => api.patch(`/api/v1/financials/${app.id}`, body),
    { successMessage: "Financial terms saved.", onDone: () => onOpenChange(false) },
  );

  const set = (k: keyof TermsState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  // Live EMI preview
  const sa = Number(form.sanctionedAmount);
  const rate = Number(form.interestRate);
  const previewEmi = sa > 0 && rate > 0 ? calculateEmi(sa, rate, app.tenureMonths) : 0;

  function submit() {
    const ifsc = form.dpIfsc.trim().toUpperCase();
    if (ifsc && !IFSC_REGEX.test(ifsc)) { setIfscError("Invalid IFSC (e.g. HDFC0001234)"); return; }
    setIfscError("");
    mut.mutate({
      sanctionedAmount: form.sanctionedAmount.trim() === "" ? null : Number(form.sanctionedAmount),
      interestRate: form.interestRate.trim() === "" ? null : Number(form.interestRate),
      processingFee: form.processingFee.trim() === "" ? null : Number(form.processingFee),
      dpBankName: form.dpBankName.trim() || undefined,
      dpAccountNumber: form.dpAccountNumber.trim() || undefined,
      dpIfsc: ifsc,
      dpAccountHolder: form.dpAccountHolder.trim() || undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Sanction terms & disbursement account</DialogTitle>
          <DialogDescription>EMI recalculates automatically from sanctioned amount, rate and tenure.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Sanctioned amount (₹)</Label>
            <Input type="number" value={form.sanctionedAmount} onChange={set("sanctionedAmount")} className="font-mono-num" placeholder={String(app.amount)} />
          </div>
          <div className="space-y-1.5">
            <Label>Interest rate (% p.a.)</Label>
            <Input type="number" step="0.01" value={form.interestRate} onChange={set("interestRate")} className="font-mono-num" />
          </div>
          <div className="space-y-1.5">
            <Label>Processing fee (₹)</Label>
            <Input type="number" value={form.processingFee} onChange={set("processingFee")} className="font-mono-num" />
          </div>
          <div className="space-y-1.5">
            <Label>EMI (auto)</Label>
            <div className="flex h-10 items-center rounded-md border border-dashed border-border bg-secondary/50 px-3 font-mono-num text-sm font-semibold text-foreground">
              {previewEmi > 0 ? `${formatINR(previewEmi)}/mo` : "—"}
            </div>
          </div>
          <div className="sm:col-span-2 mt-1 border-t border-border pt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Disbursement Account · Khaata
          </div>
          <div className="space-y-1.5">
            <Label>Bank name</Label>
            <Input value={form.dpBankName} onChange={set("dpBankName")} />
          </div>
          <div className="space-y-1.5">
            <Label>Account holder</Label>
            <Input value={form.dpAccountHolder} onChange={set("dpAccountHolder")} />
          </div>
          <div className="space-y-1.5">
            <Label>Account number</Label>
            <Input value={form.dpAccountNumber} onChange={set("dpAccountNumber")} className="font-mono-num" />
          </div>
          <div className="space-y-1.5">
            <Label>IFSC code</Label>
            <Input value={form.dpIfsc} onChange={set("dpIfsc")} className="font-mono-num uppercase" placeholder="HDFC0001234" />
            {ifscError ? <p className="text-[11px] text-[hsl(var(--status-rejected))]">{ifscError}</p> : null}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={mut.isPending}>{mut.isPending ? "Saving…" : "Save terms"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddTrancheDialog({ appId, open, onOpenChange }: { appId: string; open: boolean; onOpenChange: (v: boolean) => void }) {
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<DisbursementMode>("NEFT");
  const [utr, setUtr] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");

  const mut = useDetailMutation(
    appId,
    (body: Record<string, unknown>) => api.post("/api/v1/financials/disbursement", body),
    { successMessage: "Disbursement recorded.", onDone: () => { onOpenChange(false); setAmount(""); setUtr(""); setDate(""); setNote(""); setMode("NEFT"); } },
  );

  function submit() {
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0 || !date) return;
    mut.mutate({
      applicationId: appId,
      amount: Math.round(amt),
      mode,
      utr: utr.trim() || undefined,
      disbursedAt: new Date(date).toISOString(),
      note: note.trim() || undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record disbursement</DialogTitle>
          <DialogDescription>Add a tranche. Home/construction loans can have multiple.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Amount (₹)</Label>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="font-mono-num" />
          </div>
          <div className="space-y-1.5">
            <Label>Mode</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as DisbursementMode)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{MODES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>UTR / Ref no.</Label>
            <Input value={utr} onChange={(e) => setUtr(e.target.value)} className="font-mono-num" />
          </div>
          <div className="space-y-1.5">
            <Label>Disbursed on</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>Note (optional)</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={mut.isPending}>{mut.isPending ? "Saving…" : "Add disbursement"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function FinancialsTab({ app, canManage }: { app: ApplicationDetail; canManage: boolean }) {
  const [termsOpen, setTermsOpen] = useState(false);
  const [trancheOpen, setTrancheOpen] = useState(false);

  const del = useDetailMutation(
    app.id,
    (id: string) => api.delete(`/api/v1/financials/disbursement/${id}`),
    { successMessage: "Disbursement removed." },
  );

  const tranches = [...(app.disbursements ?? [])].sort((a, b) => new Date(b.disbursedAt).getTime() - new Date(a.disbursedAt).getTime());
  const totalDisbursed = tranches.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-4">
      <SectionCard
        title="Sanction Terms · Manjoori"
        action={canManage ? <Button variant="outline" size="sm" onClick={() => setTermsOpen(true)}>Edit terms</Button> : undefined}
      >
        <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4">
          <Field en="Applied Amount" value={formatINR(app.amount)} mono />
          <Field en="Sanctioned" value={app.sanctionedAmount != null ? formatINR(app.sanctionedAmount) : "—"} mono />
          <Field en="Interest Rate" value={app.interestRate != null ? `${app.interestRate}% p.a.` : "—"} mono />
          <Field en="Processing Fee" value={app.processingFee != null ? formatINR(app.processingFee) : "—"} mono />
          <Field en="Tenure" value={`${app.tenureMonths} months`} mono />
          <Field en="EMI" value={app.emi != null ? `${formatINR(app.emi)}/mo` : "—"} mono />
        </div>
      </SectionCard>

      <SectionCard title="Disbursement Account · Khaata Vivaran">
        {app.dpAccountNumber || app.dpBankName ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4">
            <Field en="Bank" value={app.dpBankName ?? "—"} />
            <Field en="Account Holder" value={app.dpAccountHolder ?? "—"} />
            <Field en="Account No." value={app.dpAccountNumber ?? "—"} mono />
            <Field en="IFSC" value={app.dpIfsc ?? "—"} mono />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No disbursement account on file yet.</p>
        )}
      </SectionCard>

      <SectionCard
        title="Disbursements · Vitaran"
        action={canManage ? <Button size="sm" onClick={() => setTrancheOpen(true)}><Plus className="mr-1 h-4 w-4" /> Add</Button> : undefined}
      >
        {tranches.length === 0 ? (
          <EmptyState icon={<Banknote className="h-8 w-8" />} title="No disbursements yet" hint="Record NEFT/RTGS/IMPS/Cheque tranches here." />
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-lg bg-[hsl(var(--status-disbursed)/0.08)] px-3 py-2 text-sm">
              <Receipt className="h-4 w-4 text-[hsl(var(--status-disbursed))]" />
              <span className="text-muted-foreground">Total disbursed</span>
              <span className="ml-auto font-mono-num font-bold text-foreground">{formatINR(totalDisbursed)}</span>
            </div>
            <div className="divide-y divide-border rounded-lg border border-border">
              {tranches.map((t) => (
                <div key={t.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2.5 text-sm">
                  <span className="font-mono-num font-semibold text-foreground">{formatINR(t.amount)}</span>
                  <span className="rounded bg-secondary px-1.5 py-0.5 text-[11px] font-medium text-secondary-foreground">{t.mode}</span>
                  {t.utr ? <span className="font-mono-num text-xs text-muted-foreground">UTR {t.utr}</span> : null}
                  <span className="text-xs text-muted-foreground">{formatDate(t.disbursedAt)}</span>
                  {t.note ? <span className="text-xs text-muted-foreground">· {t.note}</span> : null}
                  {canManage ? (
                    <Button variant="ghost" size="icon" className="ml-auto h-7 w-7 text-muted-foreground hover:text-[hsl(var(--status-rejected))]" disabled={del.isPending} onClick={() => del.mutate(t.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        )}
      </SectionCard>

      {canManage ? <TermsDialog app={app} open={termsOpen} onOpenChange={setTermsOpen} /> : null}
      {canManage ? <AddTrancheDialog appId={app.id} open={trancheOpen} onOpenChange={setTrancheOpen} /> : null}
    </div>
  );
}
