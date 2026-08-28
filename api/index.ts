export const config = {
  maxDuration: 30,
};

export default {
  async fetch(request: Request) {
    try {
      const missing = ["DATABASE_URL", "BETTER_AUTH_SECRET"].filter((k) => !process.env[k]);
      if (missing.length) {
        return Response.json(
          { error: `Missing Vercel env: ${missing.join(", ")}` },
          { status: 500 },
        );
      }
      const { app } = await import("../backend/src/app");
      return app.fetch(request);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return Response.json({ error: message }, { status: 500 });
    }
  },
};
