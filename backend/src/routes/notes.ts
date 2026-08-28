import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { prisma } from "../prisma";
import type { AppEnv } from "../middleware/auth";
import { requireRole } from "../middleware/auth";
import { ok, fail } from "../lib/lms";
import { resolveManageable } from "../lib/access";
import { NoteCreateSchema } from "../types";

const notesRouter = new Hono<AppEnv>();

// Internal team note (never visible to applicants).
notesRouter.post("/", requireRole("SUPER_ADMIN", "WORKER"), zValidator("json", NoteCreateSchema), async (c) => {
  const user = c.get("user")!;
  const input = c.req.valid("json");
  const res = await resolveManageable(user, input.applicationId);
  if (!res.ok) return c.json(fail(res.message, res.code), res.status);

  const note = await prisma.internalNote.create({
    data: { applicationId: input.applicationId, authorId: user.id, body: input.body, tag: input.tag },
    include: { author: { select: { id: true, name: true, role: true } } },
  });
  return c.json(ok(note), 201);
});

export { notesRouter };
