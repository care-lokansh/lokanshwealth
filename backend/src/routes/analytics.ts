import { Hono } from "hono";
import { prisma } from "../prisma";
import type { AppEnv } from "../middleware/auth";
import { requireRole } from "../middleware/auth";
import { ok } from "../lib/lms";

const analyticsRouter = new Hono<AppEnv>();

analyticsRouter.use("*", requireRole("SUPER_ADMIN"));

const DAY_MS = 1000 * 60 * 60 * 24;

analyticsRouter.get("/summary", async (c) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalThisMonth,
    totalAll,
    inPool,
    taken,
    approvedAll,
    disbursedTranches,
    byLoanTypeRaw,
    byStageRaw,
    disbursedApps,
    workers,
    topPending,
  ] = await Promise.all([
    prisma.application.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.application.count(),
    prisma.application.count({ where: { assignedWorkerId: null } }),
    prisma.application.count({ where: { assignedWorkerId: { not: null } } }),
    prisma.application.count({ where: { status: { in: ["APPROVED", "DISBURSED"] } } }),
    prisma.disbursement.findMany({
      where: { disbursedAt: { gte: monthStart } },
      select: { amount: true },
    }),
    prisma.application.groupBy({ by: ["loanType"], _count: { _all: true }, _sum: { amount: true } }),
    prisma.application.groupBy({ by: ["stage"], _count: { _all: true } }),
    prisma.application.findMany({
      where: { status: "DISBURSED" },
      select: { createdAt: true, updatedAt: true },
    }),
    prisma.user.findMany({
      where: { role: "WORKER" },
      select: {
        id: true, name: true,
        _count: { select: { assignedFiles: true } },
      },
    }),
    prisma.application.findMany({
      where: { status: "IN_PROCESS" },
      orderBy: { createdAt: "asc" },
      take: 5,
      select: { id: true, arn: true, fullName: true, loanType: true, amount: true, stage: true, createdAt: true,
        assignedWorker: { select: { name: true } } },
    }),
  ]);

  const disbursedThisMonth = disbursedTranches.reduce((s, d) => s + d.amount, 0);
  const approvalRate = totalAll ? Math.round((approvedAll / totalAll) * 1000) / 10 : 0;
  const avgProcessingDays = disbursedApps.length
    ? Math.round(
        (disbursedApps.reduce((s, a) => s + (a.updatedAt.getTime() - a.createdAt.getTime()) / DAY_MS, 0) /
          disbursedApps.length) * 10
      ) / 10
    : 0;

  // Worker productivity: disbursed count + avg TAT per worker.
  const workerProductivity = await Promise.all(
    workers.map(async (w) => {
      const done = await prisma.application.findMany({
        where: { assignedWorkerId: w.id, status: "DISBURSED" },
        select: { createdAt: true, updatedAt: true },
      });
      const avgTat = done.length
        ? Math.round(
            (done.reduce((s, a) => s + (a.updatedAt.getTime() - a.createdAt.getTime()) / DAY_MS, 0) /
              done.length) * 10
          ) / 10
        : 0;
      return { id: w.id, name: w.name, assigned: w._count.assignedFiles, disbursed: done.length, avgTat };
    })
  );

  const byLoanType = byLoanTypeRaw
    .map((r) => ({ loanType: r.loanType, count: r._count._all, amount: r._sum.amount ?? 0 }))
    .sort((a, b) => b.count - a.count);
  const byStage = byStageRaw.map((r) => ({ stage: r.stage, count: r._count._all }));

  const topPendingAged = topPending.map((a) => ({
    ...a,
    ageDays: Math.floor((now.getTime() - a.createdAt.getTime()) / DAY_MS),
  }));

  return c.json(
    ok({
      totalThisMonth,
      totalAll,
      inPool,
      taken,
      disbursedThisMonth,
      approvalRate,
      avgProcessingDays,
      byLoanType,
      byStage,
      workerProductivity,
      topPending: topPendingAged,
    })
  );
});

export { analyticsRouter };
