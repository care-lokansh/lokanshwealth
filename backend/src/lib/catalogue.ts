import type { DocChecklistItem } from "../types";

// ---- Reusable document checklist fragments ---------------------------------
const COMMON_DOCS: DocChecklistItem[] = [
  { key: "pan", label: "PAN Card", required: true },
  { key: "aadhaar_front", label: "Aadhaar Card (Front)", required: true },
  { key: "aadhaar_back", label: "Aadhaar Card (Back)", required: true },
  { key: "photo", label: "Passport Size Photograph", required: true },
  { key: "bank_statement", label: "Last 6 Months Bank Statement", required: true },
];

const SALARIED_DOCS: DocChecklistItem[] = [
  { key: "salary_slips", label: "Last 3 Months Salary Slips", required: true, appliesTo: ["SALARIED"] },
  { key: "form16_itr", label: "Form 16 / ITR", required: true, appliesTo: ["SALARIED"] },
  { key: "offer_letter", label: "Offer Letter / Employment Certificate", required: false, appliesTo: ["SALARIED"] },
];

const SELF_EMPLOYED_DOCS: DocChecklistItem[] = [
  {
    key: "itr_2yr",
    label: "Last 2 Years ITR with Computation",
    required: true,
    appliesTo: ["SELF_EMPLOYED_PROFESSIONAL", "SELF_EMPLOYED_BUSINESS"],
  },
  {
    key: "balance_sheet",
    label: "Last 2 Years Balance Sheet & P&L",
    required: true,
    appliesTo: ["SELF_EMPLOYED_PROFESSIONAL", "SELF_EMPLOYED_BUSINESS"],
  },
  {
    key: "gst_returns",
    label: "GST Returns (Last 6 Months)",
    required: false,
    appliesTo: ["SELF_EMPLOYED_PROFESSIONAL", "SELF_EMPLOYED_BUSINESS"],
  },
  {
    key: "business_reg",
    label: "Business Registration Certificate",
    required: true,
    appliesTo: ["SELF_EMPLOYED_PROFESSIONAL", "SELF_EMPLOYED_BUSINESS"],
  },
];

const PROPERTY_DOCS: DocChecklistItem[] = [
  { key: "property_docs", label: "Property Documents", required: true },
  { key: "sale_deed", label: "Sale Deed", required: true },
  { key: "society_noc", label: "NOC from Society", required: false },
  { key: "property_tax", label: "Property Tax Receipt", required: false },
];

function checklist(...groups: DocChecklistItem[][]): DocChecklistItem[] {
  return groups.flat();
}

export interface ProductSeed {
  code: string;
  name: string;
  category: string;
  minAmount: number;
  maxAmount: number;
  processingFeePct: number;
  interestMin: number;
  interestMax: number;
  typicalProcessDays: number;
  docChecklist: DocChecklistItem[];
  sortOrder: number;
}

// Indicative rates/limits reflect the current Indian retail-lending market.
export const PRODUCT_CATALOGUE: ProductSeed[] = [
  {
    code: "SALARIED_PERSONAL",
    name: "Salaried Personal Loan",
    category: "Personal",
    minAmount: 50_000,
    maxAmount: 4_000_000,
    processingFeePct: 2,
    interestMin: 10.5,
    interestMax: 24,
    typicalProcessDays: 3,
    docChecklist: checklist(COMMON_DOCS, SALARIED_DOCS),
    sortOrder: 1,
  },
  {
    code: "SELF_EMPLOYED_PERSONAL",
    name: "Self-Employed Personal Loan",
    category: "Personal",
    minAmount: 50_000,
    maxAmount: 3_000_000,
    processingFeePct: 2.5,
    interestMin: 13,
    interestMax: 26,
    typicalProcessDays: 5,
    docChecklist: checklist(COMMON_DOCS, SELF_EMPLOYED_DOCS),
    sortOrder: 2,
  },
  {
    code: "BUSINESS",
    name: "Business Loan (SME / MSME)",
    category: "Business",
    minAmount: 100_000,
    maxAmount: 50_000_000,
    processingFeePct: 2,
    interestMin: 14,
    interestMax: 24,
    typicalProcessDays: 7,
    docChecklist: checklist(COMMON_DOCS, SELF_EMPLOYED_DOCS),
    sortOrder: 3,
  },
  {
    code: "HOME",
    name: "Home Loan",
    category: "Secured",
    minAmount: 500_000,
    maxAmount: 50_000_000,
    processingFeePct: 0.5,
    interestMin: 8.5,
    interestMax: 12,
    typicalProcessDays: 12,
    docChecklist: checklist(COMMON_DOCS, SALARIED_DOCS, SELF_EMPLOYED_DOCS, PROPERTY_DOCS),
    sortOrder: 4,
  },
  {
    code: "LAP",
    name: "Loan Against Property (LAP)",
    category: "Secured",
    minAmount: 500_000,
    maxAmount: 50_000_000,
    processingFeePct: 1,
    interestMin: 9.5,
    interestMax: 14,
    typicalProcessDays: 12,
    docChecklist: checklist(COMMON_DOCS, SALARIED_DOCS, SELF_EMPLOYED_DOCS, PROPERTY_DOCS),
    sortOrder: 5,
  },
  {
    code: "TWO_WHEELER",
    name: "Two-Wheeler Loan",
    category: "Vehicle",
    minAmount: 20_000,
    maxAmount: 300_000,
    processingFeePct: 2,
    interestMin: 9.5,
    interestMax: 26,
    typicalProcessDays: 2,
    docChecklist: checklist(COMMON_DOCS, SALARIED_DOCS),
    sortOrder: 6,
  },
  {
    code: "FOUR_WHEELER",
    name: "Four-Wheeler Loan",
    category: "Vehicle",
    minAmount: 100_000,
    maxAmount: 10_000_000,
    processingFeePct: 1,
    interestMin: 8.75,
    interestMax: 16,
    typicalProcessDays: 3,
    docChecklist: checklist(COMMON_DOCS, SALARIED_DOCS),
    sortOrder: 7,
  },
  {
    code: "EDUCATION",
    name: "Education Loan",
    category: "Personal",
    minAmount: 50_000,
    maxAmount: 15_000_000,
    processingFeePct: 1,
    interestMin: 8.5,
    interestMax: 15,
    typicalProcessDays: 7,
    docChecklist: checklist(COMMON_DOCS, [
      { key: "admission_letter", label: "Admission Letter", required: true },
      { key: "fee_structure", label: "Fee Structure", required: true },
      { key: "academic_records", label: "Academic Records / Marksheets", required: true },
    ]),
    sortOrder: 8,
  },
  {
    code: "GOLD",
    name: "Gold Loan",
    category: "Secured",
    minAmount: 10_000,
    maxAmount: 5_000_000,
    processingFeePct: 0.5,
    interestMin: 9,
    interestMax: 18,
    typicalProcessDays: 1,
    docChecklist: checklist([
      { key: "pan", label: "PAN Card", required: true },
      { key: "aadhaar_front", label: "Aadhaar Card (Front)", required: true },
      { key: "aadhaar_back", label: "Aadhaar Card (Back)", required: true },
      { key: "photo", label: "Passport Size Photograph", required: true },
    ]),
    sortOrder: 9,
  },
  {
    code: "WORKING_CAPITAL",
    name: "Working Capital Loan",
    category: "Business",
    minAmount: 200_000,
    maxAmount: 50_000_000,
    processingFeePct: 1.5,
    interestMin: 12,
    interestMax: 20,
    typicalProcessDays: 10,
    docChecklist: checklist(COMMON_DOCS, SELF_EMPLOYED_DOCS),
    sortOrder: 10,
  },
  {
    code: "MUDRA_SHISHU",
    name: "Mudra Loan — Shishu",
    category: "Business",
    minAmount: 10_000,
    maxAmount: 50_000,
    processingFeePct: 0,
    interestMin: 9,
    interestMax: 12,
    typicalProcessDays: 7,
    docChecklist: checklist(COMMON_DOCS, [
      { key: "business_proof", label: "Business Proof / Quotation", required: true },
    ]),
    sortOrder: 11,
  },
  {
    code: "MUDRA_KISHOR",
    name: "Mudra Loan — Kishor",
    category: "Business",
    minAmount: 50_000,
    maxAmount: 500_000,
    processingFeePct: 0.5,
    interestMin: 10,
    interestMax: 14,
    typicalProcessDays: 10,
    docChecklist: checklist(COMMON_DOCS, SELF_EMPLOYED_DOCS),
    sortOrder: 12,
  },
  {
    code: "MUDRA_TARUN",
    name: "Mudra Loan — Tarun",
    category: "Business",
    minAmount: 500_000,
    maxAmount: 1_000_000,
    processingFeePct: 0.5,
    interestMin: 11,
    interestMax: 16,
    typicalProcessDays: 12,
    docChecklist: checklist(COMMON_DOCS, SELF_EMPLOYED_DOCS),
    sortOrder: 13,
  },
  {
    code: "KISAN_CREDIT_CARD",
    name: "Kisan Credit Card Loan",
    category: "Agri",
    minAmount: 10_000,
    maxAmount: 2_000_000,
    processingFeePct: 0,
    interestMin: 7,
    interestMax: 9,
    typicalProcessDays: 7,
    docChecklist: checklist([
      { key: "pan", label: "PAN Card", required: false },
      { key: "aadhaar_front", label: "Aadhaar Card (Front)", required: true },
      { key: "aadhaar_back", label: "Aadhaar Card (Back)", required: true },
      { key: "photo", label: "Passport Size Photograph", required: true },
      { key: "land_records", label: "Land Holding Records (7/12, Khatauni)", required: true },
    ]),
    sortOrder: 14,
  },
];

export const PRODUCT_BY_CODE = Object.fromEntries(PRODUCT_CATALOGUE.map((p) => [p.code, p]));
