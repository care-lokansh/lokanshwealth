import "@vibecodeapp/proxy"; // DO NOT REMOVE OTHERWISE VIBECODE PROXY WILL NOT WORK
import "./load-prod-env"; // MUST be first: production env override that survives template upgrades
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import "./env";
import { auth } from "./auth";
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

// CORS middleware - validates origin against allowlist
const allowed = [
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
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
  })
);

app.use("*", logger());

// Better Auth handler (owns its own response shape — no envelope)
app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

// Populate user/session on every request
app.use("*", sessionMiddleware);

// Health check
app.get("/health", (c) => c.json({ status: "ok" }));

// LMS API (all routes under /api/v1)
app.route("/api/v1/public", publicRouter); // unauthenticated website submissions
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

// LMS API server — Lokansh Wealth loan operations
const port = Number(process.env.PORT) || 3000;

export default {
  port,
  fetch: app.fetch,
};
