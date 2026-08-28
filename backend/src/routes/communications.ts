import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { prisma } from "../prisma";
import type { AppEnv } from "../middleware/auth";
import { requireRole } from "../middleware/auth";
import { ok, fail } from "../lib/lms";
import { resolveManageable } from "../lib/access";
import { CommunicationCreateSchema } from "../types";

const communicationsRouter = new Hono<AppEnv>();

// Send (simulate) an applicant communication and log it.
communicationsRouter.post(
  "/",
  requireRole("SUPER_ADMIN", "WORKER"),
  zValidator("json", CommunicationCreateSchema),
  async (c) => {
    const user = c.get("user")!;
    const input = c.req.valid("json");
    const res = await resolveManageable(user, input.applicationId);
    if (!res.ok) return c.json(fail(res.message, res.code), res.status);

    const comm = await prisma.communication.create({
      data: {
        applicationId: input.applicationId,
        channel: input.channel,
        template: input.template,
        subject: input.subject,
        body: input.body,
        status: "SENT", // simulated delivery
        sentById: user.id,
      },
      include: { sentBy: { select: { id: true, name: true } } },
    });
    return c.json(ok(comm), 201);
  }
);

export { communicationsRouter };
