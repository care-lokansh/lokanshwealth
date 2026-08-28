import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { Prisma } from "@prisma/client";
import { prisma } from "../prisma";
import type { AppEnv, SessionUser } from "../middleware/auth";
import { requireAuth, requireRole } from "../middleware/auth";
import { ok, fail, generateArn } from "../lib/lms";
import { PRODUCT_BY_CODE } from "../lib/catalogue";
import {
  CreateApplicationSchema,
  UpdateApplicationSchema,
  AssignWorkerSchema,
  STAGE_LABELS,
} from "../types";

const applicationsRouter = new Hono<AppEnv>();

const DETAIL_INCLUDE = {
  applicant: { select: { id: true, name: true, email: true, phone: true } },
  assignedWorker: { select: { id: true, name: true, email: true, officePhone: true } },
  documents: { orderBy: { uploadedAt: "asc" } },
  callLogs: { orderBy: { calledAt: "desc" }, include: { worker: { select: { id: true, name: true } } } },
  stageHistory: {
    orderBy: { changedAt: "asc" },
    include: { changedBy: { select: { id: true, name: true } } },
  },
  disbursements: { orderBy: { disbursedAt: "asc" }, include: { createdBy: { select: { id: true, name: true } } } },
  notes: { orderBy: { createdAt: "desc" }, include: { author: { select: { id: true, name: true, role: true } } } },
  communications: { orderBy: { sentAt: "desc" }, include: { sentBy: { select: { id: true, name: true } } } },
} satisfies Prisma.ApplicationInclude;

/**
 * Restricts queries to what a given role may see.
 * Workers: "pool" view = unassigned cases anyone can pick; default = their own.
 */
function scopeFor(user: SessionUser, view?: string): Prisma.ApplicationWhereInput {
  if (user.role === "SUPER_ADMIN") return {};
  if (user.role === "WORKER") {
    return view === "pool" ? { assignedWorkerId: null } : { assignedWorkerId: user.id };
  }
  return { applicantId: user.id };
}

// ---- List (role-aware, filterable, sortable) -------------------------------
applicationsRouter.get("/", requireAuth, async (c) => {
  const user = c.get("user")!;
  const q = c.req.query();

  const where: Prisma.ApplicationWhereInput = { ...scopeFor(user, q.view) };
  const and: Prisma.ApplicationWhereInput[] = [];

  if (q.status) where.status = q.status as any;
  if (q.stage) where.stage = q.stage as any;
  if (q.loanType) where.loanType = q.loanType;
  if (q.workerId) where.assignedWorkerId = q.workerId === "unassigned" ? null : q.workerId;
  if (q.amountMin) and.push({ amount: { gte: Number(q.amountMin) } });
  if (q.amountMax) and.push({ amount: { lte: Number(q.amountMax) } });
  if (q.dateFrom) and.push({ createdAt: { gte: new Date(q.dateFrom) } });
  if (q.dateTo) and.push({ createdAt: { lte: new Date(`${q.dateTo}T23:59:59`) } });
  if (q.q) {
    const term = q.q.trim();
    and.push({
      OR: [
        { arn: { contains: term, mode: "insensitive" } },
        { fullName: { contains: term, mode: "insensitive" } },
        { pan: { contains: term, mode: "insensitive" } },
        { mobile: { contains: term } },
      ],
    });
  }
  if (and.length) where.AND = and;

  const sortField = (q.sort || "createdAt") as string;
  const order = (q.order === "asc" ? "asc" : "desc") as Prisma.SortOrder;
  const allowedSort = ["createdAt", "amount", "fullName", "status", "stage", "loanType", "cibilScore"];
  const orderBy: Prisma.ApplicationOrderByWithRelationInput = allowedSort.includes(sortField)
    ? { [sortField]: order }
    : { createdAt: "desc" };

  const page = Math.max(1, Number(q.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(q.pageSize) || 25));

  const [items, total] = await Promise.all([
    prisma.application.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        assignedWorker: { select: { id: true, name: true } },
        applicant: { select: { id: true, name: true } },
        _count: { select: { documents: true, callLogs: true } },
      },
    }),
    prisma.application.count({ where }),
  ]);

  return c.json(ok({ items, total, page, pageSize }));
});

// ---- Create (applicant submission) -----------------------------------------
applicationsRouter.post("/", requireAuth, zValidator("json", CreateApplicationSchema), async (c) => {
  const user = c.get("user")!;
  const input = c.req.valid("json");

  const product = PRODUCT_BY_CODE[input.loanType];
  if (!product) return c.json(fail("Unknown loan type", "INVALID_LOAN_TYPE"), 400);

  const arn = await generateArn();

  const app = await prisma.application.create({
    data: {
      arn,
      applicantId: user.role === "APPLICANT" ? user.id : null,
      loanType: input.loanType,
      amount: input.amount,
      tenureMonths: input.tenureMonths,
      purpose: input.purpose,
      existingEmi: input.existingEmi ?? 0,
      existingOutstanding: input.existingOutstanding ?? 0,
      fullName: input.fullName,
      fatherName: input.fatherName,
      dob: input.dob ? new Date(input.dob) : null,
      gender: input.gender,
      maritalStatus: input.maritalStatus,
      mobile: input.mobile,
      email: input.email || null,
      currentAddress: input.currentAddress,
      currentPincode: input.currentPincode || null,
      permanentAddress: input.permanentAddress,
      city: input.city,
      state: input.state,
      residentialStatus: input.residentialStatus,
      pan: input.pan ? input.pan.toUpperCase() : null,
      aadhaar: input.aadhaar || null,
      employmentType: input.employmentType,
      employment: (input.employment ?? undefined) as any,
      stageHistory: {
        create: { toStage: "APPLICATION_RECEIVED", reason: "Application submitted", changedById: user.id },
      },
      communications: {
        create: {
          channel: "SMS",
          template: "APPLICATION_RECEIVED",
          body: `Dear ${input.fullName}, your loan application ${arn} has been received. Our team will contact you shortly. - Lokansh Wealth`,
          status: "SENT",
          sentById: user.id,
        },
      },
    },
  });

  return c.json(ok(app), 201);
});

// ---- Claim a pooled case (worker picks it up) -------------------------------
// Atomic: the updateMany only matches while still unassigned, so if two workers
// click at the same moment exactly one wins; the other gets 409 ALREADY_CLAIMED.
applicationsRouter.post("/:id/claim", requireRole("SUPER_ADMIN", "WORKER"), async (c) => {
  const user = c.get("user")!;
  const id = c.req.param("id");

  const res = await prisma.application.updateMany({
    where: { id, assignedWorkerId: null },
    data: { assignedWorkerId: user.id },
  });

  if (res.count === 0) {
    const existing = await prisma.application.findUnique({
      where: { id },
      select: { assignedWorkerId: true, assignedWorker: { select: { name: true } } },
    });
    if (!existing) return c.json(fail("Application not found", "NOT_FOUND"), 404);
    const by = existing.assignedWorker?.name ?? "another worker";
    return c.json(fail(`Already picked by ${by}`, "ALREADY_CLAIMED"), 409);
  }

  const app = await prisma.application.findUnique({ where: { id } });
  return c.json(ok(app));
});

// ---- Detail (role-aware) ----------------------------------------------------
applicationsRouter.get("/:id", requireAuth, async (c) => {
  const user = c.get("user")!;
  const app = await prisma.application.findUnique({ where: { id: c.req.param("id") }, include: DETAIL_INCLUDE });
  if (!app) return c.json(fail("Application not found", "NOT_FOUND"), 404);

  // Workers may view the unassigned pool (to decide whether to pick it) and
  // their own files — but not files another worker has already claimed.
  if (user.role === "WORKER" && app.assignedWorkerId && app.assignedWorkerId !== user.id)
    return c.json(fail("This case is being handled by another worker", "FORBIDDEN"), 403);
  if (user.role === "APPLICANT" && app.applicantId !== user.id)
    return c.json(fail("Forbidden", "FORBIDDEN"), 403);

  return c.json(ok(app));
});

// ---- Update (admin) ---------------------------------------------------------
applicationsRouter.patch(
  "/:id",
  requireRole("SUPER_ADMIN"),
  zValidator("json", UpdateApplicationSchema),
  async (c) => {
    const input = c.req.valid("json");
    const data: Prisma.ApplicationUpdateInput = { ...input } as any;
    if (input.dob) (data as any).dob = new Date(input.dob);
    if (input.pan) (data as any).pan = input.pan.toUpperCase();
    if (input.employment) (data as any).employment = input.employment as any;
    if (input.email === "") (data as any).email = null;

    const app = await prisma.application.update({ where: { id: c.req.param("id") }, data });
    return c.json(ok(app));
  }
);

// ---- Bulk assign worker (admin) --------------------------------------------
applicationsRouter.post(
  "/assign",
  requireRole("SUPER_ADMIN"),
  zValidator("json", AssignWorkerSchema),
  async (c) => {
    const { applicationIds, workerId } = c.req.valid("json");
    if (workerId) {
      const worker = await prisma.user.findFirst({ where: { id: workerId, role: "WORKER" } });
      if (!worker) return c.json(fail("Worker not found", "NOT_FOUND"), 404);
    }
    const res = await prisma.application.updateMany({
      where: { id: { in: applicationIds } },
      data: { assignedWorkerId: workerId },
    });
    return c.json(ok({ updated: res.count }));
  }
);

// ---- CSV export (admin) -----------------------------------------------------
applicationsRouter.get("/export/csv", requireRole("SUPER_ADMIN"), async (c) => {
  const q = c.req.query();
  const and: Prisma.ApplicationWhereInput[] = [];
  if (q.dateFrom) and.push({ createdAt: { gte: new Date(q.dateFrom) } });
  if (q.dateTo) and.push({ createdAt: { lte: new Date(`${q.dateTo}T23:59:59`) } });
  const where: Prisma.ApplicationWhereInput = and.length ? { AND: and } : {};

  const apps = await prisma.application.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { assignedWorker: { select: { name: true } } },
  });

  const headers = [
    "ARN", "Applicant Name", "Loan Type", "Amount", "PAN", "Mobile", "CIBIL",
    "Stage", "Status", "Assigned Worker", "Sanctioned", "Date Received",
  ];
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = apps.map((a) =>
    [
      a.arn, a.fullName, PRODUCT_BY_CODE[a.loanType]?.name ?? a.loanType, a.amount, a.pan ?? "",
      a.mobile, a.cibilScore ?? "", STAGE_LABELS[a.stage], a.status, a.assignedWorker?.name ?? "Unassigned",
      a.sanctionedAmount ?? "", a.createdAt.toISOString().slice(0, 10),
    ].map(esc).join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="applications-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
});

export { applicationsRouter };
