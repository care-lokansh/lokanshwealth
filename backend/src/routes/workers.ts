import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { prisma } from "../prisma";
import { auth } from "../auth";
import type { AppEnv } from "../middleware/auth";
import { requireRole } from "../middleware/auth";
import { ok, fail } from "../lib/lms";
import { WorkerCreateSchema, WorkerUpdateSchema, ResetPasswordSchema } from "../types";

const workersRouter = new Hono<AppEnv>();

workersRouter.use("*", requireRole("SUPER_ADMIN"));

// List workers with their current file load.
workersRouter.get("/", async (c) => {
  const workers = await prisma.user.findMany({
    where: { role: "WORKER" },
    orderBy: { createdAt: "asc" },
    select: {
      id: true, name: true, email: true, phone: true, officePhone: true, active: true, createdAt: true,
      _count: { select: { assignedFiles: true } },
    },
  });
  return c.json(ok(workers));
});

// Create a worker account.
workersRouter.post("/", zValidator("json", WorkerCreateSchema), async (c) => {
  const input = c.req.valid("json");
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) return c.json(fail("Email already in use", "EMAIL_TAKEN"), 409);

  try {
    await auth.api.signUpEmail({
      body: { email: input.email, password: input.password, name: input.name },
    });
  } catch {
    return c.json(fail("Could not create account", "SIGNUP_FAILED"), 400);
  }

  const worker = await prisma.user.update({
    where: { email: input.email },
    data: { role: "WORKER", phone: input.phone, officePhone: input.officePhone, emailVerified: true },
    select: { id: true, name: true, email: true, phone: true, officePhone: true, active: true, role: true },
  });
  return c.json(ok(worker), 201);
});

// Update worker profile / activate-deactivate.
workersRouter.patch("/:id", zValidator("json", WorkerUpdateSchema), async (c) => {
  const worker = await prisma.user.findFirst({ where: { id: c.req.param("id"), role: "WORKER" } });
  if (!worker) return c.json(fail("Worker not found", "NOT_FOUND"), 404);
  const updated = await prisma.user.update({
    where: { id: worker.id },
    data: c.req.valid("json"),
    select: { id: true, name: true, email: true, phone: true, officePhone: true, active: true },
  });
  return c.json(ok(updated));
});

// Reset a worker's password.
workersRouter.post("/:id/reset-password", zValidator("json", ResetPasswordSchema), async (c) => {
  const worker = await prisma.user.findFirst({ where: { id: c.req.param("id"), role: "WORKER" } });
  if (!worker) return c.json(fail("Worker not found", "NOT_FOUND"), 404);

  const ctx = await auth.$context;
  const hash = await ctx.password.hash(c.req.valid("json").password);
  await prisma.account.updateMany({
    where: { userId: worker.id, providerId: "credential" },
    data: { password: hash },
  });
  return c.json(ok({ reset: true }));
});

// Per-worker activity log.
workersRouter.get("/:id/activity", async (c) => {
  const id = c.req.param("id");
  const [stageChanges, calls, notes, openFiles] = await Promise.all([
    prisma.stageHistory.findMany({
      where: { changedById: id }, orderBy: { changedAt: "desc" }, take: 20,
      include: { application: { select: { arn: true, fullName: true } } },
    }),
    prisma.callLog.findMany({
      where: { workerId: id }, orderBy: { calledAt: "desc" }, take: 20,
      include: { application: { select: { arn: true, fullName: true } } },
    }),
    prisma.internalNote.findMany({
      where: { authorId: id }, orderBy: { createdAt: "desc" }, take: 20,
      include: { application: { select: { arn: true, fullName: true } } },
    }),
    prisma.application.count({ where: { assignedWorkerId: id, status: { in: ["IN_PROCESS", "APPROVED"] } } }),
  ]);
  return c.json(ok({ stageChanges, calls, notes, openFiles }));
});

export { workersRouter };
