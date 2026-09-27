import { Hono } from "hono";
import type { AppContext } from "../../app-env";

export const healthRoutes = new Hono<AppContext>();

healthRoutes.get("/", (c) =>
  c.json({
    status: "ok",
    service: "invieasy-api",
    environment: c.env.APP_ENV
  })
);
