export const config = {
  maxDuration: 30,
};

export default {
  async fetch(request: Request) {
    try {
      const mod = await import("./_app.js");
      return await mod.app.fetch(request);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const stack = err instanceof Error ? err.stack : undefined;
      return Response.json({ error: message, stack }, { status: 500 });
    }
  },
};
