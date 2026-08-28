import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { AppStatus } from "@prisma/client";
import { prisma } from "../prisma";
import type { AppEnv } from "../middleware/auth";
import { requireRole } from "../middleware/auth";
import { ok, fail } from "../lib/lms";
import { resolveManageable } from "../lib/access";
import { StageChangeSchema, STAGE_ORDER, type Stage } from "../types";

const stagesRouter = new Hono<AppEnv>();

const APPROVED_STAGES: Stage[] = [
  "SANCTION_LETTER_ISSUED",
  "LEGAL_TECHNICAL_VERIFICATION",
  "AGREEMENT_SIGNING",
  "DISBURSEMENT_INITIATED",
];

function statusForStage(stage: Stage, current: AppStatus): AppStatus {
  if (current === "REJECTED") return "REJECTED"; // rejections are sticky
  if (stage === "DISBURSED") return "DISBURSED";
  if (APPROVED_STAGES.includes(stage)) return "APPROVED";
  if (stage === "CLOSED") return current;
  return "IN_PROCESS";
}

// Move a file one stage forward/backward, with a mandatory reason (auto-logged).
stagesRouter.post("/change", requireRole("SUPER_ADMIN", "WORKER"), zValidator("json", StageChangeSchema), async (c) => {
  const user = c.get("user")!;
  const { applicationId, toStage, reason } = c.req.valid("json");

  const res = await resolveManageable(user, applicationId);
  if (!res.ok) return c.json(fail(res.message, res.code), res.status);
  const app = res.app;

  const fromIdx = STAGE_ORDER.indexOf(app.stage as Stage);
  const toIdx = STAGE_ORDER.indexOf(toStage);
  if (toIdx === fromIdx) return c.json(fail("File is already at this stage", "NO_CHANGE"), 400);
  if (Math.abs(toIdx - fromIdx) !== 1)
    return c.json(fail("Files move one stage at a time", "INVALID_TRANSITION"), 400);

  const [updated] = await prisma.$transaction([
    prisma.application.update({
      where: { id: applicationId },
      data: { stage: toStage, status: statusForStage(toStage, app.status) },
    }),
    prisma.stageHistory.create({
      data: { applicationId, fromStage: app.stage, toStage, reason, changedById: user.id },
    }),
  ]);

  return c.json(ok(updated));
});

export { stagesRouter };
