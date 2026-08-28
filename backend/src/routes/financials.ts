import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { prisma } from "../prisma";
import type { AppEnv } from "../middleware/auth";
import { requireRole } from "../middleware/auth";
import { ok, fail } from "../lib/lms";
import { resolveManageable } from "../lib/access";
import { FinancialsUpdateSchema, DisbursementCreateSchema, calculateEmi } from "../types";

const financialsRouter = new Hono<AppEnv>();

// Update sanctioned terms + disbursement account. EMI is auto-recomputed.
financialsRouter.patch(
  "/:applicationId",
  requireRole("SUPER_ADMIN", "WORKER"),
  zValidator("json", FinancialsUpdateSchema),
  async (c) => {
    const user = c.get("user")!;
    const applicationId = c.req.param("applicationId");
    const res = await resolveManageable(user, applicationId);
    if (!res.ok) return c.json(fail(res.message, res.code), res.status);
    const app = res.app;

    const input = c.req.valid("json");
    const sanctioned = input.sanctionedAmount ?? app.sanctionedAmount ?? null;
    const rate = input.interestRate ?? app.interestRate ?? null;
    const emi =
      sanctioned && rate != null ? calculateEmi(sanctioned, rate, app.tenureMonths) : app.emi ?? null;

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: {
        sanctionedAmount: input.sanctionedAmount ?? undefined,
        interestRate: input.interestRate ?? undefined,
        processingFee: input.processingFee ?? undefined,
        emi,
        dpBankName: input.dpBankName,
        dpAccountNumber: input.dpAccountNumber,
        dpIfsc: input.dpIfsc ? input.dpIfsc.toUpperCase() : input.dpIfsc === "" ? null : undefined,
        dpAccountHolder: input.dpAccountHolder,
      },
    });
    return c.json(ok(updated));
  }
);

// Add a disbursement tranche.
financialsRouter.post(
  "/disbursement",
  requireRole("SUPER_ADMIN", "WORKER"),
  zValidator("json", DisbursementCreateSchema),
  async (c) => {
    const user = c.get("user")!;
    const input = c.req.valid("json");
    const res = await resolveManageable(user, input.applicationId);
    if (!res.ok) return c.json(fail(res.message, res.code), res.status);

    const tranche = await prisma.disbursement.create({
      data: {
        applicationId: input.applicationId,
        amount: input.amount,
        mode: input.mode,
        utr: input.utr,
        disbursedAt: new Date(input.disbursedAt),
        note: input.note,
        createdById: user.id,
      },
      include: { createdBy: { select: { id: true, name: true } } },
    });
    return c.json(ok(tranche), 201);
  }
);

financialsRouter.delete("/disbursement/:id", requireRole("SUPER_ADMIN", "WORKER"), async (c) => {
  const user = c.get("user")!;
  const tranche = await prisma.disbursement.findUnique({ where: { id: c.req.param("id") } });
  if (!tranche) return c.json(fail("Disbursement not found", "NOT_FOUND"), 404);
  const res = await resolveManageable(user, tranche.applicationId);
  if (!res.ok) return c.json(fail(res.message, res.code), res.status);
  await prisma.disbursement.delete({ where: { id: tranche.id } });
  return c.body(null, 204);
});

export { financialsRouter };
