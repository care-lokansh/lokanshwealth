import { useState } from "react";
import { Pencil } from "lucide-react";
import { api } from "@/lib/api";
import {
  formatINR, formatDate, fullAge, maskAadhaar,
  EMPLOYMENT_LABELS,
  type ApplicationDetail, type EmploymentType, type LoanProduct,
} from "@/lib/lms";
import { Field, SectionCard } from "@/components/lms/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { useDetailMutation } from "./useDetailMutation";

function rupee(n: number | null | undefined): string {
  return n == null ? "—" : formatINR(n);
}

/** Render the employment block, adapting to employmentType. */
function EmploymentBlock({ type, employment }: { type: EmploymentType | null; employment: Record<string, unknown> | null }) {
  if (!type) return <p className="text-sm text-muted-foreground">No employment details captured.</p>;
  const e = employment ?? {};
  const str = (k: string): string => {
    const v = e[k];
    return v == null || v === "" ? "—" : String(v);
  };
  const money = (k: string): string => {
    const v = e[k];
    return typeof v === "number" ? formatINR(v) : v == null || v === "" ? "—" : String(v);
  };

  const fields: { en: string; value: React.ReactNode; mono?: boolean }[] = [];
  if (type === "SALARIED" || type === "PENSIONER") {
    fields.push(
      { en: "Company / Employer", value: str("companyName") },
      { en: "Designation", value: str("designation") },
      { en: "Monthly Income", value: money("monthlySalary") },
      { en: "Salary Mode", value: str("salaryMode") },
      { en: "HR Contact", value: str("hrContact"), mono: true },
    );
  } else if (type === "SELF_EMPLOYED_PROFESSIONAL" || type === "SELF_EMPLOYED_BUSINESS") {
    fields.push(
      { en: "Nature of Business", value: str("natureOfBusiness") },
      { en: "Years in Business", value: str("yearsInBusiness") },
      { en: "Annual Turnover", value: money("annualTurnover") },
      { en: "GST Number", value: str("gstNumber"), mono: true },
      { en: "Udyam Number", value: str("udyamNumber"), mono: true },
    );
  } else if (type === "AGRICULTURIST") {
    fields.push(
      { en: "Land Holding (Acres)", value: str("landAcres") },
      { en: "Crop Type", value: str("cropType") },
      { en: "KCC Number", value: str("kccNumber"), mono: true },
    );
  }

  return (
    <div>
      <div className="mb-3 inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-[11px] font-semibold text-secondary-foreground">
        {EMPLOYMENT_LABELS[type]}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
        {fields.map((f) => (
          <Field key={f.en} en={f.en} value={f.value} mono={f.mono} />
        ))}
      </div>
    </div>
  );
}

interface EditState {
  fullName: string; mobile: string; email: string; city: string; state: string;
  amount: string; tenureMonths: string; cibilScore: string;
}

function EditDialog({ app, open, onOpenChange }: { app: ApplicationDetail; open: boolean; onOpenChange: (v: boolean) => void }) {
  const [form, setForm] = useState<EditState>({
    fullName: app.fullName,
    mobile: app.mobile,
    email: app.email ?? "",
    city: app.city ?? "",
    state: app.state ?? "",
    amount: String(app.amount),
    tenureMonths: String(app.tenureMonths),
    cibilScore: app.cibilScore == null ? "" : String(app.cibilScore),
  });

  const mut = useDetailMutation(
    app.id,
    (body: Record<string, unknown>) => api.patch(`/api/v1/applications/${app.id}`, body),
    { successMessage: "Applicant details updated.", onDone: () => onOpenChange(false) },
  );

  function submit() {
    const amount = Number(form.amount);
    const tenureMonths = Number(form.tenureMonths);
    if (!form.fullName.trim()) return;
    if (!Number.isFinite(amount) || amount <= 0) return;
    if (!Number.isFinite(tenureMonths) || tenureMonths <= 0) return;
    mut.mutate({
      fullName: form.fullName.trim(),
      mobile: form.mobile.trim(),
      email: form.email.trim() || null,
      city: form.city.trim() || null,
      state: form.state.trim() || null,
      amount,
      tenureMonths,
      cibilScore: form.cibilScore.trim() === "" ? null : Number(form.cibilScore),
    });
  }

  const set = (k: keyof EditState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit applicant details</DialogTitle>
          <DialogDescription>Admin override of core file fields.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2 space-y-1.5">
            <Label>Full name</Label>
            <Input value={form.fullName} onChange={set("fullName")} />
          </div>
          <div className="space-y-1.5">
            <Label>Mobile</Label>
            <Input value={form.mobile} onChange={set("mobile")} className="font-mono-num" />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={form.email} onChange={set("email")} />
          </div>
          <div className="space-y-1.5">
            <Label>City</Label>
            <Input value={form.city} onChange={set("city")} />
          </div>
          <div className="space-y-1.5">
            <Label>State</Label>
            <Input value={form.state} onChange={set("state")} />
          </div>
          <div className="space-y-1.5">
            <Label>Loan amount (₹)</Label>
            <Input type="number" value={form.amount} onChange={set("amount")} className="font-mono-num" />
          </div>
          <div className="space-y-1.5">
            <Label>Tenure (months)</Label>
            <Input type="number" value={form.tenureMonths} onChange={set("tenureMonths")} className="font-mono-num" />
          </div>
          <div className="space-y-1.5">
            <Label>CIBIL score</Label>
            <Input type="number" value={form.cibilScore} onChange={set("cibilScore")} className="font-mono-num" placeholder="e.g. 760" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={mut.isPending}>{mut.isPending ? "Saving…" : "Save changes"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function OverviewTab({ app, isAdmin, productName }: { app: ApplicationDetail; isAdmin: boolean; productName: string }) {
  const [editOpen, setEditOpen] = useState(false);
  const age = fullAge(app.dob);

  return (
    <div className="space-y-4">
      <SectionCard
        title="Personal Details"
        action={isAdmin ? (
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit details
          </Button>
        ) : undefined}
      >
        <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
          <Field en="Full Name" hi="Pura Naam" value={app.fullName} />
          <Field en="Father's Name" value={app.fatherName ?? "—"} />
          <Field en="Date of Birth" value={app.dob ? `${formatDate(app.dob)}${age != null ? ` · ${age} yrs` : ""}` : "—"} />
          <Field en="Gender" value={app.gender ?? "—"} />
          <Field en="Marital Status" value={app.maritalStatus ?? "—"} />
          <Field en="Mobile" hi="Mobile Number" value={app.mobile} mono />
          <Field en="Email" value={app.email ?? "—"} />
          <Field en="Residential Status" value={app.residentialStatus ?? "—"} />
        </div>
      </SectionCard>

      <SectionCard title="Address · Pata">
        <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
          <Field en="Current Address" value={app.currentAddress ?? "—"} />
          <Field en="Permanent Address" value={app.permanentAddress ?? "—"} />
          <Field en="City" value={app.city ?? "—"} />
          <Field en="State" value={app.state ?? "—"} />
          <Field en="Pincode" value={app.currentPincode ?? "—"} mono />
        </div>
      </SectionCard>

      <SectionCard title="KYC · Pehchaan">
        <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
          <Field en="PAN" hi="PAN" value={app.pan ?? "—"} mono />
          <Field en="Aadhaar" hi="Aadhaar" value={maskAadhaar(app.aadhaar)} mono />
        </div>
      </SectionCard>

      <SectionCard title="Employment · Rozgaar">
        <EmploymentBlock type={app.employmentType} employment={app.employment} />
      </SectionCard>

      <SectionCard title="Loan Details · Rin Vivaran">
        <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
          <Field en="Loan Product" value={productName} />
          <Field en="Requested Amount" value={formatINR(app.amount)} mono />
          <Field en="Tenure" value={`${app.tenureMonths} months`} mono />
          <Field en="Purpose" value={app.purpose ?? "—"} />
          <Field en="Existing EMI" value={rupee(app.existingEmi)} mono />
          <Field en="Existing Outstanding" value={rupee(app.existingOutstanding)} mono />
        </div>
      </SectionCard>

      {isAdmin ? <EditDialog app={app} open={editOpen} onOpenChange={setEditOpen} /> : null}
    </div>
  );
}
