import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { prisma } from "../prisma";
import type { AppEnv } from "../middleware/auth";
import { requireAuth, requireRole } from "../middleware/auth";
import { ok, fail } from "../lib/lms";
import { resolveManageable } from "../lib/access";
import { DocumentCreateSchema, DocumentReviewSchema } from "../types";

const documentsRouter = new Hono<AppEnv>();

// Upload metadata (file already stored in object storage; we persist the record).
documentsRouter.post("/", requireAuth, zValidator("json", DocumentCreateSchema), async (c) => {
  const user = c.get("user")!;
  const input = c.req.valid("json");

  const app = await prisma.application.findUnique({ where: { id: input.applicationId } });
  if (!app) return c.json(fail("Application not found", "NOT_FOUND"), 404);

  // Applicants may upload to their own file; staff to files they manage.
  const isOwner = user.role === "APPLICANT" && app.applicantId === user.id;
  const isStaff =
    user.role === "SUPER_ADMIN" || (user.role === "WORKER" && app.assignedWorkerId === user.id);
  if (!isOwner && !isStaff) return c.json(fail("Forbidden", "FORBIDDEN"), 403);

  const doc = await prisma.document.create({
    data: {
      applicationId: input.applicationId,
      docKey: input.docKey,
      label: input.label,
      fileUrl: input.fileUrl,
      fileName: input.fileName,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
    },
  });
  return c.json(ok(doc), 201);
});

// Worker / admin reviews a document.
documentsRouter.patch(
  "/:id/review",
  requireRole("SUPER_ADMIN", "WORKER"),
  zValidator("json", DocumentReviewSchema),
  async (c) => {
    const user = c.get("user")!;
    const doc = await prisma.document.findUnique({ where: { id: c.req.param("id") } });
    if (!doc) return c.json(fail("Document not found", "NOT_FOUND"), 404);

    const res = await resolveManageable(user, doc.applicationId);
    if (!res.ok) return c.json(fail(res.message, res.code), res.status);

    const { status, rejectionReason } = c.req.valid("json");
    const updated = await prisma.document.update({
      where: { id: doc.id },
      data: {
        status,
        rejectionReason: status === "REJECTED" ? rejectionReason ?? "Not specified" : null,
        reviewedById: user.id,
        reviewedAt: new Date(),
      },
    });
    return c.json(ok(updated));
  }
);

documentsRouter.delete("/:id", requireRole("SUPER_ADMIN", "WORKER"), async (c) => {
  const user = c.get("user")!;
  const doc = await prisma.document.findUnique({ where: { id: c.req.param("id") } });
  if (!doc) return c.json(fail("Document not found", "NOT_FOUND"), 404);
  const res = await resolveManageable(user, doc.applicationId);
  if (!res.ok) return c.json(fail(res.message, res.code), res.status);
  await prisma.document.delete({ where: { id: doc.id } });
  return c.body(null, 204);
});

export { documentsRouter };
