import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { prisma } from "../prisma";
import type { AppEnv } from "../middleware/auth";
import { requireRole } from "../middleware/auth";
import { ok, fail } from "../lib/lms";
import { ProductUpdateSchema } from "../types";

const productsRouter = new Hono<AppEnv>();

// List loan products. Admins see all (incl. disabled); everyone else sees enabled only.
productsRouter.get("/", async (c) => {
  const user = c.get("user");
  const where = user?.role === "SUPER_ADMIN" ? {} : { enabled: true };
  const products = await prisma.loanProduct.findMany({ where, orderBy: { sortOrder: "asc" } });
  return c.json(ok(products));
});

// Update product configuration (admin).
productsRouter.patch("/:code", requireRole("SUPER_ADMIN"), zValidator("json", ProductUpdateSchema), async (c) => {
  const input = c.req.valid("json");
  if (input.minAmount && input.maxAmount && input.minAmount > input.maxAmount)
    return c.json(fail("Minimum amount cannot exceed maximum", "INVALID_RANGE"), 400);
  if (input.interestMin && input.interestMax && input.interestMin > input.interestMax)
    return c.json(fail("Minimum rate cannot exceed maximum", "INVALID_RANGE"), 400);

  try {
    const product = await prisma.loanProduct.update({ where: { code: c.req.param("code") }, data: input });
    return c.json(ok(product));
  } catch {
    return c.json(fail("Product not found", "NOT_FOUND"), 404);
  }
});

export { productsRouter };
