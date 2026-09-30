import { Hono } from "hono";
import type { AppContext } from "../../app-env";
import { createDatabase } from "../../db/client";
import { EventRepository } from "../events/event.repository";
import { EventService } from "../events/event.service";

export const publicRoutes = new Hono<AppContext>();

function createEventService(c: { env: AppContext["Bindings"] }) {
  return new EventService(new EventRepository(createDatabase(c.env)));
}

publicRoutes.get("/events/:slug", async (c) => {
  const slug = c.req.param("slug");

  if (!slug) {
    return c.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Please provide a valid event link."
        }
      },
      400
    );
  }

  const eventService = createEventService(c);
  const event = await eventService.getPublicEvent(slug);

  if (!event) {
    return c.json(
      {
        error: {
          code: "EVENT_NOT_FOUND",
          message: "Invitation was not found or is not published yet."
        }
      },
      404
    );
  }

  return c.json({ data: event });
});
