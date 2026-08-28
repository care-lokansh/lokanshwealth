import { api } from "./api";
import { ARN_REGEX, MOBILE_REGEX, type AppStatus, type DocStatus, type Stage } from "./lms";

/** Applicant-safe view of an application. Mirrors backend TrackedApplicationSchema. */
export interface TrackedApplication {
  arn: string;
  loanType: string;
  loanTypeName: string;
  amount: number;
  tenureMonths: number;
  status: AppStatus;
  stage: Stage;
  applicantName: string;
  submittedAt: string;
  updatedAt: string;
  sanctionedAmount: number | null;
  interestRate: number | null;
  emi: number | null;
  documents: {
    label: string;
    status: DocStatus;
    rejectionReason: string | null;
    uploadedAt: string;
    reviewedAt: string | null;
  }[];
  disbursements: {
    amount: number;
    mode: "NEFT" | "RTGS" | "IMPS" | "CHEQUE";
    utr: string | null;
    disbursedAt: string;
    note: string | null;
  }[];
  timeline: { stage: Stage; at: string }[];
  manager: { name: string; phone: string | null } | null;
}

/** Normalises "+91 98765 43210" / "lms-2026-123456" before we validate it. */
export function normaliseTrackQuery(raw: string): string {
  const trimmed = raw.trim();
  const digits = trimmed.replace(/\D/g, "");
  const mobile = digits.length > 10 ? digits.slice(-10) : digits;
  if (MOBILE_REGEX.test(mobile)) return mobile;
  return trimmed.toUpperCase().replace(/\s+/g, "");
}

/** True when the input looks like something the backend can search on. */
export function isValidTrackQuery(raw: string): boolean {
  const q = normaliseTrackQuery(raw);
  return MOBILE_REGEX.test(q) || ARN_REGEX.test(q);
}

export async function trackApplications(query: string): Promise<TrackedApplication[]> {
  return api.post<TrackedApplication[]>("/api/v1/public/track", {
    query: normaliseTrackQuery(query),
  });
}
