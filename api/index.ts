import "../backend/src/load-prod-env";
import { app } from "../backend/src/app";

export const config = {
  maxDuration: 30,
};

export default {
  fetch: (request: Request) => app.fetch(request),
};
