if (!process.env.VERCEL) {
  await import("@vibecodeapp/proxy");
  await import("./load-prod-env");
}
import { app } from "./app";

const port = Number(process.env.PORT) || 3000;

export { app };

export default {
  port,
  fetch: app.fetch,
};
