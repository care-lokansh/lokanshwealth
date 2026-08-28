import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, ArrowLeft, CheckCircle2, Copy, Loader2, ShieldCheck, Clock, Percent, IndianRupee } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { LoanApplicationProvider } from "@/components/landing/application/LoanApplicationContext";
import { FileUpload } from "@/components/landing/application/FileUpload";
import { LOAN_TYPES, LOAN_BY_CODE } from "@/components/landing/loans";
import { useProducts, formatRate, type PublicProduct } from "@/hooks/useProducts";
import { submitLoanApplication, type ApplicationDoc } from "@/lib/loanApplications";
import { MIN_LOAN_AMOUNT, formatINR } from "@/lib/lms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const EMPLOYMENT = ["Salaried", "Self-employed / Business", "Non-salaried", "Student / Retired"];
const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

type EmpEnum = "SALARIED" | "SELF_EMPLOYED_PROFESSIONAL" | "SELF_EMPLOYED_BUSINESS" | "AGRICULTURIST" | "PENSIONER";

function mapEmployment(label: string): EmpEnum | undefined {
  if (label.includes("Salaried")) return "SALARIED";
  if (label.includes("Self-employed")) return "SELF_EMPLOYED_BUSINESS";
  if (label.includes("Non-salaried")) return "SELF_EMPLOYED_BUSINESS";
  if (label.includes("Student") || label.includes("Retired")) return "PENSIONER";
  return undefined;
}

// Minimal checklist used until live product data loads.
const FALLBACK_DOCS = [
  { key: "pan", label: "PAN Card", required: true },
  { key: "aadhaar_front", label: "Aadhaar Card (Front)", required: true },
  { key: "aadhaar_back", label: "Aadhaar Card (Back)", required: true },
  { key: "photo", label: "Passport Size Photograph", required: true },
];

interface FormState {
  loanCode: string;
  nameAsPan: string;
  age: string;
  email: string;
  phone: string;
  pan: string;
  aadhaar: string;
  employment: string;
  income: string;
  amount: string;
  declaration: boolean;
}

export default function Apply() {
  return (
    <LoanApplicationProvider>
      <div className="min-h-screen bg-background">
        <Navbar />
        <ApplyBody />
        <Footer />
      </div>
    </LoanApplicationProvider>
  );
}

function ApplyBody() {
  const { code } = useParams<{ code: string }>();
  const { byCode } = useProducts();

  const initialCode = code && LOAN_BY_CODE[code] ? code : "";
  const [form, setForm] = useState<FormState>({
    loanCode: initialCode,
    nameAsPan: "",
    age: "",
    email: "",
    phone: "",
    pan: "",
    aadhaar: "",
    employment: "",
    income: "",
    amount: "",
    declaration: false,
  });
  const [docFiles, setDocFiles] = useState<Record<string, File | null>>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [arn, setArn] = useState<string | null>(null);

  const loan = LOAN_BY_CODE[form.loanCode];
  const product: PublicProduct | undefined = byCode[form.loanCode];
  const checklistSource = product?.docChecklist ?? FALLBACK_DOCS;

  const emp = mapEmployment(form.employment);
  const visibleDocs = checklistSource.filter((d) => {
    if (!d.appliesTo || d.appliesTo.length === 0) return true;
    return emp ? d.appliesTo.includes(emp) : false;
  });

  const mutation = useMutation({
    mutationFn: submitLoanApplication,
    onSuccess: (res) => {
      setArn(res.arn);
      window.scrollTo({ top: 0 });
      toast.success("Application submitted! Our team will reach out shortly.");
    },
    onError: (err) =>
      toast.error(
        err instanceof Error && err.message
          ? `Couldn't submit: ${err.message}`
          : "Something went wrong while submitting. Please try again.",
      ),
  });

  function set<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: false }));
  }
  function setDoc(key: string, file: File | null) {
    setDocFiles((d) => ({ ...d, [key]: file }));
    setErrors((e) => ({ ...e, [`doc_${key}`]: false }));
  }

  function validate(): string | null {
    const e: Record<string, boolean> = {};
    if (!form.loanCode) e.loanCode = true;
    if (form.nameAsPan.trim().length < 3) e.nameAsPan = true;
    const ageNum = Number(form.age);
    if (!form.age || ageNum < 18 || ageNum > 75) e.age = true;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = true;
    if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone = true;
    if (!PAN_RE.test(form.pan)) e.pan = true;
    if (form.aadhaar.length !== 12) e.aadhaar = true;
    if (!form.employment) e.employment = true;
    if (!form.amount || Number(form.amount) < MIN_LOAN_AMOUNT) e.amount = true;
    for (const d of visibleDocs) {
      if (d.required && !docFiles[d.key]) e[`doc_${d.key}`] = true;
    }
    if (!form.declaration) e.declaration = true;
    setErrors(e);

    if (Object.keys(e).length === 0) return null;
    if (e.loanCode) return "Please select a loan type.";
    if (e.phone) return "Enter a valid 10-digit mobile number starting with 6-9.";
    if (e.pan) return "Enter a valid PAN (e.g. ABCDE1234F).";
    if (e.aadhaar) return "Aadhaar must be 12 digits.";
    if (e.age) return "Applicant age must be between 18 and 75.";
    if (e.amount) return `Loan amount must be at least ${formatINR(MIN_LOAN_AMOUNT)}.`;
    if (Object.keys(e).some((k) => k.startsWith("doc_"))) return "Please upload all required documents.";
    if (e.declaration) return "Please accept the declaration to continue.";
    return "Please fill all required fields correctly.";
  }

  function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }
    const documents: ApplicationDoc[] = visibleDocs
      .filter((d) => docFiles[d.key])
      .map((d) => ({ key: d.key, label: d.label, file: docFiles[d.key] as File }));

    mutation.mutate({
      loanType: form.loanCode,
      nameAsPan: form.nameAsPan,
      age: form.age,
      email: form.email,
      phone: form.phone,
      pan: form.pan,
      aadhaar: form.aadhaar,
      employment: form.employment,
      income: form.income,
      amount: form.amount,
      documents,
    });
  }

  if (arn) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-5 py-24 text-center">
        <div className="grid h-20 w-20 place-items-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-10 w-10 text-primary" />
        </div>
        <h1 className="mt-7 font-display text-4xl font-semibold text-foreground">
          Thank you, {form.nameAsPan.split(" ")[0]}!
        </h1>
        <p className="mt-4 max-w-md text-lg text-muted-foreground">
          Your application for a {loan?.title ?? "loan"} has been received. A relationship
          manager will call you on {form.phone} within one working day.
        </p>

        {/* Reference number — the applicant's handle on this specific file. */}
        <div className="mt-8 w-full rounded-2xl border border-border bg-card p-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Your reference number
          </p>
          <p className="mt-2 select-all font-display text-3xl font-semibold tracking-tight text-primary">
            {arn}
          </p>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard
                ?.writeText(arn)
                .then(() => toast.success("Reference number copied"))
                .catch(() => toast.error("Couldn't copy — please note it down"));
            }}
            className="mx-auto mt-3 flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <Copy className="h-3.5 w-3.5" /> Copy
          </button>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Save this number. You can check your status any time — no login needed — with
            this number or with your mobile number {form.phone}.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="rounded-full px-8 text-base">
            <Link to={`/track?q=${encodeURIComponent(arn)}`}>Track my application</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full px-8 text-base">
            <Link to="/">Back to home</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-5 pb-20 pt-24 sm:pt-28">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to home
      </Link>

      {/* Loan header */}
      <div className="mt-5 overflow-hidden rounded-3xl border border-border bg-primary px-7 py-8 text-primary-foreground sm:px-10 sm:py-10">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Loan application</p>
        <h1 className="mt-2 font-display text-4xl font-semibold leading-tight sm:text-5xl">
          {loan ? loan.title : "Apply for a Loan"}
        </h1>
        {loan ? (
          <p className="mt-3 max-w-xl text-lg leading-relaxed text-primary-foreground/80">
            {loan.blurb}
          </p>
        ) : null}

        {product ? (
          <div className="mt-6 flex flex-wrap gap-3">
            <Stat icon={Percent} label="Interest" value={formatRate(product)} />
            <Stat icon={IndianRupee} label="Processing fee" value={`${product.processingFeePct}%`} />
            <Stat icon={Clock} label="Approval" value={`~${product.typicalProcessDays} days`} />
          </div>
        ) : null}
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        <Field label="Loan category" required error={errors.loanCode}>
          <Select value={form.loanCode} onValueChange={(v) => set("loanCode", v)}>
            <SelectTrigger className={cn("h-12 text-base", errors.loanCode && "border-destructive")}>
              <SelectValue placeholder="Select a loan" />
            </SelectTrigger>
            <SelectContent>
              {LOAN_TYPES.map((l) => (
                <SelectItem key={l.code} value={l.code} className="text-base">
                  {l.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Name (as per PAN)" required error={errors.nameAsPan}>
          <Input
            placeholder="e.g. AARAV SHARMA"
            value={form.nameAsPan}
            onChange={(e) => set("nameAsPan", e.target.value)}
            className={cn("h-12 text-base", errors.nameAsPan && "border-destructive")}
          />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Age" required error={errors.age}>
            <Input
              type="number"
              inputMode="numeric"
              placeholder="e.g. 30"
              value={form.age}
              onChange={(e) => set("age", e.target.value.replace(/\D/g, "").slice(0, 2))}
              className={cn("h-12 text-base", errors.age && "border-destructive")}
            />
          </Field>
          <Field label="Mobile number" required error={errors.phone}>
            <Input
              type="tel"
              inputMode="numeric"
              placeholder="10-digit mobile"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
              className={cn("h-12 text-base", errors.phone && "border-destructive")}
            />
          </Field>
        </div>

        <Field label="Email address" required error={errors.email}>
          <Input
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            className={cn("h-12 text-base", errors.email && "border-destructive")}
          />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="PAN number" required error={errors.pan}>
            <Input
              placeholder="ABCDE1234F"
              value={form.pan}
              onChange={(e) =>
                set("pan", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10))
              }
              className={cn("h-12 text-base uppercase", errors.pan && "border-destructive")}
            />
          </Field>
          <Field label="Aadhaar number" required error={errors.aadhaar}>
            <Input
              inputMode="numeric"
              placeholder="12-digit Aadhaar"
              value={form.aadhaar}
              onChange={(e) => set("aadhaar", e.target.value.replace(/\D/g, "").slice(0, 12))}
              className={cn("h-12 text-base", errors.aadhaar && "border-destructive")}
            />
          </Field>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Employment type" required error={errors.employment}>
            <Select value={form.employment} onValueChange={(v) => set("employment", v)}>
              <SelectTrigger className={cn("h-12 text-base", errors.employment && "border-destructive")}>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {EMPLOYMENT.map((opt) => (
                  <SelectItem key={opt} value={opt} className="text-base">
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Monthly income (₹)">
            <Input
              inputMode="numeric"
              placeholder="e.g. 50000"
              value={form.income}
              onChange={(e) => set("income", e.target.value.replace(/\D/g, ""))}
              className="h-12 text-base"
            />
          </Field>
        </div>

        <Field label="Loan amount required (₹)" required error={errors.amount}>
          <Input
            inputMode="numeric"
            placeholder="e.g. 500000"
            value={form.amount}
            onChange={(e) => set("amount", e.target.value.replace(/\D/g, ""))}
            className={cn("h-12 text-base", errors.amount && "border-destructive")}
          />
          <p className="text-sm text-muted-foreground">
            Minimum {formatINR(MIN_LOAN_AMOUNT)}
            {form.amount && Number(form.amount) >= MIN_LOAN_AMOUNT
              ? ` · You entered ${formatINR(Number(form.amount))}`
              : ""}
          </p>
        </Field>

        {/* Documents — specific to this loan */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-display text-xl font-semibold text-foreground">
            Documents required
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {form.employment
              ? "As per Indian lending norms for this loan and your profile."
              : "Select your employment type above to see the full checklist."}
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {visibleDocs.map((d) => (
              <FileUpload
                key={d.key}
                label={`${d.label}${d.required ? " *" : ""}`}
                file={docFiles[d.key] ?? null}
                onChange={(f) => setDoc(d.key, f)}
                error={errors[`doc_${d.key}`]}
              />
            ))}
          </div>
        </div>

        {/* Declaration */}
        <label
          className={cn(
            "flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card p-4",
            errors.declaration && "border-destructive",
          )}
        >
          <Checkbox
            checked={form.declaration}
            onCheckedChange={(v) => set("declaration", v === true)}
            className="mt-0.5"
          />
          <span className="text-sm leading-relaxed text-muted-foreground">
            I hereby declare that the information provided is true and correct. I authorise
            Lokansh Wealth and its lending partners to use my PAN, Aadhaar and uploaded documents
            to verify my identity, check my credit profile and process this loan application.
          </span>
        </label>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
          Your documents are encrypted and never shared without your consent.
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={mutation.isPending}
          className="group h-14 w-full rounded-full text-base"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="mr-1 h-5 w-5 animate-spin" /> Submitting…
            </>
          ) : (
            <>
              Submit application
              <ArrowRight className="ml-1 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </Button>
      </form>
    </main>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-primary-foreground/10 px-4 py-2.5">
      <Icon className="h-4 w-4 text-accent" />
      <div className="leading-tight">
        <p className="text-[11px] uppercase tracking-wide text-primary-foreground/60">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

function Field({
  label, required, error, children,
}: {
  label: string;
  required?: boolean;
  error?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className={cn("text-base", error && "text-destructive")}>
        {label} {required ? <span className="text-accent">*</span> : null}
      </Label>
      {children}
    </div>
  );
}
