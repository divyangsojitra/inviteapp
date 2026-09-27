import { Hono } from "hono";
import type { AppContext } from "./app-env";
import { healthRoutes } from "./modules/health/health.routes";
import { eventRoutes } from "./modules/events/event.routes";

const app = new Hono<AppContext>();

app.route("/v1/health", healthRoutes);
app.route("/v1/events", eventRoutes);

app.notFound((c) =>
  c.json(
    {
      error: {
        code: "NOT_FOUND",
        message: "The requested resource was not found."
      }
    },
    404
  )
);

app.onError((error, c) => {
  console.error(error);

  return c.json(
    {
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong."
      }
    },
    500
  );
});

export default app;
