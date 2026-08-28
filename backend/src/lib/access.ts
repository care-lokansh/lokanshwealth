import type { Application } from "@prisma/client";
import { prisma } from "../prisma";
import type { SessionUser } from "../middleware/auth";

type ManageOk = { ok: true; app: Application };
type ManageErr = { ok: false; message: string; code: string; status: 403 | 404 };

/**
 * Resolves an application the given staff user is allowed to manage.
 * SUPER_ADMIN can manage any; WORKER only files assigned to them.
 */
export async function resolveManageable(
  user: SessionUser,
  applicationId: string
): Promise<ManageOk | ManageErr> {
  const app = await prisma.application.findUnique({ where: { id: applicationId } });
  if (!app) return { ok: false, message: "Application not found", code: "NOT_FOUND", status: 404 };
  if (user.role === "SUPER_ADMIN") return { ok: true, app };
  if (user.role === "WORKER" && app.assignedWorkerId === user.id) return { ok: true, app };
  return { ok: false, message: "Not permitted on this application", code: "FORBIDDEN", status: 403 };
}
