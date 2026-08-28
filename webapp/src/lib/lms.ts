// ============================================================================
// LMS shared constants, labels, formatters and types for the frontend.
// Mirrors backend/src/types.ts (the API contract).
// ============================================================================

export type Role = "SUPER_ADMIN" | "WORKER" | "APPLICANT";
export type AppStatus = "IN_PROCESS" | "APPROVED" | "REJECTED" | "DISBURSED";
export type Stage =
  | "APPLICATION_RECEIVED" | "DOCUMENT_COLLECTION" | "DOCUMENT_VERIFICATION" | "CREDIT_CHECK"
  | "SENT_TO_LENDER" | "LENDER_REVIEW" | "SANCTION_LETTER_ISSUED" | "LEGAL_TECHNICAL_VERIFICATION"
  | "AGREEMENT_SIGNING" | "DISBURSEMENT_INITIATED" | "DISBURSED" | "CLOSED";
export type DocStatus = "PENDING" | "VERIFIED" | "REJECTED";
export type CallOutcome =
  | "CONNECTED" | "NOT_REACHABLE" | "CALL_BACK_LATER" | "NUMBER_BUSY" | "WRONG_NUMBER" | "SWITCHED_OFF";
export type NoteTag = "NONE" | "URGENT" | "FOLLOW_UP" | "ESCALATED";
export type CommChannel = "SMS" | "EMAIL" | "WHATSAPP";
export type DisbursementMode = "NEFT" | "RTGS" | "IMPS" | "CHEQUE";
export type EmploymentType =
  | "SALARIED" | "SELF_EMPLOYED_PROFESSIONAL" | "SELF_EMPLOYED_BUSINESS" | "AGRICULTURIST" | "PENSIONER";

export const STAGE_ORDER: Stage[] = [
  "APPLICATION_RECEIVED", "DOCUMENT_COLLECTION", "DOCUMENT_VERIFICATION", "CREDIT_CHECK",
  "SENT_TO_LENDER", "LENDER_REVIEW", "SANCTION_LETTER_ISSUED", "LEGAL_TECHNICAL_VERIFICATION",
  "AGREEMENT_SIGNING", "DISBURSEMENT_INITIATED", "DISBURSED", "CLOSED",
];

export const STAGE_LABELS: Record<Stage, string> = {
  APPLICATION_RECEIVED: "Application Received",
  DOCUMENT_COLLECTION: "Document Collection",
  DOCUMENT_VERIFICATION: "Document Verification",
  CREDIT_CHECK: "Credit Check",
  SENT_TO_LENDER: "Sent to Lender",
  LENDER_REVIEW: "Lender Review",
  SANCTION_LETTER_ISSUED: "Sanction Letter Issued",
  LEGAL_TECHNICAL_VERIFICATION: "Legal & Technical Verification",
  AGREEMENT_SIGNING: "Agreement Signing",
  DISBURSEMENT_INITIATED: "Disbursement Initiated",
  DISBURSED: "Disbursed",
  CLOSED: "Closed",
};

export const STATUS_LABELS: Record<AppStatus, string> = {
  IN_PROCESS: "In Process",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  DISBURSED: "Disbursed",
};

// Tailwind classes per status pill (uses scoped --status-* vars).
export const STATUS_PILL: Record<AppStatus, string> = {
  APPROVED: "bg-[hsl(var(--status-approved)/0.12)] text-[hsl(var(--status-approved))] ring-1 ring-inset ring-[hsl(var(--status-approved)/0.25)]",
  IN_PROCESS: "bg-[hsl(var(--status-process)/0.14)] text-[hsl(28_90%_34%)] ring-1 ring-inset ring-[hsl(var(--status-process)/0.3)]",
  REJECTED: "bg-[hsl(var(--status-rejected)/0.12)] text-[hsl(var(--status-rejected))] ring-1 ring-inset ring-[hsl(var(--status-rejected)/0.25)]",
  DISBURSED: "bg-[hsl(var(--status-disbursed)/0.12)] text-[hsl(var(--status-disbursed))] ring-1 ring-inset ring-[hsl(var(--status-disbursed)/0.25)]",
};

export const DOC_STATUS_PILL: Record<DocStatus, string> = {
  VERIFIED: "bg-[hsl(var(--status-approved)/0.12)] text-[hsl(var(--status-approved))] ring-1 ring-inset ring-[hsl(var(--status-approved)/0.25)]",
  PENDING: "bg-[hsl(var(--status-process)/0.14)] text-[hsl(28_90%_34%)] ring-1 ring-inset ring-[hsl(var(--status-process)/0.3)]",
  REJECTED: "bg-[hsl(var(--status-rejected)/0.12)] text-[hsl(var(--status-rejected))] ring-1 ring-inset ring-[hsl(var(--status-rejected)/0.25)]",
};

export const DOC_STATUS_LABELS: Record<DocStatus, string> = {
  PENDING: "Pending Review",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
};

export const CALL_OUTCOME_LABELS: Record<CallOutcome, string> = {
  CONNECTED: "Connected",
  NOT_REACHABLE: "Not Reachable",
  CALL_BACK_LATER: "Call Back Later",
  NUMBER_BUSY: "Number Busy",
  WRONG_NUMBER: "Wrong Number",
  SWITCHED_OFF: "Switched Off",
};

export const EMPLOYMENT_LABELS: Record<EmploymentType, string> = {
  SALARIED: "Salaried",
  SELF_EMPLOYED_PROFESSIONAL: "Self-Employed Professional",
  SELF_EMPLOYED_BUSINESS: "Self-Employed Business",
  AGRICULTURIST: "Agriculturist",
  PENSIONER: "Pensioner",
};

export const NOTE_TAG_LABELS: Record<NoteTag, string> = {
  NONE: "Note",
  URGENT: "Urgent",
  FOLLOW_UP: "Follow-up Required",
  ESCALATED: "Escalated",
};

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman & Nicobar Islands", "Chandigarh", "Dadra & Nagar Haveli and Daman & Diu", "Delhi",
  "Jammu & Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

// ---- Validation regexes (Indian formats) -----------------------------------
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
export const AADHAAR_REGEX = /^[0-9]{12}$/;
export const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
export const MOBILE_REGEX = /^[6-9][0-9]{9}$/;
export const PINCODE_REGEX = /^[1-9][0-9]{5}$/;
/** Application Reference Number, e.g. LMS-2026-123456. */
export const ARN_REGEX = /^LMS-[0-9]{4}-[0-9]{6}$/;

// ---- Business rules --------------------------------------------------------
/** Smallest loan we accept on any product (rupees). Mirrors the backend. */
export const MIN_LOAN_AMOUNT = 1000;

// ============================================================================
// Formatters
// ============================================================================

/** Indian grouping: 12,50,000 (lakh/crore). */
export function formatINR(n: number | null | undefined, withSymbol = true): string {
  if (n == null || isNaN(n)) return withSymbol ? "₹0" : "0";
  const s = Math.round(Math.abs(n)).toString();
  let out: string;
  if (s.length <= 3) {
    out = s;
  } else {
    const last3 = s.slice(-3);
    const rest = s.slice(0, -3);
    out = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + last3;
  }
  const sign = n < 0 ? "-" : "";
  return `${sign}${withSymbol ? "₹" : ""}${out}`;
}

/** Compact lakh/crore label: ₹12.5L, ₹1.25Cr. */
export function formatINRShort(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return "₹0";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_00_00_000) return `${sign}₹${(abs / 1_00_00_000).toFixed(2).replace(/\.00$/, "")}Cr`;
  if (abs >= 1_00_000) return `${sign}₹${(abs / 1_00_000).toFixed(2).replace(/\.00$/, "")}L`;
  if (abs >= 1_000) return `${sign}₹${(abs / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return formatINR(n);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** DD/MM/YYYY. */
export function formatDate(d: string | Date | null | undefined): string {
  if (!d) return "—";
  const dt = typeof d === "string" ? new Date(d) : d;
  if (isNaN(dt.getTime())) return "—";
  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${dt.getFullYear()}`;
}

/** DD Mon YYYY, HH:MM (IST-friendly readable). */
export function formatDateTime(d: string | Date | null | undefined): string {
  if (!d) return "—";
  const dt = typeof d === "string" ? new Date(d) : d;
  if (isNaN(dt.getTime())) return "—";
  const dd = String(dt.getDate()).padStart(2, "0");
  const hh = String(dt.getHours()).padStart(2, "0");
  const mi = String(dt.getMinutes()).padStart(2, "0");
  return `${dd} ${MONTHS[dt.getMonth()]} ${dt.getFullYear()}, ${hh}:${mi}`;
}

export function timeAgo(d: string | Date | null | undefined): string {
  if (!d) return "";
  const dt = typeof d === "string" ? new Date(d) : d;
  const diff = Date.now() - dt.getTime();
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days}d ago`;
  const hrs = Math.floor(diff / 3600000);
  if (hrs > 0) return `${hrs}h ago`;
  const mins = Math.floor(diff / 60000);
  return mins > 0 ? `${mins}m ago` : "just now";
}

/** Mask first 8 digits: XXXX XXXX 1234. */
export function maskAadhaar(aadhaar: string | null | undefined): string {
  if (!aadhaar) return "—";
  const digits = aadhaar.replace(/\D/g, "");
  if (digits.length !== 12) return aadhaar;
  return `XXXX XXXX ${digits.slice(8)}`;
}

export function fullAge(dob: string | Date | null | undefined): number | null {
  if (!dob) return null;
  const dt = typeof dob === "string" ? new Date(dob) : dob;
  if (isNaN(dt.getTime())) return null;
  const diff = Date.now() - dt.getTime();
  return Math.floor(diff / (365.25 * 86400000));
}

// ---- Shared response types -------------------------------------------------
export interface LoanProduct {
  id: string; code: string; name: string; category: string; enabled: boolean;
  minAmount: number; maxAmount: number; processingFeePct: number;
  interestMin: number; interestMax: number; typicalProcessDays: number;
  docChecklist: { key: string; label: string; required: boolean; appliesTo?: EmploymentType[] }[];
  sortOrder: number;
}

export interface MiniUser { id: string; name: string; email?: string; officePhone?: string | null; phone?: string | null; role?: Role; }

export interface ApplicationRow {
  id: string; arn: string; fullName: string; loanType: string; amount: number;
  pan: string | null; mobile: string; cibilScore: number | null; stage: Stage; status: AppStatus;
  createdAt: string; assignedWorkerId: string | null;
  assignedWorker: MiniUser | null; applicant: MiniUser | null;
  _count?: { documents: number; callLogs: number };
}

export interface ApplicationListResponse {
  items: ApplicationRow[]; total: number; page: number; pageSize: number;
}

export interface DocumentRec {
  id: string; docKey: string; label: string; fileUrl: string; fileName: string;
  mimeType: string | null; sizeBytes: number | null; status: DocStatus;
  rejectionReason: string | null; reviewedAt: string | null; uploadedAt: string;
}
export interface CallRec {
  id: string; outcome: CallOutcome; durationMins: number; notes: string | null;
  followUpAt: string | null; calledAt: string; worker: MiniUser;
}
export interface StageRec {
  id: string; fromStage: Stage | null; toStage: Stage; reason: string; changedAt: string; changedBy: MiniUser;
}
export interface DisbursementRec {
  id: string; amount: number; mode: DisbursementMode; utr: string | null;
  disbursedAt: string; note: string | null; createdBy: MiniUser;
}
export interface NoteRec {
  id: string; body: string; tag: NoteTag; createdAt: string; author: MiniUser;
}
export interface CommRec {
  id: string; channel: CommChannel; template: string; subject: string | null;
  body: string; status: string; sentAt: string; sentBy: MiniUser;
}

export interface ApplicationDetail extends ApplicationRow {
  tenureMonths: number; purpose: string | null; existingEmi: number; existingOutstanding: number;
  fatherName: string | null; dob: string | null; gender: string | null; maritalStatus: string | null;
  email: string | null; currentAddress: string | null; currentPincode: string | null;
  permanentAddress: string | null; city: string | null; state: string | null; residentialStatus: string | null;
  aadhaar: string | null; employmentType: EmploymentType | null; employment: Record<string, unknown> | null;
  sanctionedAmount: number | null; interestRate: number | null; processingFee: number | null; emi: number | null;
  dpBankName: string | null; dpAccountNumber: string | null; dpIfsc: string | null; dpAccountHolder: string | null;
  documents: DocumentRec[]; callLogs: CallRec[]; stageHistory: StageRec[];
  disbursements: DisbursementRec[]; notes: NoteRec[]; communications: CommRec[];
}

export interface AnalyticsSummary {
  totalThisMonth: number;
  totalAll: number;
  inPool: number;
  taken: number;
  disbursedThisMonth: number;
  approvalRate: number;
  avgProcessingDays: number;
  byLoanType: { loanType: string; count: number; amount: number }[];
  byStage: { stage: Stage; count: number }[];
  workerProductivity: { id: string; name: string; assigned: number; disbursed: number; avgTat: number }[];
  topPending: { id: string; arn: string; fullName: string; loanType: string; amount: number; stage: Stage; createdAt: string; ageDays: number; assignedWorker: { name: string } | null }[];
}

export interface WorkerRec {
  id: string; name: string; email: string; phone: string | null; officePhone: string | null;
  active: boolean; createdAt: string; _count: { assignedFiles: number };
}

/** Standard EMI (reducing balance). */
export function calculateEmi(principal: number, annualRatePct: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRatePct / 12 / 100;
  if (r === 0) return Math.round(principal / months);
  const f = Math.pow(1 + r, months);
  return Math.round((principal * r * f) / (f - 1));
}
