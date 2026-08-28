# Lokansh Wealth — Loan Disbursement Management System (LMS)

A premium loan-operations console for the Indian market — Zerodha/Razorpay-style data-dense UI,
warm cream canvas with a saffron accent, Hindi/English micro-copy, INR lakh/crore formatting,
DD/MM/YYYY dates, and PAN/Aadhaar/IFSC/mobile validation throughout.

The public marketing site lives at `/` and `/calculator`. The operations console lives under `/app`.

## Roles & screens
- **Super Admin** — Dashboard (`/app/admin`), Analytics (`/app/analytics`), all Files,
  Workers management (`/app/workers`), Loan Products config (`/app/products`), CSV export.
- **Worker** — Files assigned to them + full file detail (7 tabs).
- **Applicant** — 5-step application flow (`/app/apply`) and tracking portal (`/app/track`).

## File detail — 7 tabs (`/app/files/:id`)
1. **Overview** — personal, address, KYC, employment, loan details (admin can edit).
2. **Documents** — grid with per-document Verify / Reject (with reason).
3. **Call Log** — timeline + "Log New Call" (outcome, duration, notes, follow-up).
4. **Pipeline** — 12-stage horizontal pipeline; move forward/back one stage with a mandatory reason; full history.
5. **Financials** — sanction terms, auto EMI (reducing balance), disbursement account, multi-tranche disbursements.
6. **Notes** — internal team notes with Urgent / Follow-up / Escalated tags.
7. **Communication** — SMS / WhatsApp / Email templates (simulated send) + delivery log.

## Tech
- **Frontend** (`webapp/`) — React + Vite, React Router, React Query, Tailwind + shadcn/ui.
  LMS code under `src/pages/lms/`, `src/components/lms/`. Shared formatters/types in `src/lib/lms.ts`.
- **Backend** (`backend/`) — Hono + Prisma (Postgres) + Better Auth (role-based). Routes under
  `/api/v1/*`. API contracts are Zod schemas in `backend/src/types.ts` (single source of truth).
- Document uploads use Supabase storage (per-application folders) when `VITE_SUPABASE_URL` /
  `VITE_SUPABASE_ANON_KEY` are set; the apply flow degrades gracefully without them.

## Loan products
Salaried/Self-Employed Personal, Business (SME/MSME), Home, LAP, Two/Four-Wheeler, Education,
Gold, Working Capital, Mudra (Shishu/Kishor/Tarun) and Kisan Credit Card — each with its own
document checklist, indicative rate range and typical TAT, configurable in the Products screen.
