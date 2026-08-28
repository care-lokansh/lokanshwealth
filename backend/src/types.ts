import { z } from "zod";

// ============================================================================
// Shared API contracts (single source of truth for backend + frontend).
// All app routes return { data: ... }. Errors return { error: { message, code } }.
// ============================================================================

// ---- Indian-format validation regexes -------------------------------------
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
export const AADHAAR_REGEX = /^[0-9]{12}$/;
export const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
export const MOBILE_REGEX = /^[6-9][0-9]{9}$/;
export const PINCODE_REGEX = /^[1-9][0-9]{5}$/;
/** Application Reference Number, e.g. LMS-2026-123456. */
export const ARN_REGEX = /^LMS-[0-9]{4}-[0-9]{6}$/;

// ---- Business rules --------------------------------------------------------
/** Smallest loan we accept on any product (rupees). */
export const MIN_LOAN_AMOUNT = 1000;

// ---- Enums (mirror Prisma) -------------------------------------------------
export const RoleEnum = z.enum(["SUPER_ADMIN", "WORKER", "APPLICANT"]);
export const AppStatusEnum = z.enum(["IN_PROCESS", "APPROVED", "REJECTED", "DISBURSED"]);
export const StageEnum = z.enum([
  "APPLICATION_RECEIVED",
  "DOCUMENT_COLLECTION",
  "DOCUMENT_VERIFICATION",
  "CREDIT_CHECK",
  "SENT_TO_LENDER",
  "LENDER_REVIEW",
  "SANCTION_LETTER_ISSUED",
  "LEGAL_TECHNICAL_VERIFICATION",
  "AGREEMENT_SIGNING",
  "DISBURSEMENT_INITIATED",
  "DISBURSED",
  "CLOSED",
]);
export const GenderEnum = z.enum(["MALE", "FEMALE", "OTHER"]);
export const MaritalStatusEnum = z.enum(["SINGLE", "MARRIED", "OTHER"]);
export const ResidentialStatusEnum = z.enum(["OWNED", "RENTED"]);
export const EmploymentTypeEnum = z.enum([
  "SALARIED",
  "SELF_EMPLOYED_PROFESSIONAL",
  "SELF_EMPLOYED_BUSINESS",
  "AGRICULTURIST",
  "PENSIONER",
]);
export const DocStatusEnum = z.enum(["PENDING", "VERIFIED", "REJECTED"]);
export const CallOutcomeEnum = z.enum([
  "CONNECTED",
  "NOT_REACHABLE",
  "CALL_BACK_LATER",
  "NUMBER_BUSY",
  "WRONG_NUMBER",
  "SWITCHED_OFF",
]);
export const NoteTagEnum = z.enum(["NONE", "URGENT", "FOLLOW_UP", "ESCALATED"]);
export const CommChannelEnum = z.enum(["SMS", "EMAIL", "WHATSAPP"]);
export const CommStatusEnum = z.enum(["QUEUED", "SENT", "DELIVERED", "FAILED"]);
export const DisbursementModeEnum = z.enum(["NEFT", "RTGS", "IMPS", "CHEQUE"]);

// Ordered pipeline used for progress UIs and forward/back transitions.
export const STAGE_ORDER = StageEnum.options;
export type Stage = z.infer<typeof StageEnum>;

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

// ---- Employment detail (type-specific, kept as JSON) -----------------------
export const EmploymentDetailSchema = z.object({
  // Salaried
  companyName: z.string().optional(),
  designation: z.string().optional(),
  doj: z.string().optional(), // ISO date
  monthlySalary: z.number().int().nonnegative().optional(),
  salaryMode: z.enum(["BANK_TRANSFER", "CASH"]).optional(),
  hrContact: z.string().optional(),
  // Self-employed
  natureOfBusiness: z.string().optional(),
  yearsInBusiness: z.number().nonnegative().optional(),
  annualTurnover: z.number().int().nonnegative().optional(),
  gstNumber: z.string().optional(),
  udyamNumber: z.string().optional(),
  // Agriculturist
  landAcres: z.number().nonnegative().optional(),
  cropType: z.string().optional(),
  kccNumber: z.string().optional(),
});
export type EmploymentDetail = z.infer<typeof EmploymentDetailSchema>;

// ---- Loan product (catalogue) ----------------------------------------------
export const DocChecklistItemSchema = z.object({
  key: z.string(),
  label: z.string(),
  required: z.boolean().default(true),
  appliesTo: z.array(EmploymentTypeEnum).optional(), // null = all employment types
});
export type DocChecklistItem = z.infer<typeof DocChecklistItemSchema>;

export const ProductUpdateSchema = z.object({
  enabled: z.boolean().optional(),
  minAmount: z.number().int().positive().optional(),
  maxAmount: z.number().int().positive().optional(),
  processingFeePct: z.number().min(0).max(10).optional(),
  interestMin: z.number().min(0).max(60).optional(),
  interestMax: z.number().min(0).max(60).optional(),
  typicalProcessDays: z.number().int().positive().optional(),
});

// ---- Public product (marketing website) ------------------------------------
// Shape returned by GET /api/v1/public/products. Lets the website show live
// rates and per-loan document checklists straight from the admin-managed DB.
export const PublicProductSchema = z.object({
  code: z.string(),
  name: z.string(),
  category: z.string(),
  minAmount: z.number(),
  maxAmount: z.number(),
  processingFeePct: z.number(),
  interestMin: z.number(),
  interestMax: z.number(),
  typicalProcessDays: z.number(),
  docChecklist: z.array(DocChecklistItemSchema),
  sortOrder: z.number(),
});
export type PublicProduct = z.infer<typeof PublicProductSchema>;

// ---- Application: applicant submission --------------------------------------
export const CreateApplicationSchema = z.object({
  // Step 1 — personal
  fullName: z.string().min(2),
  fatherName: z.string().optional(),
  dob: z.string().optional(),
  gender: GenderEnum.optional(),
  maritalStatus: MaritalStatusEnum.optional(),
  mobile: z.string().regex(MOBILE_REGEX, "Enter a valid 10-digit mobile number"),
  email: z.string().email().optional().or(z.literal("")),
  currentAddress: z.string().optional(),
  currentPincode: z.string().regex(PINCODE_REGEX, "Invalid pincode").optional().or(z.literal("")),
  permanentAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  residentialStatus: ResidentialStatusEnum.optional(),
  // KYC
  pan: z.string().regex(PAN_REGEX, "Invalid PAN (e.g. ABCDE1234F)").optional().or(z.literal("")),
  aadhaar: z.string().regex(AADHAAR_REGEX, "Aadhaar must be 12 digits").optional().or(z.literal("")),
  // Step 2 — employment
  employmentType: EmploymentTypeEnum.optional(),
  employment: EmploymentDetailSchema.optional(),
  // Step 3 — loan
  loanType: z.string().min(1),
  amount: z.number().int().positive(),
  tenureMonths: z.number().int().positive(),
  purpose: z.string().optional(),
  existingEmi: z.number().int().nonnegative().default(0),
  existingOutstanding: z.number().int().nonnegative().default(0),
  // Step 5 — declaration
  cibilConsent: z.literal(true, { message: "CIBIL consent is required" } as any),
  declaration: z.literal(true, { message: "Declaration is required" } as any),
});
export type CreateApplicationInput = z.infer<typeof CreateApplicationSchema>;

// ---- Application: PUBLIC website submission (no login) -----------------------
// Lean schema for the marketing-site "Apply Now" form. Lands in the shared pool
// (unassigned) so any worker can pick it up.
export const PublicDocumentSchema = z.object({
  docKey: z.string(),
  label: z.string(),
  fileUrl: z.string().url(),
  fileName: z.string(),
});
export const PublicApplicationSchema = z.object({
  loanType: z.string().min(1),
  fullName: z.string().min(2),
  mobile: z.string().regex(MOBILE_REGEX, "Enter a valid 10-digit mobile number"),
  email: z.string().email().optional().or(z.literal("")),
  // Floor of ₹1,000. Capped at ₹100 crore — amounts stay well under the Postgres
  // Int (int4) max of 2,147,483,647; anything larger overflows the column on write.
  amount: z
    .number()
    .int()
    .min(MIN_LOAN_AMOUNT, "Minimum loan amount is ₹1,000")
    .max(1_000_000_000, "Loan amount is too large"),
  tenureMonths: z.number().int().positive().max(600).optional(),
  age: z.number().int().min(18).max(75).optional(),
  pan: z.string().optional().or(z.literal("")),
  aadhaar: z.string().optional().or(z.literal("")),
  employmentType: EmploymentTypeEnum.optional(),
  employmentLabel: z.string().optional(), // free-text from the website form
  monthlyIncome: z.number().int().nonnegative().max(1_000_000_000).optional(),
  purpose: z.string().optional(),
  documents: z.array(PublicDocumentSchema).optional(),
});
export type PublicApplicationInput = z.infer<typeof PublicApplicationSchema>;

// ---- Public application tracking (no login) ---------------------------------
// Applicants look up their files with either their registered mobile number or
// a single Application Reference Number. Sent as a POST body so the mobile
// number never lands in URLs, access logs or the browser history.
export const TrackQuerySchema = z.object({
  query: z.string().min(6, "Enter your mobile number or reference number").max(40),
});
export type TrackQueryInput = z.infer<typeof TrackQuerySchema>;

/** Applicant-safe view of an application — no PAN, Aadhaar or internal notes. */
export const TrackedApplicationSchema = z.object({
  arn: z.string(),
  loanType: z.string(),
  loanTypeName: z.string(),
  amount: z.number(),
  tenureMonths: z.number(),
  status: AppStatusEnum,
  stage: StageEnum,
  applicantName: z.string(),
  submittedAt: z.string(),
  updatedAt: z.string(),
  sanctionedAmount: z.number().nullable(),
  interestRate: z.number().nullable(),
  emi: z.number().nullable(),
  documents: z.array(
    z.object({
      label: z.string(),
      status: DocStatusEnum,
      rejectionReason: z.string().nullable(),
      uploadedAt: z.string(),
      reviewedAt: z.string().nullable(),
    }),
  ),
  disbursements: z.array(
    z.object({
      amount: z.number(),
      mode: DisbursementModeEnum,
      utr: z.string().nullable(),
      disbursedAt: z.string(),
      note: z.string().nullable(),
    }),
  ),
  timeline: z.array(z.object({ stage: StageEnum, at: z.string() })),
  manager: z.object({ name: z.string(), phone: z.string().nullable() }).nullable(),
});
export type TrackedApplication = z.infer<typeof TrackedApplicationSchema>;

// ---- Application: admin/worker edits ----------------------------------------
export const UpdateApplicationSchema = z.object({
  fullName: z.string().min(2).optional(),
  fatherName: z.string().optional(),
  dob: z.string().optional(),
  gender: GenderEnum.optional(),
  maritalStatus: MaritalStatusEnum.optional(),
  mobile: z.string().regex(MOBILE_REGEX).optional(),
  email: z.string().email().optional().or(z.literal("")),
  currentAddress: z.string().optional(),
  currentPincode: z.string().optional(),
  permanentAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  residentialStatus: ResidentialStatusEnum.optional(),
  pan: z.string().optional(),
  aadhaar: z.string().optional(),
  employmentType: EmploymentTypeEnum.optional(),
  employment: EmploymentDetailSchema.optional(),
  loanType: z.string().optional(),
  amount: z.number().int().positive().optional(),
  tenureMonths: z.number().int().positive().optional(),
  purpose: z.string().optional(),
  existingEmi: z.number().int().nonnegative().optional(),
  existingOutstanding: z.number().int().nonnegative().optional(),
  cibilScore: z.number().int().min(300).max(900).nullable().optional(),
  status: AppStatusEnum.optional(),
});

export const AssignWorkerSchema = z.object({
  applicationIds: z.array(z.string()).min(1),
  workerId: z.string().nullable(),
});

// ---- Documents --------------------------------------------------------------
export const DocumentCreateSchema = z.object({
  applicationId: z.string(),
  docKey: z.string(),
  label: z.string(),
  fileUrl: z.string().url(),
  fileName: z.string(),
  mimeType: z.string().optional(),
  sizeBytes: z.number().int().optional(),
});
export const DocumentReviewSchema = z.object({
  status: DocStatusEnum,
  rejectionReason: z.string().optional(),
});

// ---- Call log ---------------------------------------------------------------
export const CallLogCreateSchema = z.object({
  applicationId: z.string(),
  outcome: CallOutcomeEnum,
  durationMins: z.number().int().nonnegative().default(0),
  notes: z.string().optional(),
  followUpAt: z.string().optional(), // ISO datetime
});

// ---- Stage transition -------------------------------------------------------
export const StageChangeSchema = z.object({
  applicationId: z.string(),
  toStage: StageEnum,
  reason: z.string().min(1, "Reason is required"),
});

// ---- Financials & disbursement ---------------------------------------------
export const FinancialsUpdateSchema = z.object({
  sanctionedAmount: z.number().int().nonnegative().nullable().optional(),
  interestRate: z.number().min(0).max(60).nullable().optional(),
  processingFee: z.number().int().nonnegative().nullable().optional(),
  dpBankName: z.string().optional(),
  dpAccountNumber: z.string().optional(),
  dpIfsc: z.string().regex(IFSC_REGEX, "Invalid IFSC code").optional().or(z.literal("")),
  dpAccountHolder: z.string().optional(),
});

export const DisbursementCreateSchema = z.object({
  applicationId: z.string(),
  amount: z.number().int().positive(),
  mode: DisbursementModeEnum,
  utr: z.string().optional(),
  disbursedAt: z.string(), // ISO date
  note: z.string().optional(),
});

// ---- Notes ------------------------------------------------------------------
export const NoteCreateSchema = z.object({
  applicationId: z.string(),
  body: z.string().min(1),
  tag: NoteTagEnum.default("NONE"),
});

// ---- Communications ---------------------------------------------------------
export const CommunicationCreateSchema = z.object({
  applicationId: z.string(),
  channel: CommChannelEnum,
  template: z.string(),
  subject: z.string().optional(),
  body: z.string().min(1),
});

// ---- Workers (admin) --------------------------------------------------------
export const WorkerCreateSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  officePhone: z.string().optional(),
});
export const WorkerUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  officePhone: z.string().optional(),
  active: z.boolean().optional(),
});
export const ResetPasswordSchema = z.object({ password: z.string().min(8) });

// ---- Helpers ---------------------------------------------------------------

/** EMI using the standard reducing-balance formula. principal in rupees, annualRate %, months. */
export function calculateEmi(principal: number, annualRatePct: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRatePct / 12 / 100;
  if (r === 0) return Math.round(principal / months);
  const f = Math.pow(1 + r, months);
  return Math.round((principal * r * f) / (f - 1));
}
