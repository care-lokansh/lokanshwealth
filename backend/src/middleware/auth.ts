import type { Context, Next } from "hono";
import type { Role } from "@prisma/client";
import { auth } from "../auth";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone?: string | null;
  officePhone?: string | null;
  active?: boolean;
};

export type AppEnv = {
  Variables: {
    user: SessionUser | null;
    sessionId: string | null;
  };
};

/** Populates c.get("user") from the Better Auth session cookie on every request. */
export async function sessionMiddleware(c: Context<AppEnv>, next: Next) {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    c.set("user", null);
    c.set("sessionId", null);
  } else {
    c.set("user", session.user as unknown as SessionUser);
    c.set("sessionId", session.session.id);
  }
  await next();
}

/** Blocks unauthenticated requests. */
export async function requireAuth(c: Context<AppEnv>, next: Next) {
  const user = c.get("user");
  if (!user) return c.json({ error: { message: "Authentication required", code: "UNAUTHENTICATED" } }, 401);
  if (user.active === false)
    return c.json({ error: { message: "Account deactivated", code: "ACCOUNT_DISABLED" } }, 403);
  await next();
}

/** Restricts a route to one or more roles. */
export function requireRole(...roles: Role[]) {
  return async (c: Context<AppEnv>, next: Next) => {
    const user = c.get("user");
    if (!user) return c.json({ error: { message: "Authentication required", code: "UNAUTHENTICATED" } }, 401);
    if (!roles.includes(user.role))
      return c.json({ error: { message: "Insufficient permissions", code: "FORBIDDEN" } }, 403);
    await next();
  };
}
