import { Home, Briefcase, CreditCard, type LucideIcon } from "lucide-react";

export interface LoanType {
  /** Backend product code — links to live rates & document checklist. */
  code: string;
  title: string;
  /** Path to an uploaded vector icon (in /public/loan-icons). */
  iconImage?: string;
  /** Fallback lucide icon when no uploaded image fits. */
  icon?: LucideIcon;
  /** Indicative starting rate shown before live rates load. */
  rate: string;
  blurb: string;
  tag?: string;
}

export const LOAN_TYPES: LoanType[] = [
  {
    code: "SALARIED_PERSONAL",
    title: "Personal Loan",
    iconImage: "/loan-icons/person.png",
    rate: "10.5% p.a.",
    blurb: "Instant funds for weddings, travel or any need — minimal paperwork.",
    tag: "Popular",
  },
  {
    code: "BUSINESS",
    title: "Business Loan",
    icon: Briefcase,
    rate: "14% p.a.",
    blurb: "Working capital and growth funding for MSMEs and startups.",
  },
  {
    code: "HOME",
    title: "Home Loan",
    icon: Home,
    rate: "8.5% p.a.",
    blurb: "Own your dream home with tenures up to 30 years and easy EMIs.",
  },
  {
    code: "LAP",
    title: "Loan Against Property",
    iconImage: "/loan-icons/buildings.png",
    rate: "9.5% p.a.",
    blurb: "Leverage residential or commercial property for high-value funding.",
  },
  {
    code: "EDUCATION",
    title: "Education Loan",
    iconImage: "/loan-icons/education.png",
    rate: "8.5% p.a.",
    blurb: "Fund studies in India or abroad with moratorium till you graduate.",
  },
  {
    code: "FOUR_WHEELER",
    title: "Used Car Loan",
    iconImage: "/loan-icons/car.png",
    rate: "8.75% p.a.",
    blurb: "Pre-owned, fully financed. Quick valuation and same-day approval.",
  },
  {
    code: "GOLD",
    title: "Gold Loan",
    iconImage: "/loan-icons/gold.png",
    rate: "9% p.a.",
    blurb: "Unlock instant cash against your gold with same-day disbursal.",
  },
  {
    code: "TWO_WHEELER",
    title: "Two-Wheeler Loan",
    iconImage: "/loan-icons/motorbike.png",
    rate: "9.5% p.a.",
    blurb: "Ride home your bike or scooter today with quick, low-down-payment financing.",
  },
  {
    code: "CREDIT_CARD",
    title: "Credit Card",
    icon: CreditCard,
    rate: "₹0 joining fee",
    blurb: "Premium rewards, airport lounge access and travel privileges on every spend.",
  },
];

export const LOAN_BY_CODE: Record<string, LoanType> = Object.fromEntries(
  LOAN_TYPES.map((l) => [l.code, l]),
);
