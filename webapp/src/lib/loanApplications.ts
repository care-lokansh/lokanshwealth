import { DOCUMENTS_BUCKET, isSupabaseConfigured, supabase } from "./supabase";
import { api } from "./api";

export interface ApplicationDoc {
  key: string;
  label: string;
  file: File;
}

export interface LoanApplicationInput {
  /** Backend product code (e.g. HOME, LAP, GOLD). */
  loanType: string;
  nameAsPan: string;
  age: string;
  email: string;
  phone: string;
  pan: string;
  aadhaar: string;
  employment: string;
  income: string;
  amount: string;
  /** Loan-specific document checklist files. */
  documents: ApplicationDoc[];
}

// Map any legacy website loan titles to backend product codes. New callers
// already pass codes, so this is just a safety net.
const LOAN_TYPE_CODE: Record<string, string> = {
  "Personal Loan": "SALARIED_PERSONAL",
  "Business Loan": "BUSINESS",
  "Home Loan": "HOME",
  "Loan Against Property": "LAP",
  "Education Loan": "EDUCATION",
  "Two-Wheeler Loan": "TWO_WHEELER",
  "Car Loan": "FOUR_WHEELER",
  "Used Car Loan": "FOUR_WHEELER",
  "Gold Loan": "GOLD",
};

interface PublicDoc { docKey: string; label: string; fileUrl: string; fileName: string }

async function uploadDocument(file: File, key: string, pan: string): Promise<string> {
  if (!supabase) throw new Error("Supabase not configured");
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${pan || "anon"}/${key}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;
  return supabase.storage.from(DOCUMENTS_BUCKET).getPublicUrl(path).data.publicUrl;
}

/**
 * Submits a loan application to the LMS backend so it lands in the shared pool
 * that all workers see. Each checklist document is uploaded to Supabase storage
 * first (when configured) and attached as a URL; without storage the lead still
 * goes through, just without the image files.
 */
export async function submitLoanApplication(
  input: LoanApplicationInput,
): Promise<{ stored: boolean; arn: string }> {
  const documents: PublicDoc[] = [];

  if (isSupabaseConfigured && supabase && input.documents.length) {
    // Best-effort: a failed document upload (blocked third-party host, flaky
    // network, one bad file) must NEVER lose the lead. Upload what we can and
    // still submit the application with whatever succeeded.
    const results = await Promise.allSettled(
      input.documents.map(async (d) => ({
        docKey: d.key,
        label: d.label,
        fileName: d.file.name,
        fileUrl: await uploadDocument(d.file, d.key, input.pan),
      })),
    );
    for (const r of results) {
      if (r.status === "fulfilled") documents.push(r.value);
      else console.error("Document upload failed, submitting lead anyway:", r.reason);
    }
  }

  const res = await api.post<{ id: string; arn: string }>("/api/v1/public/applications", {
    loanType: LOAN_TYPE_CODE[input.loanType] ?? input.loanType,
    fullName: input.nameAsPan,
    mobile: input.phone,
    email: input.email || undefined,
    amount: Number(input.amount),
    age: input.age ? Number(input.age) : undefined,
    pan: input.pan || undefined,
    aadhaar: input.aadhaar || undefined,
    employmentLabel: input.employment || undefined,
    monthlyIncome: input.income ? Number(input.income) : undefined,
    documents: documents.length ? documents : undefined,
  });

  return { stored: true, arn: res.arn };
}
