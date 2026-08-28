import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import "./env";
import { auth } from "./auth";
import { prisma } from "./prisma";
import { sessionMiddleware, type AppEnv } from "./middleware/auth";

import { meRouter } from "./routes/me";
import { applicationsRouter } from "./routes/applications";
import { documentsRouter } from "./routes/documents";
import { callsRouter } from "./routes/calls";
import { stagesRouter } from "./routes/stages";
import { financialsRouter } from "./routes/financials";
import { notesRouter } from "./routes/notes";
import { communicationsRouter } from "./routes/communications";
import { productsRouter } from "./routes/products";
import { workersRouter } from "./routes/workers";
import { analyticsRouter } from "./routes/analytics";
import { publicRouter } from "./routes/public";

const app = new Hono<AppEnv>();

const allowed = [
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
  /^https:\/\/(www\.)?lokanshwealth\.com$/,
  /^https:\/\/lokanshwealth\.vercel\.app$/,
  /^https:\/\/[a-z0-9-]+\.vercel\.app$/,
  /^https:\/\/[a-z0-9-]+\.dev\.vibecode\.run$/,
  /^https:\/\/[a-z0-9-]+\.vibecode\.run$/,
  /^https:\/\/[a-z0-9-]+\.vibecodeapp\.com$/,
  /^https:\/\/[a-z0-9-]+\.vibecode\.dev$/,
  /^https:\/\/vibecode\.dev$/,
];

app.use(
  "*",
  cors({
    origin: (origin) => (origin && allowed.some((re) => re.test(origin)) ? origin : null),
    credentials: true,
  }),
);

app.use("*", logger());

app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));
app.use("*", sessionMiddleware);

app.get("/health", (c) => c.json({ status: "ok" }));
app.get("/api/health", async (c) => {
  const missing = ["DATABASE_URL", "BETTER_AUTH_SECRET"].filter((k) => !process.env[k]);
  if (missing.length) {
    return c.json({ status: "misconfigured", missing }, 500);
  }
  try {
    const admin = await prisma.user.findUnique({
      where: { email: "admin@lokansh.in" },
      select: { id: true },
    });
    return c.json({ status: "ok", adminExists: Boolean(admin) });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return c.json({ status: "db_error", message }, 500);
  }
});

app.route("/api/v1/public", publicRouter);
app.route("/api/v1/me", meRouter);
app.route("/api/v1/applications", applicationsRouter);
app.route("/api/v1/documents", documentsRouter);
app.route("/api/v1/calls", callsRouter);
app.route("/api/v1/stages", stagesRouter);
app.route("/api/v1/financials", financialsRouter);
app.route("/api/v1/notes", notesRouter);
app.route("/api/v1/communications", communicationsRouter);
app.route("/api/v1/products", productsRouter);
app.route("/api/v1/workers", workersRouter);
app.route("/api/v1/analytics", analyticsRouter);

export { app };
