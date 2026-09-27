import { Hono } from "hono";
import type { AppContext } from "../../app-env";
import { createEventSchema } from "./event.schema";

export const eventRoutes = new Hono<AppContext>();

eventRoutes.post("/", async (c) => {
  const body = await c.req.json();
  const parsed = createEventSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Please check the event details.",
          issues: parsed.error.flatten()
        }
      },
      400
    );
  }

  return c.json(
    {
      data: {
        id: crypto.randomUUID(),
        ...parsed.data,
        status: "draft"
      }
    },
    201
  );
});
