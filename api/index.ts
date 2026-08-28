import { app } from "./_app.js";

export const config = {
  maxDuration: 30,
};

export default {
  async fetch(request: Request) {
    try {
      return await app.fetch(request);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return Response.json({ error: message }, { status: 500 });
    }
  },
};
