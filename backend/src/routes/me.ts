import { Hono } from "hono";
import type { AppEnv } from "../middleware/auth";
import { requireAuth } from "../middleware/auth";
import { ok } from "../lib/lms";

const meRouter = new Hono<AppEnv>();

meRouter.get("/", requireAuth, (c) => {
  const user = c.get("user")!;
  return c.json(ok(user));
});

export { meRouter };
