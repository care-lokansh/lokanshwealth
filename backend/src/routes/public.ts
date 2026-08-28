import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { Prisma } from "@prisma/client";
import { prisma } from "../prisma";
import type { AppEnv } from "../middleware/auth";
import { ok, fail, generateArn } from "../lib/lms";
import type { EmploymentType } from "@prisma/client";
import { PRODUCT_BY_CODE } from "../lib/catalogue";
import {
  ARN_REGEX,
  MOBILE_REGEX,
  PublicApplicationSchema,
  TrackQuerySchema,
  type TrackedApplication,
} from "../types";

// Public, UNAUTHENTICATED endpoints used by the marketing website.
const publicRouter = new Hono<AppEnv>();

// ---- Loan products (rates + per-loan document checklist) -------------------
// The marketing site reads live, admin-managed rates from here, so editing a
// product in /app/products instantly updates the public website.
publicRouter.get("/products", async (c) => {
  const products = await prisma.loanProduct.findMany({
    where: { enabled: true },
    orderBy: { sortOrder: "asc" },
    select: {
      code: true,
      name: true,
      category: true,
      minAmount: true,
      maxAmount: true,
      processingFeePct: true,
      interestMin: true,
      interestMax: true,
      typicalProcessDays: true,
      docChecklist: true,
      sortOrder: true,
    },
  });
  return c.json(ok(products));
});

// Best-effort map from the website's free-text employment label to our enum.
function mapEmployment(label?: string): EmploymentType | undefined {
  if (!label) return undefined;
  const l = label.toLowerCase();
  if (l.includes("salar")) return "SALARIED";
  if (l.includes("profession")) return "SELF_EMPLOYED_PROFESSIONAL";
  if (l.includes("business") || l.includes("self")) return "SELF_EMPLOYED_BUSINESS";
  if (l.includes("agri") || l.includes("farm")) return "AGRICULTURIST";
  if (l.includes("pension") || l.includes("retire")) return "PENSIONER";
  return undefined;
}

// ---- Website "Apply Now" submission ----------------------------------------
// Creates an unassigned Application (the shared pool) that every worker sees.
publicRouter.post(
  "/applications",
  zValidator("json", PublicApplicationSchema, (result, c) => {
    if (!result.success) {
      const first = result.error.issues[0];
      const field = first?.path.join(".") || "input";
      // Log the rejected field so failed public submissions are diagnosable.
      console.warn("Public application rejected:", JSON.stringify(result.error.issues));
      return c.json(
        fail(first?.message ? `${first.message} (field: ${field})` : "Invalid submission", "VALIDATION_ERROR"),
        400,
      );
    }
  }),
  async (c) => {
    const input = c.req.valid("json");

  // Accept the loan type if it's a known product code; otherwise still store it.
  const product = PRODUCT_BY_CODE[input.loanType];

  const arn = await generateArn();
  const employmentType = input.employmentType ?? mapEmployment(input.employmentLabel);

  const employment: Prisma.InputJsonValue | undefined =
    input.monthlyIncome != null || input.employmentLabel
      ? { monthlySalary: input.monthlyIncome, raw: input.employmentLabel }
      : undefined;

  try {
    const app = await prisma.application.create({
      data: {
        arn,
        applicantId: null,
        assignedWorkerId: null, // <- lands in the shared pool
        loanType: product?.code ?? input.loanType,
        amount: input.amount,
        tenureMonths: input.tenureMonths ?? 12,
        purpose: input.purpose,
        fullName: input.fullName,
        mobile: input.mobile,
        email: input.email || null,
        pan: input.pan ? input.pan.toUpperCase() : null,
        aadhaar: input.aadhaar || null,
        employmentType: employmentType ?? null,
        employment: employment as any,
        documents: input.documents?.length
          ? {
              create: input.documents.map((d) => ({
                docKey: d.docKey,
                label: d.label,
                fileUrl: d.fileUrl,
                fileName: d.fileName,
              })),
            }
          : undefined,
      },
      select: { id: true, arn: true },
    });

    return c.json(ok({ id: app.id, arn: app.arn }), 201);
  } catch (err) {
    // Never leak a raw 500 to the marketing site — log and return a clean error
    // so the "Apply Now" form can show a friendly retry message.
    console.error("Failed to create public application:", err);
    return c.json(fail("Could not submit your application. Please try again.", "SUBMIT_FAILED"), 500);
  }
});

// ---- Public application tracking -------------------------------------------
// Applicants have no login, so they track files with the mobile number they
// applied with (returns every application for that number) or with a single
// ARN. Only applicant-safe fields are returned — never PAN, Aadhaar, internal
// notes or call logs.

// Simple in-memory throttle so the endpoint can't be used to enumerate numbers.
// Generous enough for the tracking page's 30s auto-refresh (2 hits/min per
// visitor) even when several applicants share one office/mobile-network IP.
const TRACK_WINDOW_MS = 60_000;
const TRACK_MAX_PER_WINDOW = 60;
const trackHits = new Map<string, { count: number; resetAt: number }>();

function throttled(key: string): boolean {
  const now = Date.now();
  const entry = trackHits.get(key);
  if (!entry || now > entry.resetAt) {
    trackHits.set(key, { count: 1, resetAt: now + TRACK_WINDOW_MS });
    // Opportunistic cleanup so the map can't grow unbounded.
    if (trackHits.size > 5000) {
      for (const [k, v] of trackHits) if (now > v.resetAt) trackHits.delete(k);
    }
    return false;
  }
  entry.count += 1;
  return entry.count > TRACK_MAX_PER_WINDOW;
}

/** "Aarav Kumar Sharma" -> "Aarav K. S." so the applicant can confirm it's theirs. */
function maskName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Applicant";
  const [first, ...rest] = parts as [string, ...string[]];
  if (rest.length === 0) return first;
  return [first, ...rest.map((p) => `${p.charAt(0).toUpperCase()}.`)].join(" ");
}

publicRouter.post(
  "/track",
  zValidator("json", TrackQuerySchema, (result, c) => {
    if (!result.success) {
      return c.json(fail("Enter your mobile number or reference number", "VALIDATION_ERROR"), 400);
    }
  }),
  async (c) => {
    const ip =
      c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
      c.req.header("x-real-ip") ||
      "unknown";
    if (throttled(ip)) {
      return c.json(fail("Too many lookups. Please try again in a minute.", "RATE_LIMITED"), 429);
    }

    const raw = c.req.valid("json").query.trim();
    const digits = raw.replace(/\D/g, "");
    // Accept 10-digit, 91-prefixed and +91-prefixed mobile numbers.
    const mobile = digits.length > 10 ? digits.slice(-10) : digits;
    const arn = raw.toUpperCase().replace(/\s+/g, "");

    let where: { mobile: string } | { arn: string };
    if (MOBILE_REGEX.test(mobile)) {
      where = { mobile };
    } else if (ARN_REGEX.test(arn)) {
      where = { arn };
    } else {
      return c.json(
        fail(
          "Enter the 10-digit mobile number you applied with, or a reference number like LMS-2026-123456.",
          "INVALID_QUERY",
        ),
        400,
      );
    }

    const applications = await prisma.application.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 25,
      select: {
        arn: true,
        loanType: true,
        amount: true,
        tenureMonths: true,
        status: true,
        stage: true,
        fullName: true,
        createdAt: true,
        updatedAt: true,
        sanctionedAmount: true,
        interestRate: true,
        emi: true,
        documents: {
          orderBy: { uploadedAt: "asc" },
          select: {
            label: true,
            status: true,
            rejectionReason: true,
            uploadedAt: true,
            reviewedAt: true,
          },
        },
        disbursements: {
          orderBy: { disbursedAt: "asc" },
          select: {
            amount: true,
            mode: true,
            utr: true,
            disbursedAt: true,
            note: true,
          },
        },
        stageHistory: {
          orderBy: { changedAt: "asc" },
          select: { toStage: true, changedAt: true },
        },
        assignedWorker: { select: { name: true, officePhone: true, phone: true } },
      },
    });

    // Product display names come from the live catalogue so renames show up here.
    const codes = [...new Set(applications.map((a) => a.loanType))];
    const products = codes.length
      ? await prisma.loanProduct.findMany({
          where: { code: { in: codes } },
          select: { code: true, name: true },
        })
      : [];
    const nameByCode = new Map(products.map((p) => [p.code, p.name]));

    const results: TrackedApplication[] = applications.map((a) => ({
      arn: a.arn,
      loanType: a.loanType,
      loanTypeName:
        nameByCode.get(a.loanType) ?? PRODUCT_BY_CODE[a.loanType]?.name ?? a.loanType,
      amount: a.amount,
      tenureMonths: a.tenureMonths,
      status: a.status,
      stage: a.stage,
      applicantName: maskName(a.fullName),
      submittedAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
      sanctionedAmount: a.sanctionedAmount,
      interestRate: a.interestRate,
      emi: a.emi,
      documents: a.documents.map((d) => ({
        label: d.label,
        status: d.status,
        rejectionReason: d.status === "REJECTED" ? d.rejectionReason : null,
        uploadedAt: d.uploadedAt.toISOString(),
        // Only a reviewed document has a review date — drives the activity feed.
        reviewedAt: d.status === "PENDING" ? null : (d.reviewedAt?.toISOString() ?? null),
      })),
      disbursements: a.disbursements.map((d) => ({
        amount: d.amount,
        mode: d.mode,
        utr: d.utr,
        disbursedAt: d.disbursedAt.toISOString(),
        note: d.note,
      })),
      // Always start the timeline at submission, then append recorded moves.
      timeline: [
        { stage: "APPLICATION_RECEIVED" as const, at: a.createdAt.toISOString() },
        ...a.stageHistory
          .filter((h) => h.toStage !== "APPLICATION_RECEIVED")
          .map((h) => ({ stage: h.toStage, at: h.changedAt.toISOString() })),
      ],
      manager: a.assignedWorker
        ? {
            name: a.assignedWorker.name,
            phone: a.assignedWorker.officePhone ?? a.assignedWorker.phone ?? null,
          }
        : null,
    }));

    return c.json(ok(results));
  },
);

export { publicRouter };
