const { existsSync } = require("node:fs");
const { join } = require("node:path");

function enginePath() {
  const name = "libquery_engine-rhel-openssl-3.0.x.so.node";
  const candidates = [
    join(process.cwd(), "backend/generated/client", name),
    join("/var/task/backend/generated/client", name),
    join("/var/task/api", name),
  ];
  return candidates.find((p) => existsSync(p));
}

module.exports = {
  async fetch(request) {
    try {
      const engine = enginePath();
      if (engine) process.env.PRISMA_QUERY_ENGINE_LIBRARY = engine;
      const { app } = require("./_app.cjs");
      return await app.fetch(request);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const stack = err instanceof Error ? err.stack : undefined;
      return Response.json({ error: message, stack }, { status: 500 });
    }
  },
};
