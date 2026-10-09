import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { prisma } from "../prisma";
import { auth } from "../auth";
import type { AppEnv } from "../middleware/auth";
import { requireAuth } from "../middleware/auth";
import { ok, fail } from "../lib/lms";
import { MeUpdateSchema, ChangePasswordSchema } from "../types";

const meRouter = new Hono<AppEnv>();

meRouter.use("*", requireAuth);

meRouter.get("/", (c) => {
  const user = c.get("user")!;
  return c.json(ok(user));
});

meRouter.patch("/", zValidator("json", MeUpdateSchema), async (c) => {
  const user = c.get("user")!;
  const input = c.req.valid("json");

  if (input.email && input.email.toLowerCase() !== user.email.toLowerCase()) {
    const taken = await prisma.user.findUnique({ where: { email: input.email } });
    if (taken) return c.json(fail("Email already in use", "EMAIL_TAKEN"), 409);
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone,
    },
    select: { id: true, name: true, email: true, role: true, phone: true, officePhone: true, active: true },
  });
  return c.json(ok(updated));
});

meRouter.post("/password", zValidator("json", ChangePasswordSchema), async (c) => {
  const user = c.get("user")!;
  const { currentPassword, newPassword } = c.req.valid("json");
  const ctx = await auth.$context;
  const account = await prisma.account.findFirst({
    where: { userId: user.id, providerId: "credential" },
  });
  if (!account?.password) return c.json(fail("No password login on this account", "NO_PASSWORD"), 400);

  const valid = await ctx.password.verify({ password: currentPassword, hash: account.password });
  if (!valid) return c.json(fail("Current password is incorrect", "WRONG_PASSWORD"), 400);

  const hash = await ctx.password.hash(newPassword);
  await prisma.account.update({ where: { id: account.id }, data: { password: hash } });
  return c.json(ok({ updated: true }));
});

export { meRouter };
