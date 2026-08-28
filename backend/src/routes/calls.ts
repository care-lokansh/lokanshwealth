import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { prisma } from "../prisma";
import type { AppEnv } from "../middleware/auth";
import { requireRole } from "../middleware/auth";
import { ok, fail } from "../lib/lms";
import { resolveManageable } from "../lib/access";
import { CallLogCreateSchema } from "../types";

const callsRouter = new Hono<AppEnv>();

// Log a call attempt (worker / admin).
callsRouter.post("/", requireRole("SUPER_ADMIN", "WORKER"), zValidator("json", CallLogCreateSchema), async (c) => {
  const user = c.get("user")!;
  const input = c.req.valid("json");

  const res = await resolveManageable(user, input.applicationId);
  if (!res.ok) return c.json(fail(res.message, res.code), res.status);

  const call = await prisma.callLog.create({
    data: {
      applicationId: input.applicationId,
      workerId: user.id,
      outcome: input.outcome,
      durationMins: input.durationMins ?? 0,
      notes: input.notes,
      followUpAt: input.followUpAt ? new Date(input.followUpAt) : null,
    },
    include: { worker: { select: { id: true, name: true } } },
  });
  return c.json(ok(call), 201);
});

export { callsRouter };
