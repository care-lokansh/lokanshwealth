if (!process.env.VERCEL) {
  await import("@vibecodeapp/proxy"); // local / Vibecode only
}
import { app } from "./app";

const port = Number(process.env.PORT) || 3000;

export { app };

export default {
  port,
  fetch: app.fetch,
};
